---
title: "Terraformの練習をローカルで完結させるのにk8sが手軽で良かった"
date: 2023-01-07T12:55:55+09:00
draft: false
tags: ["terraform", "kubernetes"]
---

# Terraformを試すときに困ったこと

サクッとTerraformを試してみたいと思ったときに悩む要素の一つがProviderの準備かと思います。  
ベタなのはAWS/Azure/Google Cloud Platformあたりだと思います。ただそのためにわざわざアカウント作るのも手間だし、何よりTerraformを試したいだけなのにコストやセキュリティのことを心配したくないなと億劫になっていました。

Ansibleを使っていた頃はVagrant + VirtualBoxで簡単に実行先を作れたんですが、Terraformの場合どうするのがいいかと思って[Provider一覧][link1]を見ていたんですがKubernetesが意外といいんじゃないかと思い試してみました。

# 環境準備

```bash
% sw_vers
ProductName:		macOS
ProductVersion:		13.0.1
BuildVersion:		22A400
```

TerraformのインストールはHomebrewで行います。

[Install Terraform][link2]

```bash
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
```

```bash
[koh@Kohs-MacBook-Pro-M1-387] ~
% terraform --version
Terraform v1.3.7
on darwin_arm64
[koh@Kohs-MacBook-Pro-M1-387] ~
%
```

KubernetesはDocker Desktop for Macを利用します。

[Install on Mac][link3]

インストールした後にKubernetesをenableするとローカルで利用できるようになります。

