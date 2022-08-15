---
title: "GitHub PagesのJekyllのディレクトリ構成など調べる"
date: 2022-08-15T15:15:13+09:00
draft: false
tags: ["GitHub-Pages", "Jekyll"]
---

元々GitHub Pagesで簡易的なCV(Curriculum Vitae)を作成していて、index.md一枚のみで英語で作成していました。

https://cv.koh-sh.com  
https://github.com/koh-sh/cv

index.mdにMarkdown書けばいい感じにページ作ってくれるのはなんとなく知っていたんですが、CVを日英両方に対応させたかったのでついでに仕組みとかちょっと調べてみました。

# GitHub Pagesとは

https://pages.github.com

GitHubリポジトリのコンテンツを無料でweb公開できるサービスです。  
デフォルトだと `https://username.github.io.`での公開になりますが、URLをカスタマイズできたりJekyllを使用してブログなどの静的サイトを作成することもできます。

# Jekyllとは

https://jekyllrb.com

Ruby製の静的サイトジェネレータです。  
Markdownのコンテンツをbuild時にhtmlに変換してくれます。

# Jekyllのディレクトリ構成

https://jekyllrb.com/docs/structure/

公式ドキュメントより、ディレクトリ構成は下記になります。

```bash
.
├── _config.yml
├── _data
│   └── members.yml
├── _drafts
│   ├── begin-with-the-crazy-ideas.md
│   └── on-simplicity-in-technology.md
├── _includes
│   ├── footer.html
│   └── header.html
├── _layouts
│   ├── default.html
│   └── post.html
├── _posts
│   ├── 2007-10-29-why-every-programmer-should-play-nethack.md
│   └── 2009-04-26-barcamp-boston-4-roundup.md
├── _sass
│   ├── _base.scss
│   └── _layout.scss
├── _site
├── .jekyll-cache
│   └── Jekyll
│       └── Cache
│           └── [...]
├── .jekyll-metadata
└── index.html # can also be an 'index.md' with valid front matter
```

細かいディレクトリごとの役割は公式ドキュメントを見ていただきたいですが、基本的には `_config.yml`を作成してMarkdown or htmlでコンテンツを作成してbuildすると`_site`以下にbuildされたコンテンツが生成されます。

`_config.yml`の作成の仕方についてはJekyllのドキュメントとGitHub Pagesのドキュメントを参考にしてください。

https://jekyllrb.com/docs/configuration/  
https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/about-github-pages-and-jekyll

また `index.md`以外のパスでコンテンツを公開する際のルールは下記になります。

index.html or index.md and other HTML, Markdown files
>Provided that the file has a front matter section, it will be transformed by Jekyll. The same will happen for any .html, .markdown,  .md, or .textile file in your site’s root directory or directories not listed above.

上記のディレクトリ構成以外のパスで、[front matter section](https://jekyllrb.com/docs/front-matter/)の記載があって、`.html`, `.markdown`, `.md`, `.textile`を拡張子とするファイルは全てJekyllによってhtmlに変換されます。

# CVへのページ追加

なので元々は `index.md`のみ配置していたのですが、新たに`./jp.md`を追加して日本語でのCVも公開するようにしました。  
ブラウザからアクセスする際には `https://cv.koh-sh.com/jp`でアクセスすることができます。  
また各ページ同士は相対パスでアクセスできるので下記のようにリンクを記載してあげると英語/日本語ページを行き来できます。

index.md

```
[[日本語はこちら]](./jp)
```

jp.md

```
[[For English]](./)
```

こちらは実際にページ追加した際の変更内容です。  
https://github.com/koh-sh/cv/pull/1/files

# まとめ

数年前になんとなくGitHub Pagesを使ってみたくて適当に設定して雰囲気で使ってたけど、ちゃんと理解できるとさらに色々活用できそう