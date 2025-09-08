# ECS環境変数

## 環境共通の環境変数

開発、テスト、本番環境で共通の環境変数は以下のjsonファイルに記載してください。
ここで指定する環境変数は機密情報を含まないものだけを指定してください。

aws/environment.json

```json
[
  {
    "name": "SAMPLE",
    "value": "sample_value"
  }
]
```

## 環境別の環境変数

開発、テスト、本番環境で異なる環境雨変数は以下のjsonファイルに記載してください。
ここで指定する環境変数はパラメータストアで管理しているものだけを指定してください。

aws/secrets.json

```json
[
  {
    "name": "SAMPLE_PARAM",
    "valueFrom": "/ecs/sample_param_value"
  }
]
```

## NEXT_PUBLICから始まる環境変数

ビルド時に指定が必要なのでインフラ側で対応。
