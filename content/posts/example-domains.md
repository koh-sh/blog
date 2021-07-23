---
title: "例示用/テスト用に使えるドメイン"
date: 2021-07-23T16:55:43+09:00
draft: false
tags: ["domain"]
---

テスト用やドキュメントに掲載するドメインを選ぶ際にsample\\.comとかtest\\.comなどを直感的に使いがちですが、これらのドメインはたいてい実在する企業や組織が所有しています。  
では具体的にどのドメインを使用すればいいかですが、用途別にいくつかドメインが用意されていますのでそれを利用しましょう。

## TLD(Top Level Domain)

[RFC 2606](https://datatracker.ietf.org/doc/html/rfc2606)によると下記の4つのTLDが用意されています。

```
.test
.example
.invalid
.localhost
```

- `.test`はテスト用、特にDNS関連のコード用
- `.example`はドキュメントでの利用や、その他例示用
- `.invalid`は例示用ですが特に有効でないドメインの例としての利用
- `.localhost`は主にループバック用のアドレスとして利用。他の用途での利用は推奨されない。

## Second Level Domain

[RFC 2606](https://datatracker.ietf.org/doc/html/rfc2606)によると下記の3つのドメインがいずれも例示用として用意されています。

```
example.com
example.net
example.org
```

またTLD, Second Level Domainともに[RFC 6761](https://datatracker.ietf.org/doc/html/rfc6761)に詳細な記載もあります。  
特にユーザとしてどの様に扱うかと、WebアプリケーションやDNSサーバ/レジストリ側がこれらのドメインをどの様に扱うべきかが記載されています。

## JPドメイン

JPドメインについても例示用のドメインが用意されています。  
ref) https://jprs.jp/faq/use/#q3

### exampleを用いたもの

```
EXAMPLE.JP
EXAMPLE.CO.JP
EXAMPLE.NE.JP
```

### EXAMPLEの後に1桁の数字（0から9）がつく文字列を用いたもの

```
EXAMPLE1.JP
EXAMPLE2.CO.JP
EXAMPLE3.NE.JP
```

### 日本語ドメイン

```
ドメイン名例.JP （日本語JPドメイン名）
XN--ECKWD4C7CU47R2WF.JP （「ドメイン名例.JP」のpunycode表記）
```

# まとめ

業務で扱う機会があり改めてRFCなど見てみたが意外と知らないことが多く勉強になった。