---
title: "XDG Base Directory準拠とchezmoiでのdotfiles管理"
date: 2025-07-06T22:44:11+09:00
draft: false
tags: ["dotfiles", "chezmoi"]
# images: [] # OGP image
# lastmod: 2025-07-06T13:14:11+09:00
---

## XDG Base Directoryとは

<https://wiki.archlinux.jp/index.php/XDG_Base_Directory>

ざっくり言うと dotfiles をホームディレクトリ直下に配置するのではなく、決まったパスに集約するという仕様です。  
2003年から導入されたようですが、恥ずかしながら Claude Code がサポートしていない件で存在を知りました。

<https://github.com/anthropics/claude-code/issues/1455>

## XDG Base Directory対応

せっかくなので自身の dotfiles も HOME 直下からなるべくXDG仕様に対応するようにしてみました。  
こちらの記事を参考にさせていただきました。ありがとうございます。

<https://qiita.com/LuckyWindsck/items/ef8ae12a3450344d8902>

基本的には記事内でも紹介されている、xdg-ninjaを使用して一つずつ対応していきます。

<https://github.com/b3nj5m1n/xdg-ninja>

実際の変更差分はこちらです。

<https://github.com/koh-sh/dotfiles/compare/a61fa39...066a3e9>

私の環境でxdg-ninjaの出力だけで解決できなかったのは数箇所くらいで、基本的にはスムーズに進められました。

### Ansible

ANSIBLE_HOMEでパスを指定できますが、各種プラグインや設定項目ごとに追加で指定が必要になるケースがあります。  
私の環境の場合は追加で `ANSIBLE_SSH_CONTROL_PATH_DIR` も設定が必要でした。

<https://docs.ansible.com/ansible/2.9_ja/reference_appendices/config.html>

### Docker

ninja云くdockerは対応済みとされますが、Docker Desktopの場合は未対応です。

<https://github.com/docker/roadmap/issues/408>

### NPM

npmの設定自体は `NPM_CONFIG_USERCONFIG="$XDG_CONFIG_HOME"/npm/npmrc` の設定 + npmrcの設定で完了します。  
ただし合わせて `PATH="$XDG_DATA_HOME/npm/bin:$PATH"` と `NODE_PATH="$XDG_DATA_HOME/npm/lib/node_modules"` も設定しないとCLI系が参照できなくなります。  
(もしかしたらmise固有かもしれないです)

## chezmoiでのdotfiles管理

これまではシェルスクリプトで dotfiles の管理 (=リポジトリのファイルを HOME にコピー) をしていましたが、少し辛くなってきたのでこれを機に chezmoi を試してみることにしました。

<https://www.chezmoi.io>

single binaryでセットアップが楽なのと、やりたかったファイルのDLやコマンド実行に問題がなさそうだったので選びました。

### 設定

基本的には Quick start に則って進めていきます。

<https://www.chezmoi.io/quick-start/>

主な設定内容は以下です。

- 既存ファイルのchezmoi管理への移行
- scriptでの設定
  - 必要なdirectory作成
  - コマンドでの設定PATH変更 (hammerspoon)
- 外部ファイルDL

各設定は以下の記事および、chezmoi作者の方のdotfiles repoを参考にしながら作業しました。

<https://zenn.dev/ganariya/articles/useful-features-of-chezmoi>  
<https://github.com/twpayne/dotfiles>

こちらもいくつかデフォルトから変えているところやハマったところをメモすると

### sourceDirの変更

デフォルトだと `~/.local/share/chezmoi` にgit repositoryが作成されるのですが、git repositoryは一箇所に集約させたかったので変更しています。

chezmoiの設定ファイルで sourceDir, workingDir の設定を変更、init時にオプションをつけることで変更できます。

```bash
% cat ~/.config/chezmoi/chezmoi.toml
sourceDir = "/Users/koh/github/dotfiles"
workingDir = "/Users/koh/github/dotfiles"
[diff]
    exclude = ["scripts"]
```

```bash
# init
chezmoi init koh-sh -S github/dotfiles
```

### chezmoi自体の設定ファイル管理

上記で `~/.config/chezmoi/chezmoi.toml` を設定する必要がありますが、このファイルをchezmoiで管理しようとするとエラーになります。

```bash
% chezmoi add .config/chezmoi/chezmoi.toml
chezmoi: /Users/koh/.config/chezmoi/chezmoi.toml: cannot add chezmoi's config file to chezmoi, use a config file template instead
```

<https://github.com/twpayne/chezmoi/issues/3638>

こちらのissueを参考に、config templateとして管理する必要があります。  

```bash
mv ~/.config/chezmoi/chezmoi.toml "$(chezmoi source-path)/.chezmoi.toml.tmpl"
chezmoi apply
chezmoi init
```

## 最終的なdotfilesとhome

<https://github.com/koh-sh/dotfiles>

```bash
[koh@Kohs-MacBook-Pro] ~
% ls -ld ~/.*
drwxr-xr-x@ 11 koh  staff    352 Jul  6 14:55 /Users/koh/.cache/
drwxr-xr-x@  8 koh  staff    256 Jul  6 15:04 /Users/koh/.claude/
-rw-r--r--@  1 koh  staff  57436 Jul  6 15:06 /Users/koh/.claude.json
drwxr-xr-x  23 koh  staff    736 Jul  6 21:23 /Users/koh/.config/
drwxr-xr-x  12 koh  staff    384 Jul  2 23:22 /Users/koh/.docker/
drwxr-xr-x@  6 koh  staff    192 Jun 25 23:32 /Users/koh/.gemini/
drwxr-xr-x@  4 koh  staff    128 Feb 12 23:47 /Users/koh/.kube/
drwxr-xr-x   5 koh  staff    160 Feb 11 09:35 /Users/koh/.local/
drwxr-xr-x@  6 koh  staff    192 Aug 11  2024 /Users/koh/.ssh/
drwxr-xr-x@  4 koh  staff    128 Feb 17 22:48 /Users/koh/.terraform.d/
drwx------+ 29 koh  staff    928 Jul  6 13:58 /Users/koh/.Trash/
drwxr-xr-x@  5 koh  staff    160 Aug 11  2024 /Users/koh/.vscode/
[koh@Kohs-MacBook-Pro] ~
%
```

最終的にdotfilesで管理するものはすべて `~/.config` 配下に、実際の環境も対応しているsoftwareはすべて移行できました。  
(こうしてみると非対応のものが目立ちますね..)

## まとめ

chezmoiは現時点だと若干オーバースペックですが、使用感は気に入っているのでもう少し使いこなしてみたいです。  
あと XDG Base Directory をこれまで知らなかったので、今後ツール作る時などは気をつけようと思いました。
