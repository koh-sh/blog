---
title: "WezTerm Pluginを作ってみる"
date: 2025-03-23T22:43:36+09:00
draft: false
tags: ["wezterm", "lua", "tools"]
# images: [] # OGP image
# lastmod: 2025-03-23T17:05:36+09:00
---

# 概要

[WezTerm](https://wezterm.org) というターミナルアプリがあり、ここ１年くらい使用しています。

<https://zenn.dev/koh_sh/scraps/1d2c2d2d98577c>

あまりネット上に情報がないのですが、 WezTerm にはPluginの仕組みがあります。

<https://wezterm.org/config/plugins.html>  
<https://github.com/wezterm/wezterm/commit/e4ae8a844d8feaa43e1de34c5cc8b4f07ce525dd>

WezTermの設定はLuaスクリプトで行うのですが、設定ファイルをpluginとしてGit経由で使用できるイメージです。

```lua
local wezterm = require 'wezterm'
local a_plugin = wezterm.plugin.require 'https://github.com/owner/repo'

local config = wezterm.config_builder()

a_plugin.apply_to_config(config)

return config
```

config_builderで生成したconfigを、pluginで拡張するようなイメージです。  
Awesomeリストもあるので気になるものがあれば試してみてください。

<https://github.com/michaelbrusegard/awesome-wezterm>

# 自作してみる

せっかくなので試しに自分でもPluginを作成してみました。

<https://github.com/koh-sh/wezterm-theme-rotator>

WezTermを初めて使うときにおそらく皆驚くのが、提供されているThemeの多さです。

<https://wezterm.org/colorschemes/index.html>

その数は1000以上あり、一つ一つ設定して試していくのはとても手間です。  
そこでショートカットでthemeを切り替えられるようにするPluginを作成しました。

![gif](/images/wezterm-plugin/1.gif)

気分でThemeを変更するみたいなケースもあるかと思い、ランダムに設定もできるようにしています。  
興味があればぜひ使ってみてください。

# 作り方

公式のドキュメントに作成の仕方はあります。

<https://wezterm.org/config/plugins.html#developing-a-plugin>

仕様としては以下の3点を守れば基本的にOKです。

1. `plugin/init.lua` ファイルを作成する (ここがEntryPointになる)
2. `init.lua` から `apply_to_config` function を export した module を return する。`apply_to_config` は  config builder を必須のパラメータとして受け取る。第二パラメータにオプションでtableを渡すことができます。
3. Gitリポジトリとして設定する

`wezterm.lua` から呼び出す時はローカルファイルURLで指定ができるため、基本はこちらで動作確認するのがおすすめです。

```diff
local wezterm = require 'wezterm'
-local a_plugin = wezterm.plugin.require 'https://github.com/owner/repo'
+local a_plugin = wezterm.plugin.require 'file:///path/to/project'

local config = wezterm.config_builder()

a_plugin.apply_to_config(config)

return config
```

## ポイント

いくつかコツやはまりどころなどがあるのでまとめます。

### ローカルファイルはGit commitしないと更新されない

ローカルファイルを指定する場合そのprojectで `git init` し、スクリプト更新するごとにcommitしないと反映されません。  
設定で回避できるかもしれませんが、調べきれていないです。  
これがドキュメントにちらっとしか書かれておらず、見落としがちなポイントかなと思います。

### ログ

デフォルトだとエラーログは `~/.local/share/wezterm/wezterm-gui-log-xxxxx.txt` に作成されます。  
エラーログもここに出ますし、 `wezterm.log_info()` した内容もここに出力されるのでデバッグ時に利用できます。

### plugin更新

pluginの更新はCLIではできず、デバッグ用のLua REPLから実施する必要があります。

<https://wezterm.org/troubleshooting.html#debug-overlay>

デフォルトだと Ctrl+Shift+L で起動できます。  
起動したら `wezterm.plugin.update_all()` を実行するとpluginの更新ができます。

実装中に頻繁に更新する場合は `wezterm.lua` に直接 `wezterm.plugin.update_all()` を書いてしまえば、設定をreloadするたびに更新されます。

# まとめ

WezTermはLuaスクリプトで全ての設定を管理できるのが魅力ですが、スクリプトの再利用性や配布の仕組みがないので、他のユーザの例などを探すのが少し手間です。  
WezTermの便利な設定をPluginで管理できる世界になるといいなと思います。
