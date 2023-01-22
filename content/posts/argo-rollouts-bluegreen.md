---
title: "Argo RolloutsでBlue/Greenデプロイを試す"
date: 2022-09-24T02:10:28+09:00
draft: false
tags: ["kubernetes", "Argo-Rollouts"]
---

最近今更ですがKubernetes周りを勉強し始めました。  
その中でArgo Rolloutsを試しに動かしたりBlue/Greenデプロイの流れを再現したりしたのでとりあえずブログに残しておきます。

# Argo Rolloutsとは

KubernetesでBlue/Greenデプロイやカナリアデプロイなどを簡単に実現できるOSSツールです。  

https://argoproj.github.io/argo-rollouts/

他にもArgo WorkflowsやArgo CDなどもあります。

https://argoproj.github.io

# Blue/Greenデプロイとは

アプリケーションをデプロイする際に、既存の環境の隣にデプロイしてからルーティングを切り替えることでリリースする手法です。
実際に切り替える前にテストができたり、新旧バージョンのトラフィックが混ざったりしないなどのメリットがあります。

https://argoproj.github.io/argo-rollouts/concepts/#blue-green

# インストール

Docker Desktop for MacでKubernetes有効にした環境で実施しています。  
ドキュメントに沿ってControllorとkubectlのプラグインをインストールします。

https://argoproj.github.io/argo-rollouts/installation/#controller-installation

```bash
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml
```

```bash
brew install argoproj/tap/kubectl-argo-rollouts
```

```bash
[koh@Kohs-MacBook-Pro-M1-222] ~
% kubectl get all -n argo-rollouts
NAME                                 READY   STATUS    RESTARTS   AGE
pod/argo-rollouts-85b47cbc5f-8lhxl   1/1     Running   0          3d

NAME                            TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
service/argo-rollouts-metrics   ClusterIP   10.105.204.36   <none>        8090/TCP   3d

NAME                            READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/argo-rollouts   1/1     1            1           3d

NAME                                       DESIRED   CURRENT   READY   AGE
replicaset.apps/argo-rollouts-85b47cbc5f   1         1         1       3d
[koh@Kohs-MacBook-Pro-M1-222] ~
%
```

# リソース作成

まずは公式のBlue/GreenのExampleの内容をコピーします。

https://argoproj.github.io/argo-rollouts/features/bluegreen/#example

```bash
[koh@Kohs-MacBook-Pro-M1-222] ~/work/argo
% cat bg-rollout.yml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: rollout-bluegreen
spec:
  replicas: 2
  revisionHistoryLimit: 2
  selector:
    matchLabels:
      app: rollout-bluegreen
  template:
    metadata:
      labels:
        app: rollout-bluegreen
    spec:
      containers:
      - name: rollouts-demo
        image: argoproj/rollouts-demo:blue
        imagePullPolicy: Always
        ports:
        - containerPort: 8080
  strategy:
    blueGreen:
      # activeService specifies the service to update with the new template hash at time of promotion.
      # This field is mandatory for the blueGreen update strategy.
      activeService: rollout-bluegreen-active
      # previewService specifies the service to update with the new template hash before promotion.
      # This allows the preview stack to be reachable without serving production traffic.
      # This field is optional.
      previewService: rollout-bluegreen-preview
      # autoPromotionEnabled disables automated promotion of the new stack by pausing the rollout
      # immediately before the promotion. If omitted, the default behavior is to promote the new
      # stack as soon as the ReplicaSet are completely ready/available.
      # Rollouts can be resumed using: `kubectl argo rollouts promote ROLLOUT`
      autoPromotionEnabled: false

[koh@Kohs-MacBook-Pro-M1-222] ~/work/argo
%
```

後はactive/previewそれぞれのServiceを作成します。

```bash
[koh@Kohs-MacBook-Pro-M1-222] ~/work/argo
% cat bg-service-active.yml
apiVersion: v1
kind: Service
metadata:
  name: rollout-bluegreen-active
spec:
  ports:
  - port: 80
    targetPort: http
    protocol: TCP
    name: http
  selector:
    app: rollout-bluegreen
[koh@Kohs-MacBook-Pro-M1-222] ~/work/argo
% cat bg-service-preview.yml
apiVersion: v1
kind: Service
metadata:
  name: rollout-bluegreen-preview
spec:
  ports:
  - port: 80
    targetPort: http
    protocol: TCP
    name: http
  selector:
    app: rollout-bluegreen
[koh@Kohs-MacBook-Pro-M1-222] ~/work/argo
%
```

