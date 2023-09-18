---
title: "AWS CodebuildでGitHub Actionsを利用する際に出たエラー"
date: 2023-09-18T21:10:09+09:00
draft: false
tags: ["GitHub-Actions", "CodeBuild"]
---

# はじめに

先日AWS CodeBuildがGitHub Actionsをサポートしました。

[AWS CodeBuild が GitHub Actions をサポート開始][link1]

[MarketPlace][link2]にあるActionsをCodeBuildでも再利用できるようになるため非常に便利です。

ただし色々試すうちにいくつかエラーにハマったので備忘として残しておきます。

# YAML_FILE_ERROR Message: unsupported field "steps" in buildspec. No GitHub token has been configured for your account

使用したbuildspec

```yaml
version: 0.2
phases:
  build:
    steps:
      - name: run codebuild
        uses: koh-sh/codebuild-multirunner@v0
        with:
          config: ".codebuild-multirunner.yaml"
          polling-span: "10"
```

GitHub Actionsを利用する際には、ソースにGitHubを使用していなくてもGitHubと連携する必要があります。

理由としてはActionsのソースダウンロードの際にGitHubのAPI制限を回避するためだそうです。

>In order to use GitHub Actions, the source must be downloaded on a build compute. Anonymous downloads will be rate limited, so by connecting to GitHub, it can help ensure consistent access.

[Why do I need to connect to GitHub as a source provider in order to use GitHub Actions?][link3]

接続の仕方はこちら。

[GitHub and GitHub Enterprise Server access token][link4]

# ERROR: Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?

使用したbuildspec

```yaml
version: 0.2
phases:
  build:
    steps:
      - name: run codebuild
        uses: koh-sh/codebuild-multirunner@v0
        with:
          config: ".codebuild-multirunner.yaml"
          polling-span: "10"
```

CodeBuildでDockerを利用する場合Projectの設定で、特権モードに設定する必要があります。

[Error: "Cannot connect to the Docker daemon" when running a build (ビルドの実行時に「Docker デーモンに接続できません」)][link5]

GitHub ActionsはDocker, JavaScript, Compositeの3種類があります。

[アクションの種類][link6]

Dockerの場合CodeBuild実行時にDocker Build or Docker pullが実行されるため、CodeBuild側でDockerの実行環境が必要になります。

Actionsの種類の確認は、Actionsのリポジトリの `/action.yml`のruns.usingから確認できます。

例

```yaml
# action.yml
runs:
  using: 'docker'
  image: 'Dockerfile'
  args:
    - "run"
```

# ##[error]System.ArgumentOutOfRangeException: Specified argument was out of the range of valid values. (Parameter ''using: node20' is not supported, use 'docker', 'node12' or 'node16' instead.')

使用したbuildspec

```yaml
version: 0.2
phases:
  build:
    steps:
     - uses: actions/setup-go@main
       with:
         go-version: '^1.13.1' # The Go version to download (if necessary) and use.
     - run: go version
```

JavaScriptタイプのActionsはnodeのバージョンが決まっています。

例

```yaml
runs:
  using: 'node20'
  main: 'dist/setup/index.js'
```

そのため指定されたnodeバージョンが実行環境にインストールされていないとエラーになります。

検証のためあえて少し古めのイメージ (`aws/codebuild/standard:5.0`) でsetup-go@mainを使用した場合node20がインストールされていなく、エラーになりました。

最新のイメージを使用していなかったり、カスタムイメージを使用する場合には気をつけましょう。

CodeBuild公式イメージの場合は下記からDockerfileを確認できます。

[CodeBuild に用意されている Docker イメージ][link7]

# まとめ

とても便利ですがActionsのタイプによっては、実行環境の設定を気にしないとちょこちょこエラーにはまりそうです。  
基本的には最新のイメージを使用しておけば問題ないと思いますが、他にもまだ見えてないハマりどころはあるかも。

[link1]: https://aws.amazon.com/jp/about-aws/whats-new/2023/07/aws-codebuild-github-actions/
[link2]: https://github.com/marketplace?type=actions
[link3]: https://docs.aws.amazon.com/codebuild/latest/userguide/action-runner.html#action-runner-connect-source-provider
[link4]: https://docs.aws.amazon.com/codebuild/latest/userguide/access-tokens.html#access-tokens-github
[link5]: https://docs.aws.amazon.com/ja_jp/codebuild/latest/userguide/troubleshooting.html#troubleshooting-cannot-connect-to-docker-daemon
[link6]: https://docs.github.com/ja/actions/creating-actions/about-custom-actions#types-of-actions
[link7]: https://docs.aws.amazon.com/ja_jp/codebuild/latest/userguide/build-env-ref-available.html
