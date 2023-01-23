---
title: "Magic Trackpadからトラックボールマウスに乗り換える"
date: 2023-01-21T16:02:07+09:00
draft: false
tags: ["gadget"]
---

5,6年くらいずっとMagic Trackpadを使っていたんですが、手首がたまに痛くなってしまいトラックボールマウスを試してみました。

{{<tweet user="koh_sh" id="1614103472546402304">}}

購入したのはELECOMの[DEFT PRO][link1]です。  
ロジクールのものと悩んだんですが、親指が疲れるっていうレビューをいくつか見かけたのとボタン数の多さでこっちにしてみました。

今はMacBookで使用していますが割といい感じです。  
設定方法と個人的に思ったいいところと微妙なところをメモっておきます。

# 環境

```bash
% sw_vers
ProductName:		macOS
ProductVersion:		13.0.1
BuildVersion:		22A400
```

エレコムマウスアシスタント: Ver.5.2.07.000

# 設定

接続自体は有線, ワイヤレスレシーバー, bluetoothから選べます。  
私はワイヤレスレシーバーを使っています。刺すだけでつながります。

ボタン配置などの設定は専用のソフトをインストールします。  
[エレコム マウスアシスタント (Mac版)][link2]

インストール後に再起動するとシステム設定の一番下にELECOM Mouse Assistantが追加されます。

![img](/images/magic-trackpad-to-trackballs/1.avif)

ボタン配置はちょこちょこ試しましたがこんな感じにしています。

![img](/images/magic-trackpad-to-trackballs/2.avif)

デフォルトから変えてるところは

- カスタム6にアプリ内のウィンドウ切り替え(Magic Trackpadでの3本指下スワイプ)
- カスタム7にアプリ間のウィンドウ切り替え(Magic Trackpadでの3本指上スワイプ)
- 左右スクロールとブラウザback/forwardを入れ替え

あたりです。

# 使ってみて

Magic Trackpadと比べたDEFT PROのいいところは個人的にこの辺です。

- 手が疲れない
- 思ったより早く慣れる(3時間もすればほぼ不便しない)
- 複数モニタでのカーソル移動が楽

逆に微妙なところはこんな感じです。

- Magic Trackpadにしかできない操作がある
- PADでゲームなど別のことをしながらの操作がしにくい
- 一部の挙動が怪しい

一部詳細に書くと

### Magic Trackpadにしかできない操作がある

自分がMagic Trackpadを使用していたときは

- フルスクリーンでのアプリ切り替え(3本指で横スワイプ)
- Force Click

を結構使用していたんですがこれらに対応する操作がエレコムマウスアシスタント上になさそうです。  

### 一部の挙動が怪しい

ハード起因かOS起因かわからないですが

- ホイールでのスクロールが反応遅い
- デフォルトの戻るボタンがたまに2重で動作する

などが自分の場合ありました。  
スクロールはラグいけどそこまでストレスではなく、2重で戻ってしまうのはボタン割り当てを変えたら解決したので一旦そのまま使ってます。

# まとめ

現状メインでDEFT PROを使って一週間くらい経ちますがおおむね快適です。  
一応サブとしてMagic Trackpadも隣において使っていますがしばらくこの形に落ち着きそう。

[link1]: https://www.elecom.co.jp/products/M-DPT1MRXBK.html
[link2]: https://www.elecom.co.jp/support/download/peripheral/mouse/assistant/mac/