そしてそれらをapplyします。

```bash
[koh@Kohs-MacBook-Pro-M1-222] ~/work/argo
% ls
bg-rollout.yml          bg-service-active.yml   bg-service-preview.yml
[koh@Kohs-MacBook-Pro-M1-222] ~/work/argo
% kubectl apply -f .
rollout.argoproj.io/rollout-bluegreen created
service/rollout-bluegreen-active created
service/rollout-bluegreen-preview created
[koh@Kohs-MacBook-Pro-M1-222] ~/work/argo
%
```

Argo Rolloutsにはダッシュボード機能があるのでそこからも確認してみます。

```bash
[koh@Kohs-MacBook-Pro-M1-222] ~/work/argo
% kubectl argo rollouts dashboard
INFO[0000] Argo Rollouts Dashboard is now available at http://localhost:3100/rollouts

```

`http://localhost:3100/rollouts`にアクセスするとrollout-bluegreenができています。

![ダッシュボード](/images/argo-rollouts-bluegreen/1.avif)

rollout-bluegreenをクリックすると詳細や右上に操作するボタンがあります。

![Rollout詳細](/images/argo-rollouts-bluegreen/2.avif)

CLIの場合は下記で表示できます。

```bash
[koh@Kohs-MacBook-Pro-M1-222] ~/work/argo
% kubectl argo rollouts get rollout rollout-bluegreen

Name:            rollout-bluegreen
Namespace:       argocd
Status:          ✔ Healthy
Strategy:        BlueGreen
Images:          argoproj/rollouts-demo:blue (stable, active)
Replicas:
  Desired:       2
  Current:       2
  Updated:       2
  Ready:         2
  Available:     2

NAME                                           KIND        STATUS     AGE  INFO
⟳ rollout-bluegreen                            Rollout     ✔ Healthy  10m
└──# revision:1
   └──⧉ rollout-bluegreen-5ffd47b8d4           ReplicaSet  ✔ Healthy  10m  stable,active
      ├──□ rollout-bluegreen-5ffd47b8d4-qm2fl  Pod         ✔ Running  10m  ready:1/1
      └──□ rollout-bluegreen-5ffd47b8d4-x7t4f  Pod         ✔ Running  10m  ready:1/1
```

また `--watch`をつけるとリアルタイムで更新してくれるのでオプションつけた上で作業するとわかりやすいです。

# Rollout実施

まず現在使用しているイメージを更新します。  
元のTagがblueだったところをYellowにします。

```bash
[koh@Kohs-MacBook-Pro-M1-222] ~/work/argo
% kubectl argo rollouts set image rollout-bluegreen rollouts-demo=argoproj/rollouts-demo:yellow

rollout "rollout-bluegreen" image updated
[koh@Kohs-MacBook-Pro-M1-222] ~/work/argo
%
```

```bash
% kubectl argo rollouts get rollout rollout-bluegreen
Name:            rollout-bluegreen
Namespace:       argocd
Status:          ॥ Paused
Message:         BlueGreenPause
Strategy:        BlueGreen
Images:          argoproj/rollouts-demo:blue (stable, active)
                 argoproj/rollouts-demo:yellow (preview)
Replicas:
  Desired:       2
  Current:       4
  Updated:       2
  Ready:         2
  Available:     2

NAME                                           KIND        STATUS     AGE  INFO
⟳ rollout-bluegreen                            Rollout     ॥ Paused   14m
├──# revision:2
│  └──⧉ rollout-bluegreen-674b45d9b4           ReplicaSet  ✔ Healthy  48s  preview
│     ├──□ rollout-bluegreen-674b45d9b4-8sdnz  Pod         ✔ Running  48s  ready:1/1
│     └──□ rollout-bluegreen-674b45d9b4-gm9gm  Pod         ✔ Running  48s  ready:1/1
└──# revision:1
   └──⧉ rollout-bluegreen-5ffd47b8d4           ReplicaSet  ✔ Healthy  14m  stable,active
      ├──□ rollout-bluegreen-5ffd47b8d4-qm2fl  Pod         ✔ Running  14m  ready:1/1
      └──□ rollout-bluegreen-5ffd47b8d4-x7t4f  Pod         ✔ Running  14m  ready:1/1
[koh@Kohs-MacBook-Pro-M1-222] ~/work/argo
%
```

