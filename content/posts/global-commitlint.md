---
title: "すべてのcommitにcommitlintを実行する"
date: 2025-01-18T15:00:38+09:00
draft: false
tags: ["git", "commitlint"]
---

# モチベ

これまで恥ずかしながらコミットメッセージは雰囲気で書いていた。  
ただそろそろちゃんと書くようにしないとと思い、まずはコミットメッセージ用のlinterを入れてみようと検討した。

調べた感じ [commitlint][1] が良さそうだったので、今回はそれを入れてみる。  

公式の手順だと、commitlintとhuskyをプロジェクトごとにインストールする形になっている。

{{< link-preview "https://commitlint.js.org/guides/local-setup.html" >}}

今回の場合、特定のプロジェクトやチームに導入したいというよりも、自分の習熟のために導入したかった。  
そのため自分のローカルにおいてはどのプロジェクトに対しても、常にcommitlintを実行するように設定してみた。

# 設定

各種バージョン

```bash
[koh@Kohs-MacBook-Pro] ~
% sw_vers
ProductName:            macOS
ProductVersion:         15.1.1
BuildVersion:           24B91
[koh@Kohs-MacBook-Pro] ~
% node -v
v22.6.0
[koh@Kohs-MacBook-Pro] ~
% commitlint -v
@commitlint/cli@19.6.1
[koh@Kohs-MacBook-Pro] ~
%
```

設定は以下のようにした。

```bash
mkdir ~/.config/git/hooks/ # ディレクトリは任意のパスでいい
git config --global core.hooksPath \~/.config/git/hooks
vi ~/.config/git/hooks/commit-msg
chmod +x ~/.config/git/hooks/commit-msg
```

commit-msgファイルには以下のように記述する。

```bash
#!/usr/bin/env bash

# install commitlint if not installed
if ! command -v commitlint &> /dev/null; then
    echo "commitlint not found, installing..."
    npm install -g @commitlint/cli @commitlint/config-conventional
fi

# set config
# SEE: https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional
CONFIG="
extends:
  - '@commitlint/config-conventional'
"

# exec commitlint
commitlint --edit "$1" --config <(echo "$CONFIG")

```

## インストール

`@commitlint/cli` と `@commitlint/config-conventional` をインストールする。  
後者の方は設定したいルールによって変更する。

<https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint>

の `config-*` の中から選ぶ。  
今回は[Getting started][2]で指定されていたconventionalを選択した。

具体的なルールは以下。

<https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional>

## 設定ファイル

commitlintは実行時に設定ファイルが必要になる。

<https://commitlint.js.org/reference/configuration.html>

現時点では設定がシンプルかつ、管理するファイルを減らしたかった。  
そのためスクリプト内でプロセス置換する形で設定を渡している。

設定の読み込み時に [cosmiconfig][3] を使用しており、設定ファイルの拡張子がない場合はYAML形式でパースされる。  
そのためプロセス置換で設定ファイルを作成する場合は、YAML形式で記述する。

## hookでの実行

gitのcommit-msg hookを利用する。

<https://git-scm.com/docs/githooks#_commit_msg>

第一引数にコミットメッセージのファイルパスが渡されるので、それを利用する。  
具体的には `.git/COMMIT_EDITMSG` が第一引数になる。

# 動作確認

これにより、ローカルのすべてのプロジェクトでcommitlintが実行される。

```bash
[koh@Kohs-MacBook-Pro] ~/work
% mkdir commit_test && cd commit_test
[koh@Kohs-MacBook-Pro] ~/work/commit_test
% git init .
Initialized empty Git repository in /Users/koh/work/commit_test/.git/
[koh@Kohs-MacBook-Pro] ~/work/commit_test
% echo foobar >> test.txt && git add test.txt && git commit -m "foobar"
⧗   input: foobar
✖   subject may not be empty [subject-empty]
✖   type may not be empty [type-empty]

✖   found 2 problems, 0 warnings
ⓘ   Get help: https://github.com/conventional-changelog/commitlint/#what-is-commitlint

zsh: exit 1     git commit -m "foobar"
[koh@Kohs-MacBook-Pro] ~/work/commit_test
% git commit -m "feat: foobar"
[main (root-commit) 9dd1ceb] feat: foobar
 1 file changed, 1 insertion(+)
 create mode 100644 test.txt
[koh@Kohs-MacBook-Pro] ~/work/commit_test
%
```

新規のプロジェクトでも、commitlintが実行されている。

# まとめ

とりあえずはこの設定で試してみようと思う。  
大リーグボール養成ギプスのように、常にlinter実行することで慣れると嬉しい。

[1]: https://commitlint.js.org
[2]: https://commitlint.js.org/guides/getting-started.html
[3]: https://github.com/cosmiconfig/cosmiconfig/tree/main
