---
title: "ラズパイをDocker Desktopの代わりのDocker実行環境として使う"
date: 2023-02-12T15:04:30+09:00
draft: false
tags: ["Raspberry-Pi", "docker"]
---

昔に買ったRaspberry Pi4 Model Bを特に使い道なく放置していたのですが、4core/8GB mem/256GB SSDとそれなりにスペック積んでいて勿体無いので実験がてらDockerの実行環境として使ってみようと思います。  
ラズパイ構築した時の内容は[ラズパイにUSBメモリ型SSDを生やす][link1]にまとまってます。

またラズパイ上のDockerdに手元のMacbookからアクセスできるようにします。  
macbookからdocker cliで操作し、ラズパイ上に起動したコンテナに接続するような状態を目指します。
![img](/images/raspberry-pi-for-docker-runtime/1.avif)

# 設定

## ラズパイ側

まずはdockerをインストールします。  
[公式の手順][link2]を参考にdocker-ceをインストールします。

```bash
[pi@raspi4b01] ~
% docker version
Client: Docker Engine - Community
 Version:           23.0.1
 API version:       1.42
 Go version:        go1.19.5
 Git commit:        a5ee5b1
 Built:             Thu Feb  9 19:46:40 2023
 OS/Arch:           linux/arm
 Context:           default

Server: Docker Engine - Community
 Engine:
  Version:          23.0.1
  API version:      1.42 (minimum version 1.12)
  Go version:       go1.19.5
  Git commit:       bc3805a
  Built:            Thu Feb  9 19:46:40 2023
  OS/Arch:          linux/arm
  Experimental:     false
 containerd:
  Version:          1.6.16
  GitCommit:        31aa4358a36870b21a992d3ad2bef29e1d693bec
 runc:
  Version:          1.1.4
  GitCommit:        v1.1.4-0-g5fd4c4d
 docker-init:
  Version:          0.19.0
  GitCommit:        de40ad0
[pi@raspi4b01] ~
%
```

その後にdocker daemonがTCPでのアクセスを受け付けるように設定します。  
デフォルトだと `unix:///var/run/docker.sock`でアクセスを受け付ける設定になっていますが、これに追加してTCPでもアクセスを受け付けるようにします。

まずはdockerの設定ファイルにtcpで受付ける設定を追加します。ファイルがなければ新規作成します。  
ref: [dockerd daemon][link3]

```bash
[pi@raspi4b01] ~
% cat /etc/docker/daemon.json
{
  "hosts": ["tcp://0.0.0.0:2376", "unix:///var/run/docker.sock"]
}
[pi@raspi4b01] ~
%
```

またdocker-ceで設定されたsystemdはデフォルトでサービス起動時に `-H`オプションを指定しているためそのままだとdocker.jsonのhostsの設定が反映されません。

```bash
[pi@raspi4b01] ~
% grep ExecStart /lib/systemd/system/docker.service
ExecStart=/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock
[pi@raspi4b01] ~
%
```

そのためsystemdの設定を追加します。

```bash
[pi@raspi4b01] ~
% cat /etc/systemd/system/docker.service.d/docker.conf
[Service]
ExecStart=
ExecStart=/usr/bin/dockerd
[pi@raspi4b01] ~
%
```

この状態でdocker再起動すると設定反映され、TCPでアクセスできる状態になります。

```bash
[pi@raspi4b01] ~
% sudo systemctl daemon-reload
[pi@raspi4b01] ~
% sudo systemctl restart docker.service
[pi@raspi4b01] ~
% ss state LISTENING | grep 2376
tcp    0        4096                                                  *:2376                                               *:*
[pi@raspi4b01] ~
%
```

## macbook側

macbook側ではcontextを追加してラズパイ上のdocker daemonへの接続情報を教えてあげます。

```bash
[koh@Kohs-MacBook-Pro-M1-387] ~
% docker context create raspi4b01 --description "raspi4b01" --docker "host=tcp://raspi4b01.local:2376"
[koh@Kohs-MacBook-Pro-M1-387] ~
% docker context use raspi4b01
[koh@Kohs-MacBook-Pro-M1-387] ~
% docker context show
raspi4b01
[koh@Kohs-MacBook-Pro-M1-387] ~
% docker container ls
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
[koh@Kohs-MacBook-Pro-M1-387] ~
%
```

# 動作確認

実際にコンテナを動かして動作確認します。  
といってもやることは普通の操作と変わらないです。

nginxのコンテナを起動してcurlでアクセスしてあげると普通に繋がります。

```bash
[koh@Kohs-MacBook-Pro-M1-387] ~
% docker run -p 8080:80 --name some-nginx -d nginx
612e1f262ce0f72ab51c8eac6fdb1863daa62051af5b9fc35ec82cf127b3e133
[koh@Kohs-MacBook-Pro-M1-387] ~
% curl http://raspi4b01.local:8080
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
[koh@Kohs-MacBook-Pro-M1-387] ~
%
```

ラズパイ側から確認してもコンテナ起動していることがわかります。

```bash
[pi@raspi4b01] ~
% docker container ls
CONTAINER ID   IMAGE     COMMAND                  CREATED              STATUS              PORTS                                   NAMES
612e1f262ce0   nginx     "/docker-entrypoint.…"   About a minute ago   Up About a minute   0.0.0.0:8080->80/tcp, :::8080->80/tcp   some-nginx
[pi@raspi4b01] ~
%
```

# まとめ

とりあえずできたので使い勝手を試していきたい。

[link1]: https://koh-sh.hatenablog.com/entry/2020/12/06/152137
[link2]: https://docs.docker.com/engine/install/debian/
[link3]: https://docs.docker.jp/engine/reference/commandline/dockerd.html