するとrevision:2がpreviewとして立ち上がります。  
またその状態で止まるので実際にはこのタイミングでpreview側の動作確認などを実施するイメージです。

この後に切り替え実施(promote)します。

```bash
[koh@Kohs-MacBook-Pro-M1-222] ~/work/argo
% kubectl argo rollouts promote rollout-bluegreen

rollout 'rollout-bluegreen' promoted
[koh@Kohs-MacBook-Pro-M1-222] ~/work/argo
%
```

そうするとactiveとpreviewが入れ替わり、その後入れ替わったpreview(revision:1)の方が停止します。

```bash

[koh@Kohs-MacBook-Pro-M1-222] ~/work/argo
% kubectl argo rollouts get rollout rollout-bluegreen
Name:            rollout-bluegreen
Namespace:       argocd
Status:          ✔ Healthy
Strategy:        BlueGreen
Images:          argoproj/rollouts-demo:blue
                 argoproj/rollouts-demo:yellow (stable, active)
Replicas:
  Desired:       2
  Current:       4
  Updated:       2
  Ready:         2
  Available:     2

NAME                                           KIND        STATUS     AGE   INFO
⟳ rollout-bluegreen                            Rollout     ✔ Healthy  17m
├──# revision:2
│  └──⧉ rollout-bluegreen-674b45d9b4           ReplicaSet  ✔ Healthy  4m9s  stable,active
│     ├──□ rollout-bluegreen-674b45d9b4-8sdnz  Pod         ✔ Running  4m9s  ready:1/1
│     └──□ rollout-bluegreen-674b45d9b4-gm9gm  Pod         ✔ Running  4m9s  ready:1/1
└──# revision:1
   └──⧉ rollout-bluegreen-5ffd47b8d4           ReplicaSet  ✔ Healthy  17m   delay:14s
      ├──□ rollout-bluegreen-5ffd47b8d4-qm2fl  Pod         ✔ Running  17m   ready:1/1
      └──□ rollout-bluegreen-5ffd47b8d4-x7t4f  Pod         ✔ Running  17m   ready:1/1
[koh@Kohs-MacBook-Pro-M1-222] ~/work/argo
%

...

[koh@Kohs-MacBook-Pro-M1-222] ~/work/argo
% kubectl argo rollouts get rollout rollout-bluegreen
Name:            rollout-bluegreen
Namespace:       argocd
Status:          ✔ Healthy
Strategy:        BlueGreen
Images:          argoproj/rollouts-demo:yellow (stable, active)
Replicas:
  Desired:       2
  Current:       2
  Updated:       2
  Ready:         2
  Available:     2

NAME                                           KIND        STATUS        AGE    INFO
⟳ rollout-bluegreen                            Rollout     ✔ Healthy     21m
├──# revision:2
│  └──⧉ rollout-bluegreen-674b45d9b4           ReplicaSet  ✔ Healthy     7m40s  stable,active
│     ├──□ rollout-bluegreen-674b45d9b4-8sdnz  Pod         ✔ Running     7m40s  ready:1/1
│     └──□ rollout-bluegreen-674b45d9b4-gm9gm  Pod         ✔ Running     7m40s  ready:1/1
└──# revision:1
   └──⧉ rollout-bluegreen-5ffd47b8d4           ReplicaSet  • ScaledDown  20m
[koh@Kohs-MacBook-Pro-M1-222] ~/work/argo
%
```

またダッシュボードからみるとRivisionが2になっていてtagも変わってることが確認できます。

![切り替え後ダッシュボード](/images/argo-rollouts-bluegreen/3.avif)

# まとめ

このように簡単にBlue/Greenデプロイを実施できる + 簡単に中断や切り戻しもできたりオプションで細かい動作も制御できそうなのでとてもいい感じです。  
他にもArgo WorkflowsやArgoCDも試してみたいです。
