---
title: "Cloudflare PagesのリソースをTerraform管理する"
date: 2023-12-31T19:47:25+09:00
draft: false
tags: ["Cloudflare-Pages", "terraform", "hugo"]
---

このブログはCloudflare Pages + Hugoでホスティングしているのですが、Hugoのバージョンを変えるなどCloudflare Pages側の設定をいじるタイミングがちょこちょこ発生します。  
もう少しCloudflare色々触ってみたかったので、stateをR2で管理しながらPagesのリソースをTerraform管理してみます。

# R2 bucket作成からアクセスまで

まずはR2のbucket作成します。  
無料枠でもクレジットカード or Paypalの登録が必要です。

登録したらbucket作成し、R2専用のAPI Tokenも作成します。

Bucket作成

![img][link1]

API Token作成

![img][link2]

Token作成後にapi key, secretが作成されるので、以下のリンクを参考にクレデンシャルの設定と疎通確認をします。

[Configure aws CLI for R2][link3]

```bash
% cat .aws/config
[cloudflare]
region = auto

% cat .aws/credentials
[cloudflare]
aws_access_key_id = key
aws_secret_access_key = secret

% aws s3api list-objects-v2 --endpoint-url https://[accountid].r2.cloudflarestorage.com --profile cloudflare --bucket tfstate
{
    "RequestCharged": null
}
```

# terraform backendの設定

基本的には以下の記事を参考に進めました。

[Cloudflare R2でTerraformのStateを管理する方法: Cloudflare Meetup Nagano Vol.2 に登壇しました](https://future-architect.github.io/articles/20231016a/)

ただしTerraform v1.6以降だと `NotImplemented: STREAMING-UNSIGNED-PAYLOAD-TRAILER` のエラーが発生するなど少し挙動が変わっているため、以下の二行も追加してあげます。

ref: [Support Cloudflare r2 for storing Terraform state][link4]

```hcl
    skip_requesting_account_id  = true
    skip_s3_checksum            = true
```

最終的な設定は以下です。

```hcl
terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }

  backend "s3" {
    bucket                      = "tfstate"
    key                         = "default.tfstate"
    region                      = "us-east-1"
    profile                     = "cloudflare"
    endpoints                   = { s3 = "https://[accountid].r2.cloudflarestorage.com" }
    skip_credentials_validation = true
    skip_requesting_account_id  = true
    skip_s3_checksum            = true
  }
}
```

その後にinitを実行し疎通確認します。

```bash
% terraform init

Initializing the backend...

Successfully configured the backend "s3"! Terraform will automatically
use this backend unless the backend configuration changes.

Initializing provider plugins...
- Finding cloudflare/cloudflare versions matching "~> 4.0"...
- Installing cloudflare/cloudflare v4.21.0...
- Installed cloudflare/cloudflare v4.21.0 (self-signed, key ID C76001609EE3B136)

Partner and community providers are signed by their developers.
If you'd like to know more about provider signing, you can read about it here:
https://www.terraform.io/docs/cli/plugins/signing.html

Terraform has created a lock file .terraform.lock.hcl to record the provider
selections it made above. Include this file in your version control repository
so that Terraform can guarantee to make the same selections by default when
you run "terraform init" in the future.

Terraform has been successfully initialized!

You may now begin working with Terraform. Try running "terraform plan" to see
any changes that are required for your infrastructure. All Terraform commands
should now work.

If you ever set or change modules or backend configuration for Terraform,
rerun this command to reinitialize your working directory. If you forget, other
commands will detect it and remind you to do so if necessary.
```

# resourceのimport

あとは以下の流れで進めていきます。

- API Token設定
- provider設定
- 既存リソースのimport

[User API Tokens][link5] からAPI Tokenを発行します。

![img][link6]

[1. Use environment variables for authentication][link7] を参考に環境変数に設定します。

```bash
export CLOUDFLARE_API_TOKEN=xxx
```

その後にproviderの設定をします。

```hcl
provider "cloudflare" {
  # token pulled from $CLOUDFLARE_API_TOKEN
}
```

そして最後は既存のリソースのimportをします。

ref: [cloudflare_pages_project][link8]

最終的なリソース定義

```hcl
resource "cloudflare_pages_project" "my-project" {
  account_id        = var.account_id
  name              = var.project_name
  production_branch = var.production_branch

  build_config {
    build_command       = var.build_command
    destination_dir     = var.destination_dir
    web_analytics_tag   = var.web_analytics_tag
    web_analytics_token = var.web_analytics_token
  }

  deployment_configs {
    preview {
      always_use_latest_compatibility_date = false
      fail_open                            = true
      environment_variables = {
        GO_VERSION   = var.go_version
        HUGO_VERSION = var.hugo_version
      }
    }
    production {
      always_use_latest_compatibility_date = false
      fail_open                            = true
      environment_variables = {
        GO_VERSION   = var.go_version
        HUGO_VERSION = var.hugo_version
      }
    }
  }

  source {
    type = "github"
    config {
      owner                         = var.repo_owner
      repo_name                     = var.repo_name
      production_branch             = var.production_branch
      pr_comments_enabled           = true
      deployments_enabled           = true
      production_deployment_enabled = true
      preview_branch_includes       = ["*"]
    }
  }

}

resource "cloudflare_pages_domain" "my-domain" {
  account_id   = var.account_id
  project_name = var.project_name
  domain       = var.domain_name
}
```

# まとめ

思ったよりサクサクいけたのと、tfstate管理にR2結構良いんじゃないかなという感想。  
API Token周りの概念が割と初見だとわかりにくいかもと思った。


[link1]: /images/terraform-for-cloudflare-pages/1.avif
[link2]: /images/terraform-for-cloudflare-pages/2.avif
[link3]: https://developers.cloudflare.com/r2/examples/aws/aws-cli/
[link4]: https://github.com/hashicorp/terraform/issues/33847
[link5]: https://dash.cloudflare.com/profile/api-tokens
[link6]: /images/terraform-for-cloudflare-pages/3.avif
[link7]: https://developers.cloudflare.com/terraform/tutorial/track-history/#1-use-environment-variables-for-authentication
[link8]: https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs/resources/pages_project
