---
title: "やっと Raycast に乗り換えた"
date: 2025-02-16T15:50:13+09:00
draft: false
tags: ["Raycast"]
---

# はじめに

これまで Alfred を長らく使っていたが、ようやく重い腰をあげて Raycast に乗り換えた。  
なんとなく食わず嫌いしていたけど、全く問題なさそうだしむしろできることが増えてよさそう。

# 設定

## Raycast アカウント作成してログイン

とりあえずアカウント作成。  
無料のproトライアルを使うつもりだったけど、今のところ無料のスコープで問題なさそう。

## Alfred, Clipy のアンインストール

アプリランチャーとクリップボードは代替できたので、既存のものはアンインストール。  
Rectangleも代替できるともよく見るが、Windowの整理はかなり頻度が高いのでいったん移行は見送り。

## [Git Repos](https://www.raycast.com/moored/git-repos) をインストール

今回移行しようと思ったきっかけが「任意のローカルリポジトリを Cursor で開く」という作業を簡略化したかったから。  
これまで以下のような形で対応していたが、だいぶ手数が減った。

- WezTerm起動
- 対象のリポジトリにcd
- `cursor .`

## よく使うコマンドにaliasを設定

Hotkeyを追加で覚えるのが嫌だったので、よく使うコマンドには１文字のaliasを設定した。  
そうすることで対話式フィルターのインターフェースを保ちつつ、優先的に選択しやすくなる。

設定しているのは以下

- Clipboard History: c
- List Repos: r
- Search Note (Raycast Note): n
- Search Snippets (Snippets): s

![img](/images/install-raycast/1.avif)

## 使わない機能の無効化

検索結果に余計なものをなるべく減らしたいので使わない機能を無効化。  
ついでにproプランじゃないと使えない機能も無効化した。

## 細かい設定

この辺は好みに合わせて。

- pop to root search: immediately
- clipboard history
  - primary action: copy to clipboard

# Extensionの自作

Extension (コマンド) をReact, TypeScriptで自作できる。

<https://developers.raycast.com/basics/getting-started>

試しに作ってみたのはこちら。

<https://github.com/koh-sh/raycast-extension-ec2-instance-types>

AWS EC2の `m5.xlarge` ってどのくらいのスペックだっけ？みたいなのをすぐに調べられるコマンド。  
Cursorがほぼ書いてくれたが、なかなかいい感じに動いていると思う。

![img](/images/install-raycast/2.gif)

# 参考

- [Macの生産性を高めるRaycastの活用法【よく使う機能4つ+小技3つ】](https://zenn.dev/ichigoooo/articles/5111e8a96a4c19)