[Deploy on Kubernetes](https://docs.docker.com/desktop/kubernetes/)

```bash
[koh@Kohs-MacBook-Pro-M1-387] ~
% kubectl config get-contexts
CURRENT   NAME             CLUSTER          AUTHINFO         NAMESPACE
*         docker-desktop   docker-desktop   docker-desktop
[koh@Kohs-MacBook-Pro-M1-387] ~
% kubectl get all
NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   110d
[koh@Kohs-MacBook-Pro-M1-387] ~
%
```

# 動作確認

まずは適当なディレクトリを作成します。

```bash
[koh@Kohs-MacBook-Pro-M1-387] ~/work
% mkdir terraform-with-k8s
[koh@Kohs-MacBook-Pro-M1-387] ~/work
% cd !$
cd terraform-with-k8s
[koh@Kohs-MacBook-Pro-M1-387] ~/work/terraform-with-k8s
%
```

ここから[ドキュメント][link4]をもとにTerraformを書いていきます。  
最初にmain.tfを用意し、Example Usageの内容をコピペします。  
ローカルのDocker Desktopを利用するためconfig_contextを `docker-desktop`に変更します。

```bash
[koh@Kohs-MacBook-Pro-M1-387] ~/work/terraform-with-k8s
% cat main.tf
provider "kubernetes" {
  config_path    = "~/.kube/config"
  config_context = "docker-desktop"
}

resource "kubernetes_namespace" "example" {
  metadata {
    name = "my-first-namespace"
  }
}
[koh@Kohs-MacBook-Pro-M1-387] ~/work/terraform-with-k8s
%
```

`terraform init`によりKubernetes Providerをインストールします。

```bash
[koh@Kohs-MacBook-Pro-M1-387] ~/work/terraform-with-k8s
% terraform init

Initializing the backend...

Initializing provider plugins...
- Finding latest version of hashicorp/kubernetes...
- Installing hashicorp/kubernetes v2.16.1...
- Installed hashicorp/kubernetes v2.16.1 (signed by HashiCorp)

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
[koh@Kohs-MacBook-Pro-M1-387] ~/work/terraform-with-k8s
%
```

`terraform plan`でドライランします。

```bash
[koh@Kohs-MacBook-Pro-M1-387] ~/work/terraform-with-k8s
% terraform plan

Terraform used the selected providers to generate the following execution plan. Resource actions are indicated with the following
symbols:
  + create

Terraform will perform the following actions:

  # kubernetes_namespace.example will be created
  + resource "kubernetes_namespace" "example" {
      + id = (known after apply)

      + metadata {
          + generation       = (known after apply)
          + name             = "my-first-namespace"
          + resource_version = (known after apply)
          + uid              = (known after apply)
        }
    }

Plan: 1 to add, 0 to change, 0 to destroy.

───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

Note: You didn't use the -out option to save this plan, so Terraform can't guarantee to take exactly these actions if you run
"terraform apply" now.
[koh@Kohs-MacBook-Pro-M1-387] ~/work/terraform-with-k8s
%
```

`terraform apply`で実際に適用します。

```bash
[koh@Kohs-MacBook-Pro-M1-387] ~/work/terraform-with-k8s
% terraform apply

Terraform used the selected providers to generate the following execution plan. Resource actions are indicated with the following
symbols:
  + create

Terraform will perform the following actions:

  # kubernetes_namespace.example will be created
  + resource "kubernetes_namespace" "example" {
      + id = (known after apply)

      + metadata {
          + generation       = (known after apply)
          + name             = "my-first-namespace"
          + resource_version = (known after apply)
          + uid              = (known after apply)
        }
    }

Plan: 1 to add, 0 to change, 0 to destroy.

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes

kubernetes_namespace.example: Creating...
kubernetes_namespace.example: Creation complete after 0s [id=my-first-namespace]

Apply complete! Resources: 1 added, 0 changed, 0 destroyed.
[koh@Kohs-MacBook-Pro-M1-387] ~/work/terraform-with-k8s
%
```

`kubectl get namespace`でnamespaceが作成されていることがわかります。

```bash
[koh@Kohs-MacBook-Pro-M1-387] ~/work/terraform-with-k8s
% kubectl get namespace
NAME                 STATUS   AGE
default              Active   110d
kube-node-lease      Active   110d
kube-public          Active   110d
kube-system          Active   110d
my-first-namespace   Active   16s
[koh@Kohs-MacBook-Pro-M1-387] ~/work/terraform-with-k8s
%
```

ここでnamespaceの名前を`my-second-namespace`に更新してplanしてみます。

```bash
[koh@Kohs-MacBook-Pro-M1-387] ~/work/terraform-with-k8s
% cat main.tf
provider "kubernetes" {
  config_path    = "~/.kube/config"
  config_context = "docker-desktop"
}

resource "kubernetes_namespace" "example" {
  metadata {
    name = "my-second-namespace"
  }
}
[koh@Kohs-MacBook-Pro-M1-387] ~/work/terraform-with-k8s
% terraform plan
kubernetes_namespace.example: Refreshing state... [id=my-first-namespace]

Terraform used the selected providers to generate the following execution plan. Resource actions are indicated with the following
symbols:
-/+ destroy and then create replacement

Terraform will perform the following actions:

  # kubernetes_namespace.example must be replaced
-/+ resource "kubernetes_namespace" "example" {
      ~ id = "my-first-namespace" -> (known after apply)

      ~ metadata {
          - annotations      = {} -> null
          ~ generation       = 0 -> (known after apply)
          - labels           = {} -> null
          ~ name             = "my-first-namespace" -> "my-second-namespace" # forces replacement
          ~ resource_version = "7148807" -> (known after apply)
          ~ uid              = "3c73d846-24c1-45b7-9e58-ad99c5c275c7" -> (known after apply)
        }
    }

Plan: 1 to add, 0 to change, 1 to destroy.

───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

Note: You didn't use the -out option to save this plan, so Terraform can't guarantee to take exactly these actions if you run
"terraform apply" now.
[koh@Kohs-MacBook-Pro-M1-387] ~/work/terraform-with-k8s
%
```

namespaceの名前を変更したことにより再作成されます。  
ちなみに`forces replacement`は一度リソースを削除してから新規で作成するという意味なので、状況によっては注意が必要です。

実際にapplyすると `my-first-namespace`が削除され、`my-second-namespace`が作成されることがわかります。

```bash
[koh@Kohs-MacBook-Pro-M1-387] ~/work/terraform-with-k8s
% terraform apply
kubernetes_namespace.example: Refreshing state... [id=my-first-namespace]

Terraform used the selected providers to generate the following execution plan. Resource actions are indicated with the following
symbols:
-/+ destroy and then create replacement

Terraform will perform the following actions:

  # kubernetes_namespace.example must be replaced
-/+ resource "kubernetes_namespace" "example" {
      ~ id = "my-first-namespace" -> (known after apply)

      ~ metadata {
          - annotations      = {} -> null
          ~ generation       = 0 -> (known after apply)
          - labels           = {} -> null
          ~ name             = "my-first-namespace" -> "my-second-namespace" # forces replacement
          ~ resource_version = "7148807" -> (known after apply)
          ~ uid              = "3c73d846-24c1-45b7-9e58-ad99c5c275c7" -> (known after apply)
        }
    }

Plan: 1 to add, 0 to change, 1 to destroy.

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes

kubernetes_namespace.example: Destroying... [id=my-first-namespace]
kubernetes_namespace.example: Destruction complete after 6s
kubernetes_namespace.example: Creating...
kubernetes_namespace.example: Creation complete after 0s [id=my-second-namespace]

Apply complete! Resources: 1 added, 0 changed, 1 destroyed.
[koh@Kohs-MacBook-Pro-M1-387] ~/work/terraform-with-k8s
% kubectl get namespace
NAME                  STATUS   AGE
default               Active   110d
kube-node-lease       Active   110d
kube-public           Active   110d
kube-system           Active   110d
my-second-namespace   Active   5s
[koh@Kohs-MacBook-Pro-M1-387] ~/work/terraform-with-k8s
%
```

# まとめ

環境構築からterraform applyまでローカルで完結できました。  
これでTerraform初心者でも気軽に色々試せるのでいいなと思いました。

[link1]: https://registry.terraform.io/browse/providers
[link2]: https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli
[link3]: https://docs.docker.com/desktop/install/mac-install/
[link4]: https://registry.terraform.io/providers/hashicorp/kubernetes/latest/docs