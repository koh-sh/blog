---
title: "複数のCodebuildを同時に「上書きでビルドを開始する」CLIツールをGoで書いた"
date: 2023-07-31T00:11:57+09:00
draft: false
tags: ["golang", "AWS", "CodeBuild", "Cobra", "Tools"]
---

# 概要

複数のCodeBuildを同時に「上書きでビルドを開始する」CLIツールをGoで書きました。

[https://github.com/koh-sh/codebuild-multirunner][link1]

YAMLで実行するCodeBuildの一覧と上書きするパラメータを記載してCLI実行すると、定義した通りに実行して完了するまでstatusをチェックしてくれます。

```bash
% cat config.yaml
builds:
  - projectName: testproject
  - projectName: testproject2
    environmentVariablesOverride:
    - name: TEST_VAR
      value: FOOBAR
      type: PLAINTEXT
% codebuild-multirunner run --config ./config.yaml
2023/07/30 22:49:48 testproject:cb0feec0-23af-49e4-a8af-f8ca502789f4 [STARTED]
2023/07/30 22:49:48 testproject2:a71b71ef-3902-49ac-98a9-9d30a4a540f2 [STARTED]
2023/07/30 22:50:48 testproject:cb0feec0-23af-49e4-a8af-f8ca502789f4 [SUCCEEDED]
2023/07/30 22:50:48 testproject2:a71b71ef-3902-49ac-98a9-9d30a4a540f2 [IN_PROGRESS]
2023/07/30 22:51:48 testproject2:a71b71ef-3902-49ac-98a9-9d30a4a540f2 [IN_PROGRESS]
2023/07/30 22:52:48 testproject2:a71b71ef-3902-49ac-98a9-9d30a4a540f2 [IN_PROGRESS]
2023/07/30 22:53:48 testproject2:a71b71ef-3902-49ac-98a9-9d30a4a540f2 [FAILED]
```

# モチベーション

#### AWS CLIだとCodeBuildの「上書きでビルドを開始する」がちょっとめんどい

AWS CLIでやろうとするとjsonで上書きするパラメータを指定してstart-buildコマンドを実行する形になる。

[ビルドの実行 (AWS CLI)][link2]

```bash
aws codebuild start-build --cli-input-json file://start-build.json
```

オプションで上書きしたいパラメータをサクッと指定できればいいが、都度Jsonをいじらないといけないので常用するのは少し手間になる。

そしておそらくCodeBuildを頻繁に「上書きでビルドを開始する」のはあまり一般的な運用ではなさそう。なのであまり事例やツールなどを見つけられなかった。

今の職場だと

- トイルっぽいタスクを(半)自動化するためスクリプトを書く
- ワンクリックで誰でも実行できるようにCodeBuildで動かせるようにする
- パラメータの概念がある場合はCodeBuildの環境変数に設定して動的に変更できるようにする

みたいなことをちょこちょこしているので割と機会が多い。  
(世の中の人たちはどうしてるんだろう)

#### Goでなにかコードを書きたかった

正直そこまで困ってるわけでもないけど、Goの練習したかったのでちょうどよかった。

# よくわからなかったこと

Go初心者なのでこれでいいのか？みたいなところがちょこちょこあった。  
とりあえず動きそうなのでよしとしてるけど気になったところを書いておく。

#### 外部ライブラリのstructをYAML (or Json)で扱う方法

今回のツールだと読み込んだYAMLを[gopkg.in/yaml.v3][link3]でUnmarshalしてAWS SDKの[StartBuildInput][link4]として解釈したかった。  
だけど外部ライブラリのstructにYAML用のtagをつけられないのでどうすればいいかよくわからなかった。

```go
type T struct {
    F int `yaml:"a,omitempty"`
    B int
}
```

の `yaml:"a,omitempty"`の箇所。

なので今回のツールでは

- 全く同じ形のstructを自前で定義。YAML用のtagもつける
- YAMLからUnmarshalする時は自前で定義したstructへ変換する
- [https://github.com/jinzhu/copier][link5]を使ってStartBuildInputのインスタンスへコピーする

といった流れで書いた。

[run.go#L72][link6]

```go
// copy configration read from yaml to codebuild.StartBuildInput
func convertBuildConfigToStartBuildInput(build Build) codebuild.StartBuildInput {
	startbuildinput := codebuild.StartBuildInput{}
	copier.CopyWithOption(&startbuildinput, build, copier.Option{IgnoreEmpty: true, DeepCopy: true})
	return startbuildinput
}
```

ただ全く同じ定義を用意するの手間だし、ネストしてるところなどコピーする時に特にバグりそうでやだなと。  
正しくないんだろうなーと思いながら書いたが正解がわからなかった。

# まとめ

今回[Cobra][link7]を使ってみたがサブコマンドやフラグ管理がとても便利だった。  
テストやリリース周りもGo本体やGitHubのみで完結するし、ロジックを考えることに集中できてよかった。  
何よりシングルバイナリ/クロスコンパイルはCLIツール作るのにとてもいい。

ただやっぱり慣れが必要な感はあるのでもうちょい書きたい。  

[link1]: https://github.com/koh-sh/codebuild-multirunner
[link2]: https://docs.aws.amazon.com/ja_jp/codebuild/latest/userguide/run-build-cli.html
[link3]: gopkg.in/yaml.v3
[link4]: https://pkg.go.dev/github.com/aws/aws-sdk-go-v2/service/codebuild#StartBuildInput
[link5]: https://github.com/jinzhu/copier
[link6]: https://github.com/koh-sh/codebuild-multirunner/blob/main/cmd/run.go#L72
[link7]: https://github.com/spf13/cobra
