---
title: "Cloudflare PagesとHugoでブログ作った"
date: 2021-06-20T00:02:07+09:00
tags: ["hugo", "Cloudflare-Pages"]
draft: false
---

Cloudflare PagesとHugoを使用して新しくブログを作ってみました。  
基本的には[公式のFlamework Guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-hugo-site)を参考にしながら進めました。  

こちらも一部参考にさせていただきました。  
https://dev.classmethod.jp/articles/cloudflare-pages/


ローカルの環境

```
┬─[koh@Kohs-MacBook-Pro-M1:~/github]─[15:35:14]─[G:=]
╰─>$ sw_vers
ProductName:	macOS
ProductVersion:	11.4
BuildVersion:	20F71
┬─[koh@Kohs-MacBook-Pro-M1:~/github]─[15:35:19]─[G:=]
╰─>$ hugo version
hugo v0.83.1+extended darwin/arm64 BuildDate=unknown
┬─[koh@Kohs-MacBook-Pro-M1:~/github]─[15:35:19]─[G:=]
╰─>$
```

## ローカルでサイトを作る

hugo newして

```
┬─[koh@Kohs-MacBook-Pro-M1:~/github]─[11:59:46]─[G:=]
╰─>$ hugo new site blog
Congratulations! Your new Hugo site is created in /Users/koh/github/blog.

Just a few more steps and you're ready to go:

1. Download a theme into the same-named folder.
   Choose a theme from https://themes.gohugo.io/ or
   create your own with the "hugo new theme <THEMENAME>" command.
2. Perhaps you want to add some content. You can add single files
   with "hugo new <SECTIONNAME>/<FILENAME>.<FORMAT>".
3. Start the built-in live server via "hugo server".

Visit https://gohugo.io/ for quickstart guide and full documentation.
┬─[koh@Kohs-MacBook-Pro-M1:~/github]─[11:59:46]─[G:=]
╰─>$
```

git initしてからthemeを追加します。

```
┬─[koh@Kohs-MacBook-Pro-M1:~/github/blog]─[12:02:25]─[G:=]
╰─>$ git init
Initialized empty Git repository in /Users/koh/github/blog/.git/
┬─[koh@Kohs-MacBook-Pro-M1:~/github/blog]─[12:02:44]─[G:=]
╰─>$ git submodule add https://github.com/vaga/hugo-theme-m10c.git themes/m10c
Cloning into '/Users/koh/github/blog/themes/m10c'...
remote: Enumerating objects: 397, done.
remote: Counting objects: 100% (17/17), done.
remote: Compressing objects: 100% (16/16), done.
remote: Total 397 (delta 2), reused 3 (delta 0), pack-reused 380
Receiving objects: 100% (397/397), 914.77 KiB | 14.29 MiB/s, done.
Resolving deltas: 100% (142/142), done.
┬─[koh@Kohs-MacBook-Pro-M1:~/github/blog]─[12:02:45]─[G:=]
╰─>$
```

