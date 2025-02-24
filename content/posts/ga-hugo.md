---
title: "Google AnalyticsをHugoの特定の環境のみに設定する"
date: 2025-02-24T23:16:09+09:00
draft: false
tags: ["hugo", "Google-Analytics"]
# images: [] # OGP image
# lastmod: 2025-02-24T22:36:09+09:00
---

# TL;DR

- build時に `HUGO_SERVICES_GOOGLEANALYTICS_ID=G-XXXXXXXX` を設定するとGAを有効化できます。
- 特定の環境 (例: 本番環境) のbuild環境に環境変数を設定することで、GA設定有無を簡単に切り替えられます。
- 使用しているThemeによって機能しない場合もあるので、各自で動作確認してください。

# 説明

## Embedded templates

Hugoには標準の機能として、Google Analyticsの設定をサポートしています。

<https://gohugo.io/templates/embedded/#google-analytics>

config.tomlに以下を記載すると、Google Analyticsを有効化できます。

```toml
[services]
  [services.googleAnalytics]
    id = 'G-MEASUREMENT_ID'
```

設定するとheaderにGAのコードが追加されます。
![img](/images/ga-hugo/1.avif)

## 環境変数での設定

Hugoの設定はファイルのみでなく、環境変数でも設定できます。

<https://gohugo.io/getting-started/configuration/#configure-with-environment-variables>

HUGO_xxxの形式で環境変数を設定すると、config.tomlの設定として読み込まれます。

```bash
env HUGO_TITLE="Some Title" hugo
```

Cloudflare PagesやNetlifyなどでホスティングしている場合は、ビルド時の環境変数を追加するだけでGAの設定が完了します。  
例えばCloudflare Pagesの場合は以下のページで設定できます。

<https://developers.cloudflare.com/pages/configuration/build-configuration/#environment-variables>

## 環境ごとのconfig

実際に動作確認はしていないですが、環境ごとにconfigを分けることもできるみたいです。

<https://gohugo.io/getting-started/configuration/#configuration-directory>

```txt
my-project/
└── config/
    ├── _default/
    │   ├── hugo.toml
    │   ├── menus.en.toml
    │   ├── menus.de.toml
    │   └── params.toml
    └── production/
        └── params.toml
```

build時に `--environment staging` のように指定すると環境を切り替えられるそうですが、今回はGAのみだったので避けました。

# まとめ

これらによって、 `HUGO_SERVICES_GOOGLEANALYTICS_ID=G-XXXXXXXX` の設定のみで完結します。便利。
