---
title: "Cobraでサブコマンドのpackageを分ける"
date: 2023-08-13T15:32:22+09:00
draft: false
tags: ["golang", "Cobra"]
---

# 前置き

先日CodeBuildを操作するCLIを作った際に[Cobra][link1]というCLIフレームワークを利用しました。

[複数のCodebuildを同時に「上書きでビルドを開始する」CLIツールをGoで書いた]({{< ref "/posts/cli-for-codebuild.md" >}})

サブコマンドの管理やフラグの設定などを容易に実装できるためとても便利なんですが、デフォルトだとサブコマンドが全て同じ `cmd` というpackageに内包されます。  
そのためnamespaceがサブコマンド間で全て共有され少し微妙です。

なのでサブコマンドのpackageを分割して保守性を上げてみました。

本記事の内容はほぼ以下のstack overflowの記事と同じです。  
ただ日本語でググった時にパッと見情報がなかったのと、自身の理解整理のためにまとめています。

[How to put cobra sub commands sources into separate folders][link2]

# 何が困るの？

デフォルトで `test-cli` というコマンドに `subA`, `subB` というサブコマンドを作成した場合このような形になります。

```bash
go mod init test-cli
cobra-cli init
cobra-cli add subA
cobra-cli add subB
```

```bash
% tree .
.
├── LICENSE
├── cmd
│   ├── root.go
│   ├── subA.go
│   └── subB.go
├── go.mod
├── go.sum
└── main.go
```

```bash
% go run ./main.go
A longer description that spans multiple lines and likely contains
examples and usage of using your application. For example:

Cobra is a CLI library for Go that empowers applications.
This application is a tool to generate the needed files
to quickly create a Cobra application.

Usage:
  test-cli [command]

Available Commands:
  completion  Generate the autocompletion script for the specified shell
  help        Help about any command
  subA        A brief description of your command
  subB        A brief description of your command

Flags:
  -h, --help     help for test-cli
  -t, --toggle   Help message for toggle

Use "test-cli [command] --help" for more information about a command.
```

```bash
% go run ./main.go subA
subA called
```

`root.go`, `subA.go`, `subB.go` はいずれも `cmd` packageに含まれるため、それぞれのファイル内で定義された変数や関数に相互にアクセスできます。

例として `subA.go` で `funcA` を定義して、`subB.go` からアクセスしてみます。

```diff
// subA.go

+func funcA() string {
+	return "Function defined in subA.go"
+}

```

```diff
// subB.go

Cobra is a CLI library for Go that empowers applications.
This application is a tool to generate the needed files
to quickly create a Cobra application.`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("subB called")
+		fmt.Println(funcA())
	},
}

```

```bash
% go run ./main.go subB
subB called
Function defined in subA.go
```

今後開発していってサブコマンドが増えていった場合、ある一つのサブコマンドを改修した時に他のサブコマンドが壊れてしまうというケースが発生しそうです。

# 改修

上記の状態を直すため改修していきます。

## 1. ディレクトリ構成変更

まずディレクトリ構成を以下の形に変えます。

```bash
% tree
.
├── LICENSE
├── cmd
│   ├── root.go
│   ├── subA
│   │   └── subA.go
│   └── subB
│       └── subB.go
├── go.mod
├── go.sum
└── main.go

```

## 2. `rootCmd` を `RootCmd` に変換する

Goは関数などが大文字ではじまる場合は別パッケージから参照可能、小文字はじまりだと不可能になります。  
今回はサブコマンドごとに別packageになるため、大文字に変更してあげます。

```diff
// root.go

-var rootCmd = &cobra.Command{
+var RootCmd = &cobra.Command{
	Use:   "test-cli",
	Short: "A brief description of your application",

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
-	err := rootCmd.Execute()
+   err := RootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}


	// rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/.test-cli.yaml)")

	// Cobra also supports local flags, which will only run
	// when this action is called directly.
-	rootCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
+	RootCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
```

```diff
// subA.go and subB.go

func init() {
-	rootCmd.AddCommand(subACmd)
+	RootCmd.AddCommand(subACmd)

	// Here you will define your flags and configuration settings.

```

## 3. package名を変更する

subAとsubBのpackageをそれぞれ変更します。

```diff
// subA.go and subB.go

-package cmd
+package subA
```

## 4. サブコマンド側でcmdをimportして、RootCmdの呼び出しを修正

```diff
// subA.go and subB.go

import (
	"fmt"

+	"test-cli/cmd"
	"github.com/spf13/cobra"
)

func init() {
-	RootCmd.AddCommand(subACmd)
+	cmd.RootCmd.AddCommand(subACmd)

	// Here you will define your flags and configuration settings.

```

## 5. main.goでサブコマンドのパッケージをimport

今のままだと subAとsubBがどこからも呼ばれないのでmain.goのimportに追加してあげます。

```diff
// main.go

package main

-import "test-cli/cmd"
+import (
+	"test-cli/cmd"
+	_ "test-cli/cmd/subA"
+
+	_ "test-cli/cmd/subB"
+)

func main() {
	cmd.Execute()
}
```

# 動作確認

これにより、サブコマンド間のpackageが別になりnamespaceが分割されます。

先の例のようにsubBからfuncAを呼ぼうとしてもエラーになります。

```bash
% go run ./main.go subB
# test-cli/cmd/subB
cmd/subB/subB.go:44:15: undefined: funcA
```

仮に意図的にサブコマンド間でリソースを共有する場合は、上記のように関数名を大文字はじまりにして呼び出し元でimportしてあげるとアクセスできます。
なのでコードが冗長になりすぎることも防げます。

# まとめ

少しだけコードは冗長になりますが、packageが分割されることによってより保守性の高い状態になります。  
[hugo][link3]もCobraを使用していますが本記事とは異なった形のディレクトリ構成になっているので、他にもやり方はありそうです。


[link1]: https://cobra.dev
[link2]: https://stackoverflow.com/questions/73986477/how-to-put-cobra-sub-commands-sources-into-separate-folders
[link3]: https://github.com/gohugoio/hugo