themeは[m10c](https://themes.gohugo.io/hugo-theme-m10c/)を利用しました。

config.tomlをよしなに編集します。

```
┬─[koh@Kohs-MacBook-Pro-M1:~/github/blog]─[12:53:48]─[G:=]
╰─>$ cat config.toml
baseURL = "https://blog.koh-sh.com/"
title = "koh's blog"
theme = "m10c"
paginate = 5

[menu]
  [[menu.main]]
    identifier = "home"
    name = "Home"
    url = "/"
    weight = 1
  [[menu.main]]
    identifier = "tags"
    name = "Tags"
    url = "/tags/"
    weight = 2
  [[menu.main]]
    identifier = "about"
    name = "About"
    url = "/about/"
    weight = 3

[params]
  author = "koh-sh"
  description = "Sys Admin who loves automation."
  menu_item_separator = " - "
  avatar = "avatar.png"
  [[params.social]]
    icon = "github"
    name = "Github"
    url = "https://github.com/koh-sh"
  [[params.social]]
    icon = "twitter"
    name = "Twitter"
    url = "https://twitter.com/koh_sh"
┬─[koh@Kohs-MacBook-Pro-M1:~/github/blog]─[12:53:52]─[G:=]
╰─>$ ll static/
total 1648
-rwxr-xr-x@  1 koh  staff  842938 Dec 26  2019 avatar.png
drwxr-xr-x   3 koh  staff      96 Jun 19 12:39 .
drwxr-xr-x  12 koh  staff     384 Jun 19 12:53 ..
┬─[koh@Kohs-MacBook-Pro-M1:~/github/blog]─[12:53:53]─[G:=]
╰─>$
```

テスト投稿を追加

```
┬─[koh@Kohs-MacBook-Pro-M1:~/github/blog]─[12:32:45]─[G:=]
╰─>$ hugo new posts/hello-world.md
/Users/koh/github/blog/content/posts/hello-world.md created
```

```
┬─[koh@Kohs-MacBook-Pro-M1:~/github/blog]─[12:33:45]─[G:=]
╰─>$ cat content/posts/hello-world.md
---
title: "Hello World"
date: 2021-06-19T12:32:45+09:00
draft: false
---
hello world

```

手元で動作確認できます。  
hugo serverしてhttp://localhost:1313/にアクセス

![localhost](/images/hugo-and-cloudflare-pages/1.avif)

## GitHubにリポジトリ作成

リポジトリ新規作成してからpush

```

git add -A
git commit -m "init"

┬─[koh@Kohs-MacBook-Pro-M1:~/github/blog]─[13:01:11]─[G:master=]
╰─>$ git branch -M main

┬─[koh@Kohs-MacBook-Pro-M1:~/github/blog]─[13:01:22]─[G:main=]
╰─>$ git push -u origin main
Enumerating objects: 19, done.
Counting objects: 100% (19/19), done.
Delta compression using up to 8 threads
Compressing objects: 100% (10/10), done.
Writing objects: 100% (19/19), 825.58 KiB | 5.58 MiB/s, done.
Total 19 (delta 0), reused 0 (delta 0), pack-reused 0
To github.com:koh-sh/blog.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
┬─[koh@Kohs-MacBook-Pro-M1:~/github/blog]─[13:01:27]─[G:main=]
╰─>$
```

## Cloudflare側設定

https://pages.cloudflare.com/
からsign up。

GitHubとの連携をしてリポジトリを選択するとそのままbuildの設定まで進みます。

リポジトリの選択をして、

![リポジトリ選択](/images/hugo-and-cloudflare-pages/2.avif)

buildの設定をします。  
Flamework presetからHugoを選択

![build設定](/images/hugo-and-cloudflare-pages/3.avif)

buildログが流れます。  
ただしHugoはデフォルトでインストールされるバージョンが2021/6/19時点だと0.54.0でかなり古くおそらくエラーになります。

![build log](/images/hugo-and-cloudflare-pages/4.avif)

環境変数にてHugoのバージョンを指定して再度buildを実施します。

![環境変数設定](/images/hugo-and-cloudflare-pages/5.avif)

デプロイ完了後にhogehoge.pages.devのドメインが払い出され、サイトにアクセスできます。

https://blog-ddd.pages.dev

これ以降はGitHub側にpushするたびに自動でデプロイしてくれます。

## その他設定

### 独自ドメイン設定

デプロイされたサイトにcustom domainが設定できるので設定をします。  
ネームサーバをCloudflareに設定する方法と、CNAMEでCloudflareに向ける方法の２種類があるので後者のCNAMEの方で設定します。  

set up a custom domainから登録したいドメインを入力し、画面に表示される通りにCNAMEを設定します。  


![ドメイン設定](/images/hugo-and-cloudflare-pages/6.avif)

CNAMEを設定してから確認されるまで私の場合は1時間近くかかりました。すぐに設定が反映されない可能性がありますが少し待ちましょう。

### Web Analytics有効化

設定からWeb Analyticsを有効化できるのでしておきます。

![Web Analytics1](/images/hugo-and-cloudflare-pages/7.avif)
![Web Analytics2](/images/hugo-and-cloudflare-pages/8.avif)

## まとめ

無料でホスティングできてSSLや独自ドメインまで面倒みてくれるのでとても便利ですね。  
UIもわかりやすく今のところストレスなく使えそうで良さげです。
