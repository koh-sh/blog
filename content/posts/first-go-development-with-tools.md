---
title: "初のGoプログラミングでtestやreleaseを自動で実行するまで"
date: 2023-01-09T13:19:06+09:00
draft: false
tags: ["golang","GitHub-Actions","GoReleaser"]
---

今年はコーディングをもっと頑張ろうと思い、前から気になっていたGo言語に挑戦してみています。  
コーディング自体も癖はありつつも楽しいんですが、test, installやrelease作成など周辺の仕組みが洗練されていて初心者でも簡単にできました。

試しにCLIツールを作ってみたんですが、その際に諸々整えた流れをまとめておこうと思います。

# 作ったもの

[https://github.com/koh-sh/termclock][link1]  
ターミナルに大きく時刻を表示するCLIです。  
特に実用性はないですが学習目的でお遊びツールとして書いています。  
今回整えたCI周りも全てリポジトリで公開しています。

![GIF1][link2]

# 開発環境

ローカルのMacにHomeBrewでGoをインストールしています。  
エディタはVSCodeで公式?の[extension][link3]を使っています。  

```bash
[koh@Kohs-MacBook-Pro-M1-387] ~
% sw_vers
ProductName:		macOS
ProductVersion:		13.0.1
BuildVersion:		22A400
[koh@Kohs-MacBook-Pro-M1-387] ~
% go version
go version go1.19.4 darwin/arm64
[koh@Kohs-MacBook-Pro-M1-387] ~
%
```

# test

Goの場合testサブコマンドがあるので特に別のツールをインストールする必要はないです。

例えばmain.goのテストを書く時はmain_test.goファイルを作成して、その中に関数ごとのテストを書いていくのですがVSCodeのGo extensionだとその辺の準備を全部やってくれます。

テストを作成したい関数にカーソルを合わせて右クリックし、`Go: Generate Unit Tests For Function`を選択するとテスト用のファイルとテスト用の関数のテンプレを用意してくれます。

サンプルとして素数判定の関数とそのテストを作成しています。

![GIF2](/images/first-go-development-with-tools/1.gif)

あとは `// TODO: Add test cases.`となっているところにテストケースを追加します。  
testsにテストケース名、与える引数、期待値を入力するだけで簡単なテストを実行できます。

```golang
	tests := []struct {
		name string
		args args
		want bool
	}{
		// TODO: Add test cases.
		{name: "3 should be prime",
			args: args{3},
			want: true},
		{name: "4 should not be prime",
			args: args{4},
			want: false},
	}
```

```bash
[koh@Kohs-MacBook-Pro-M1-387] ~/work/hoge
% go test -v
=== RUN   Test_isPrime
=== RUN   Test_isPrime/3_should_be_prime
=== RUN   Test_isPrime/4_should_not_be_prime
--- PASS: Test_isPrime (0.00s)
    --- PASS: Test_isPrime/3_should_be_prime (0.00s)
    --- PASS: Test_isPrime/4_should_not_be_prime (0.00s)
PASS
ok  	example	0.231s
[koh@Kohs-MacBook-Pro-M1-387] ~/work/hoge
%
```

# release

[GoReleaser][link4]を使うと全てやってくれました。  
設定によりできることは色々ありそうですがデフォルトだと

- クロスコンパイル
- GitHubへのバイナリアップロード
- GitHubのrelease作成

をやってくれます。

HomeBrewでインストールした後に

```bash
brew install goreleaser
```

[Quick Start][link5]の内容をやればリリースがリポジトリに作成されます。

[release][link6]

`goreleaser init`を実行すると `.goreleaser.yaml`を作成してくれます。

```bash
% cat .goreleaser.yaml
# This is an example .goreleaser.yml file with some sensible defaults.
# Make sure to check the documentation at https://goreleaser.com
before:
  hooks:
    # You may remove this if you don't use go modules.
    #- go mod tidy
    # you may remove this if you don't need go generate
    #- go generate ./...
builds:
  - env:
      - CGO_ENABLED=0
    goos:
      - linux
      - windows
      - darwin

archives:
  - format: tar.gz
    # this name template makes the OS and Arch compatible with the results of uname.
    name_template: >-
      {{ .ProjectName }}_
      {{- title .Os }}_
      {{- if eq .Arch "amd64" }}x86_64
      {{- else if eq .Arch "386" }}i386
      {{- else }}{{ .Arch }}{{ end }}
      {{- if .Arm }}v{{ .Arm }}{{ end }}
    # use zip for windows archives
    format_overrides:
    - goos: windows
      format: zip
checksum:
  name_template: 'checksums.txt'
snapshot:
  name_template: "{{ incpatch .Version }}-next"
changelog:
  sort: asc
  filters:
    exclude:
      - '^docs:'
      - '^test:'
      - '^chore:'

# The lines beneath this are called `modelines`. See `:help modeline`
# Feel free to remove those if you don't want/use them.
# yaml-language-server: $schema=https://goreleaser.com/static/schema.json
# vim: set ts=2 sw=2 tw=0 fo=cnqoj
```

基本的にデフォルトのままで大丈夫だと思いますが、私の場合hookは不要(なはず)なのでコメントアウトし、changelogのfiltersにchoreも追記しました。

# CI

上記のtestとrelease作成両方ともGitHub Actionsで実行できます。

## test

Actionsタブで公式のgoのworkflowがそのままtest用として利用できます。  
mainにpushかPRが発行されたときに動く形になっているので適宜変更してください。

![actions](/images/first-go-development-with-tools/1.png)
![go](/images/first-go-development-with-tools/2.png)

## release

GoReleaserの公式のGitHub Actionsが用意されているのでそのまま使用します。

[workflow][link7]

実行をtag pushに変更しています。

```bash
name: goreleaser

on:
  push:
    tags:
      - 'v*'

jobs:
  goreleaser:
    runs-on: ubuntu-latest
    steps:
      -
        name: Checkout
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
      -
        name: Set up Go
        uses: actions/setup-go@v3
      -
        name: Run GoReleaser
        uses: goreleaser/goreleaser-action@v4
        with:
          # either 'goreleaser' (default) or 'goreleaser-pro'
          distribution: goreleaser
          version: latest
          args: release --rm-dist
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          # Your GoReleaser Pro key, if you are using the 'goreleaser-pro' distribution
          # GORELEASER_KEY: ${{ secrets.GORELEASER_KEY }}
```

これでtag pushすると実行されて自動でrelease作成してくれます。

# まとめ

初めて色々触ってみましたが基本的に開発に必要なものが、GoやGitHubの機能で完結するのはとても体験がいいなと思います。  
ほぼデフォルト設定でいい感じにできたのでコードを書くことに集中しやすそうです。

[link1]: https://github.com/koh-sh/termclock
[link2]: https://github.com/koh-sh/termclock/blob/main/misc/demo.gif?raw=true
[link3]: https://marketplace.visualstudio.com/items?itemName=golang.Go
[link4]: https://goreleaser.com
[link5]: https://goreleaser.com/quick-start/
[link6]: https://github.com/koh-sh/termclock/releases/tag/v0.1.0
[link7]: https://github.com/goreleaser/goreleaser-action#workflow