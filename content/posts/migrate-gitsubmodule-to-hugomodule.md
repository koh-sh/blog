---
title: "Hugoのthemeをgit submoduleからhugo modでの管理に移行する"
date: 2023-08-19T22:00:44+09:00
draft: false
tags: ["hugo", "golang"]
---

# 概要

hugoのthemeはこれまではgit submoduleで導入するのが一般的でしたが、 Hugo v0.56 からは Hugo Modulesという機能が実装されthemeや各種拡張などを管理できます。  

[Hugo Modules][link1]

おそらく今後はHugo Modulesを利用する形が推奨されると思うので、本ブログでもmoduleを使う形に移行しました。  
その手順をまとめておきます。

ちなみに本ブログで設定反映させた時の内容は下記になります。  
[feature: migrate theme from git submodule to hugo mod][link2]

# 前提

本ブログでの動作確認です。  
バージョンやthemeの違いによって動作が変わる可能性があります。

```bash
% go version
go version go1.21.0 darwin/arm64
% hugo version
hugo v0.117.0-b2f0696cad918fb61420a6aff173eb36662b406e+extended darwin/arm64 BuildDate=2023-08-07T12:49:48Z VendorInfo=brew
%
```

theme: [m10c][link3]

# 手順

## 1. hugo moduleのinit

`hugo mod init [project]` を実行します。

```bash
% hugo mod init github.com/koh-sh/blog
go: creating new go.mod: module github.com/koh-sh/blog
go: to add module requirements and sums:
	go mod tidy
```

## 2. configの修正

configにthemeの設定があると思うのでそこの修正、およびmodule importの記述を追加します。

```diff
diff --git a/config.toml b/config.toml
index acf71d5..f1480b1 100644
--- a/config.toml
+++ b/config.toml
@@ -1,6 +1,6 @@
 baseURL = "https://blog.koh-sh.com"
 title = "koh's blog"
-theme = "m10c"
+theme = "github.com/vaga/hugo-theme-m10c"
 paginate = 5
 hasCJKLanguage = true
 summaryLength = 150
@@ -64,3 +64,7 @@ tags = [

 [outputs]
     home = ["HTML", "RSS", "JSON"]
+
+[module]
+ [[module.imports]]
+   path = 'github.com/vaga/hugo-theme-m10c'
```

## 3. get module

module importとgo.modへの反映をします。

```bash
hugo mod get -u
```

## 4. git submodule関連の設定の削除

submodule関連の設定やファイルを削除します。  
`.git/config` がsubmodule関連の設定を持っている場合があるため、その場合はそこの記述も削除します。

```bash
% rm -rf themes
% rm .gitmodules
```

## 5. 動作確認

これでhugo serverなどで動作確認できます。  
`go.mod`がgoのversionを持つので外部サービスでホスティングしている場合バージョンが合わないとデプロイが失敗するケースがあるので確認が必要です。

CloudFlare Pagesの場合deployの環境変数でGoとHugoのバージョン指定ができます。

[Language support and tools][link4]

# まとめ

やはりgit submoduleよりは管理しやすくなったと思うので嬉しいですね。  
Theme以外にもhugo module色々あるようなので試してみたい。

[link1]: https://gohugo.io/hugo-modules/
[link3]: https://github.com/vaga/hugo-theme-m10c
[link2]: https://github.com/koh-sh/blog/pull/5
[link4]: https://developers.cloudflare.com/pages/platform/language-support-and-tools/
