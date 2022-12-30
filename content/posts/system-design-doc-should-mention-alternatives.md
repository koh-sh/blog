---
title: "設計書には採用しなかった案も書いた方がいい"
date: 2022-12-30T17:22:24+09:00
draft: false
tags: ["system-design", "poem"]
---

# TL;DR

- 設計書には採用しなかった案も書いた方がいい
- B案をなぜ棄却したかが書いてあると後から読んだ人が設計の意図を理解しやすい
- ソフトウェアアーキテクチャの基礎を読もう

# あるある

既に稼働しているシステムなどについてキャッチアップしようとして、設計書などを読むことはよくありますが

- 〇〇機能を実現するためにAのサービスを使っている
- xx言語で実装されていてyyサーバで稼働している

ということは理解できたけど

- なんでAのサービスにしたの？Bのサービスが定番だと思うけどこっちじゃないの？
- yyサーバよりzzサーバで動かした方が良さそうだけどなんでyyサーバなの？

のような疑問を持ったりすることはよくあると思います。

たいていの場合は設計者に直接聞けばいいと思いますが、設計した人はすでに退職したり異動になっていたりなんてことはよくあります。

# 不採用案を書いてあると何がうれしい？

[ソフトウェアアーキテクチャの基礎][link1]には下記の記載があります。

>”アーキテクチャには正解も間違いもない。ただトレードオフがあるだけだ"

つまり設計時に採用されたA案にもトレードオフがあり、採用されなかったB案にも同様にトレードオフがあります。

設計の背景を理解せずに運用していると、
- 既存設計の悪いところにばかり目がいって不満を持ちながら業務に臨んでしまう
- 改善のためにB案に実装を変えようとしたが、B案のデメリットに実装後やその運用開始後に気が付く

なんてことが起こりがちです。

そういったことを防ぐために設計書には当時検討した案を列挙して、なぜA案を選択したのか、なぜB案を選択しなかったのかを記載しておくと後から設計書を読む人が設計の背景を理解できてとてもいいと思います。

# どう書くといい？

個人的にはGoogleの[Design Docs][link2]のような形式が良いと思います。  
(Design Docsは設計書とは別のドキュメントとして使用する場合が多いみたいですが)

Design Docsに記載する項目の一つに[Alternatives considered][link3]というものがあります。  
採用しうる設計案を列挙し、それらの中から選択するためのトレードオフを記載するとあります。  
そうすることによりなぜ現在の設計案になったのか、なぜ別の案が採用されなかったかの経緯を読者が理解することができます。

>This section lists alternative designs that would have reasonably achieved similar outcomes. The focus should be on the trade-offs that each respective design makes and how those trade-offs led to the decision to select the design that is the primary topic of the document.

>While it is fine to be succinct about solution that ended up not being selected, this section is one of the most important ones as it shows very explicitly why the selected solution is the best given the project goals and how other solutions, that the reader may be wondering about, introduce trade-offs that are less desirable given the goals.

とはいえ設計書のフォーマットはチームによってテンプレ化されているケースが多いと思うので、形式を変えるのが難しければ備考やメモ程度に記載しておくだけでいいと思います。  
B案C案についても検討したけど~~のデメリットが大きかったので採用しなかった。みたいに書いておくだけでもだいぶ読者にとっての情報量が変わってくると思います。

# まとめ

よくGitのコミットメッセージにはWhyを書こうとありますが、設計などのドキュメントにも同じことが言えると思います。  
後から読む人にとってどういった情報が必要になるかを考えてドキュメント書きましょう。(自戒を込めて)

[link1]: https://www.oreilly.co.jp/books/9784873119823/
[link2]: https://www.industrialempathy.com/posts/design-docs-at-google/
[link3]: https://www.industrialempathy.com/posts/design-docs-at-google/#alternatives-considered
