---
title: "Conventional Commentsを意識して使っていきたい"
date: 2025-02-09T11:28:55+09:00
draft: false
tags: ["git", "github"]
---

# Conventional Commentsとは

Gitのconventional commitsのように、PRレビューなどでコメントするときの形式を統一するためのものです。

<https://conventionalcomments.org>

ベースのフォーマットは以下のようになります。

```text
<label> [decorations]: <subject>

[discussion]
```

- label - コメントの種類を示す単一のラベルです
- subject - コメントの主なメッセージ内容です
- decorations (オプション) - コメントに付加的な情報を追加するための装飾ラベルです。カッコで囲み、カンマで区切って複数指定できます
- discussion (オプション) - 補足説明、コンテキスト、理由付け、解決に向けた次のステップなど、詳細な情報を記述する部分です

フォーマットに従ってlabelやdecorationsをつけることで、コメントの意図を伝えることができます。

主なlabelには以下のようなものがあります：

- praise: 良い点を指摘する際に使用
- question: 質問や確認が必要な際に使用
- suggestion: 改善案を提案する際に使用
- nitpick: 些細な指摘をする際に使用
- issue: 問題点を指摘する際に使用

# GitHub Saved Replyへの設定

毎回labelを調べてコメントするのは手間なので、GitHubのSaved Replyに設定しておきます。

<https://docs.github.com/en/get-started/writing-on-github/working-with-saved-replies>

Saved Replyに設定しておくと、コメントする際にそのまま呼び出すことができます。

右側のSaved repliesボタンか、 `ctrl + .` で呼び出すことができます。

![img](/images/conventional-comments/1.avif)

![img](/images/conventional-comments/2.avif)

Saved Replyへの設定自体は以下のgistを参考にしました。  
スクリプト一発でconventional commentsのlabel一覧を登録できます。

<https://gist.github.com/ifyoumakeit/4148a8c3e61b7868935651272c03f793>

![img](/images/conventional-comments/3.avif)

# まとめ

とりあえず慣れるまではフォーマットを意識してコメントしてみることにする。  
フォーマットを意識することで、コメントの意図が伝わりやすくなればいいなと思う。

