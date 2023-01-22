---
title: "HugoのBlogに記事検索機能を追加する"
date: 2023-01-11T21:27:50+09:00
draft: false
tags: ["hugo"]
---

このブログは[Hugo][link1]で構築されています。  
[Cloudflare PagesとHugoでブログ作った]({{< ref "/posts/hugo-and-cloudflare-pages.md" >}})  

シンプルかつ高速でとても気に入っているのですが、流石に記事検索機能が欲しいなと思っていたので追加しました。

![img](/images/search-form-for-hugo-blog/1.avif)

# 実装

Hugoそのものに検索機能はないのですが、公式ドキュメントにいくつか実装パターンが紹介されています。

[Search for your Hugo Website][link2]

その中でも追加でライブラリのインストールなどが不要でクライアント側で完結するこちらの記事を参考にしました。

[Add Search To A Hugo Site][link3]

基本的に記事の通りにファイルを配置していけば完結しますがちょっと変えたところなどを記載していきます。

具体的な変更ファイルはこちらのPRでまとまっています。

[feat: add search form #2][link4]

### HTML - Search Form

こちらは検索のinputを入力する枠部分です。  
この4行のhtmlを好きなところに埋め込んでねってことなのでメニューのiconの下に配置しました。

### Page - content/search/_index.md

これは `/search`のパスを有効にするために配置します。  
特に`_index.md`の形にする必要はない(はず)なのでディレクトリを切らずにそのままファイルにしてます。

### Layout - layout/_default/search.html

基本的に中身は変えていないですが、私の使用しているtheme(m10c)の場合JavaScriptのファイルを置くデフォルトのパスがなかったため、読み込むように一行追記しています

```javascript
<script src="/js/search.js"></script>
```

### JS

中身はそのままです。  
ファイルを置く位置およびファイル名は先ほどのsearch.htmlから読めればいいので、themeによってパスが指定されていればそこに、なければ適当な位置に配置します。

### The Data - layouts/_default/index.json

こちらが実際に検索実行するためのデータソースです。  
記事のタイトルやタグ、本文を含むJsonを生成します。

内容そのままだと投稿した記事以外のページ(Aboutなど)も検索対象になっていたため、Rangeの箇所にwhereを追加しています。  
※ 最初に貼ったPRから追加で修正しています  
[fdff40eeba1618145c45155582205a3bea771aad][link5]

```
{{- range where .Site.RegularPages "Type" "posts" -}}
```

### Config

これはそのままです。特に編集はしていません。

# 動作確認

![img](/images/search-form-for-hugo-blog/2.avif)

このような形で検索ができ、ヒットした箇所がハイライトされます。  
ただし使用している[Fuse.js][link6]が曖昧検索の機能のため綺麗にマッチした記事以外も検索結果に表示されます。

[オプション][link7]をうまく調整すれば検索結果をコントロールできそうなので追々試してみたいです。

[link1]: https://gohugo.io
[link2]: https://gohugo.io/tools/search/
[link3]: https://makewithhugo.com/add-search-to-a-hugo-site/
[link4]: https://github.com/koh-sh/blog/pull/2/files
[link5]: https://github.com/koh-sh/blog/commit/fdff40eeba1618145c45155582205a3bea771aad
[link6]: https://fusejs.io
[link7]: https://fusejs.io/api/options.html
