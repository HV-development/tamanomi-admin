# tamanomi-schemas ローカル開発環境設定

## 現在の問題

### 1. tamanomi-apiでスキーマパッケージが見つからない
```
Error: Cannot find module '/app/node_modules/@hv-development/schemas/dist/index.js'
```

### 2. Docker環境での接続エラー
```
Error: connect ECONNREFUSED 172.18.0.5:3002
```

### 3. パッケージのインストール方法

#### ❌ 間違った方法
```json
{
  "dependencies": {
    "tamanomi-schemas": "file:../../tamanomi-schemas"
  }
}
```
→ パッケージ名を変更してはいけない

#### ✅ 正しい方法
```json
{
  "dependencies": {
    "@hv-development/schemas": "file:../../tamanomi-schemas"
  }
}
```
→ パッケージ名は`@hv-development/schemas`のまま維持
→ インストール元をfileリンクに変更

## 設定手順

### Phase 1: ローカル環境でのfileリンク設定

#### 1.1 tamanomi-api/package.json
```json
{
  "dependencies": {
    "@hv-development/schemas": "file:../tamanomi-schemas"
  }
}
```

#### 1.2 tamanomi-admin/frontend/package.json
```json
{
  "dependencies": {
    "@hv-development/schemas": "file:../../tamanomi-schemas"
  }
}
```

#### 1.3 tamanomi-web/frontend/package.json
```json
{
  "dependencies": {
    "@hv-development/schemas": "file:../../tamanomi-schemas"
  }
}
```

### Phase 2: スキーマのビルド

#### 2.1 tamanomi-schemasをビルド
```bash
cd /Users/yuta/develop/tamanomi/tamanomi-schemas
pnpm install
pnpm build
```

#### 2.2 各プロジェクトで依存関係を再インストール
```bash
# tamanomi-api
cd /Users/yuta/develop/tamanomi/tamanomi-api
pnpm install

# tamanomi-admin/frontend
cd /Users/yuta/develop/tamanomi/tamanomi-admin/frontend
pnpm install

# tamanomi-web/frontend
cd /Users/yuta/develop/tamanomi/tamanomi-web/frontend
pnpm install
```

### Phase 3: Docker環境での設定

#### 3.1 Dockerfile.localの確認
- tamanomi-schemasディレクトリがコピーされているか確認
- ビルドステップが適切か確認

#### 3.2 docker-compose.ymlの確認
- ボリュームマウントの設定を確認
- tamanomi-schemasへのアクセスが可能か確認

## ファイルリンクのメリット

1. **リアルタイム更新**: スキーマの変更が即座に反映される
2. **開発効率**: GitHub Packagesへの公開不要
3. **デバッグが容易**: ローカルでスキーマを確認・修正できる

## 注意事項

### ローカル開発環境
- パッケージ名は`@hv-development/schemas`のまま維持
- `file:`プロトコルを使用してローカルパスを指定
- 相対パスは各プロジェクトからの相対パス

### 本番環境
- GitHub Packagesからインストール
- バージョン番号を指定（例: `^1.4.0`）

### Docker環境
- Dockerfileでtamanomi-schemasをコピー
- ビルドステップでスキーマをビルド
- 適切なパスでfileリンクを設定

## トラブルシューティング

### スキーマが見つからない場合
1. tamanomi-schemasがビルドされているか確認
2. package.jsonのパスが正しいか確認
3. pnpm installを再実行

### Docker環境で問題がある場合
1. Dockerfileでtamanomi-schemasがコピーされているか確認
2. ビルドログを確認
3. コンテナ内でパスを確認
