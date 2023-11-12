---
title: "GitHub Actionsの実行時間をサクッとグラフ化するツールを作った"
date: 2023-11-13T01:05:48+09:00
draft: false
tags: ["golang", "Cobra", "Tools", "GitHub-Actions"]
---

# 概要

GitHub Actionsの実行時間をサクッとグラフ化するツールを作りました。

[https://github.com/koh-sh/gha-timegraph][link1]

コマンド実行するとグラフをPNGで吐き出します。

```bash
[koh@Kohs-MacBook-Pro-M1-387] ~/github/blog
% gha-timegraph --owner koh-sh --repo codebuild-multirunner --workflow go-test.yml --count 100
 100% |███████████████████████████████████████████████████████████████████████████████████████████████████| (100/100, 34 it/s)
PNG saved to graph.png
[koh@Kohs-MacBook-Pro-M1-387] ~/github/blog
% ls -l graph.png
-rw-r--r--@ 1 koh  staff  41783 Nov 12 23:45 graph.png
[koh@Kohs-MacBook-Pro-M1-387] ~/github/blog
%
```

![グラフ][link2]

# モチベーション

#### GitHub Actionsの実行時間がパッと俯瞰で見辛い

GitHub Actionsのページだと実行履歴が並んでいるが、実行日時が相対表示 (1ヶ月前みたいな) だったり1ページで表示される量も少ないため俯瞰的に見ることが難しい。

![Actions一覧][link3]

CI/CD周り触ってると「あれ、最近テスト遅くなってね？」みたいなタイミングがちょこちょこあるので、そういったときにパッと視覚的に実行時間の推移がみられるといいなという思いがありました。

#### GitHubを使うツールを作ってみたかった

先日AWS CodeBuildを扱うツールを作りました。

[複数のCodebuildを同時に「上書きでビルドを開始する」CLIツールをGoで書いた]({{< ref "/posts/cli-for-codebuild.md" >}})

今の業務だとAWSの次くらいにGitHub触る時間多いので、他にもツール作れるように一度触っておきたいと思ってました。

# よかったこと

#### CI/CD周りはほぼ前回のコピーでできた

CodeBuildの時にGitHub Actionsでtest, lint, releaseあたりの作業を自動化したけど、ほぼ `~/.github` ディレクトリとdotfileをコピーしてPATを払い出すだけで動きました。  
Goの周辺ツールの優秀さであったり、GitHub Actionsの取り回しの良さが本当にありがたいです。

#### 標準出力回りのテストの仕方がなんとなくわかった

これまで関数はなるべくstringをリターンするようにしてテストしやすくしてたけど、今回みたいに標準出力の結果が大事な場合はprintの結果をテストした方がいい気がする。  
os.Pipeを使えばテストできるのがわかったので場合により使っていきたいです。 (あんまり多用はしない方がいい気がする...?)

[Go で標準出力に書き込まれた文字列のテストをする方法][link4]

#### go-githubのmockが使いやすかった

今回GitHubのAPI利用するのに [google/go-github][link5] を利用したが、テスト用のmockはこっちをみてねとREADMEに1行だけ記載がありました。

>The repo migueleliasweb/go-github-mock provides a way to mock responses. Check the repo for more details.

そのリポジトリがこちら

[https://github.com/migueleliasweb/go-github-mock][link6]

個人のリポジトリ？のように見えるが実際mockは使いやすくとてもよかったです。

# まとめ

前回のCodeBuildに比べるといい感じにテストかけた気がするし、progress barつけたりで色々試せてよかった。  
今後も色々作っていきたい。

[link1]: https://github.com/koh-sh/gha-timegraph
[link2]: /images/gha-timegraph/1.avif
[link3]: /images/gha-timegraph/2.avif
[link4]: https://zenn.dev/glassonion1/articles/8ac939208bd455
[link5]: https://github.com/google/go-github
[link6]: https://github.com/migueleliasweb/go-github-mock
