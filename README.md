# Tamanomi Admin

たまのみ管理画面のNext.jsアプリケーションです。店舗管理、ユーザー管理、クーポン管理などの機能を提供します。

## 🚀 特徴

- **Next.js 14**: App Routerを使用したモダンなNext.jsアプリケーション
- **TypeScript**: 型安全性を確保
- **Tailwind CSS**: ユーティリティファーストのCSSフレームワーク
- **認証機能**: JWT認証によるセキュアなログイン
- **API統合**: `@hv-development/schemas`パッケージを使用した型安全なAPI通信

## 📦 パッケージ管理

このプロジェクトは`@hv-development/schemas`パッケージをGitHub Package Registryから取得します。

### 前提条件

- Node.js 22以上
- pnpm
- Docker（Docker Compose使用時）
- GitHub Package Registryへのアクセス権限

### 🚀 クイックスタート（推奨）

環境セットアップスクリプトを使用して、簡単に環境を構築できます：

```bash
cd tamanomi-admin/frontend
pnpm setup:env
```

このスクリプトは以下を自動で実行します：
1. `.env.example`から`.env`ファイルを作成
2. JWT_SECRETを自動生成して設定
3. GITHUB_TOKENの設定（環境変数から取得または入力を促す）
4. 依存関係のインストール（pnpm install）

### 手動セットアップ手順

スクリプトを使わずに手動でセットアップする場合：

1. **環境ファイルの作成**

```bash
cd tamanomi-admin/frontend
cp .env.example .env
```

2. **JWT_SECRETの生成**

```bash
pnpm secret:generate
# 生成されたキーを.envファイルのJWT_SECRETに設定
```

3. **GitHubパーソナルアクセストークンの設定**

GitHub Package Registryからパッケージを取得するため、`.env`ファイルに設定：

```bash
GITHUB_TOKEN=ghp_your_github_personal_access_token_here
```

トークンの作成手順：
- https://github.com/settings/tokens にアクセス
- 'Generate new token (classic)' をクリック
- Scopes: `read:packages` にチェック
- トークンをコピーして`.env`に設定

4. **依存関係のインストール**

```bash
pnpm install
```

5. **開発サーバーを起動**

```bash
pnpm dev
```

### パッケージの更新

- `@hv-development/schemas`パッケージの新しいバージョンがリリースされた場合：

```bash
cd tamanomi-admin/frontend
pnpm update @hv-development/schemas
```

## 🛠️ 開発

### 利用可能なスクリプト

```bash
# 環境セットアップ
pnpm setup:env

# JWT_SECRET生成
pnpm secret:generate

# 開発サーバー起動
pnpm dev

# 本番ビルド
pnpm build

# 本番サーバー起動
pnpm start

# リント実行
pnpm lint

# 型チェック
pnpm type-check

# クリーンアップ
pnpm clean
```

### ローカル開発

```bash
cd frontend
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `frontend/src/app/page.tsx`. The page auto-updates as you edit the file.

### Docker開発環境

このプロジェクトはDocker環境での開発を推奨しています。

```bash
cd infrastructure/docker

# .envファイルから環境変数を読み込んでビルド・起動
set -a && source ../../frontend/.env && set +a && docker-compose up --build -d

# ログを確認
docker-compose logs -f

# 停止
docker-compose down
```

**または、手動で環境変数を設定する場合:**

```bash
cd infrastructure/docker

# GITHUB_TOKENを環境変数としてexport
export GITHUB_TOKEN=$(grep GITHUB_TOKEN ../../frontend/.env | cut -d '=' -f2)

# 初回起動時（ビルドが必要）
docker-compose build
docker-compose up -d

# ログを確認
docker-compose logs -f
```

**注意**: 
- `GITHUB_TOKEN`が設定されていない場合、ビルドに失敗します
- `set -a`を使うと、`.env`ファイルの内容を環境変数として自動的にexportします
- ビルド時に`GITHUB_TOKEN`が必要なため、コンテナ起動前に環境変数を設定する必要があります

### ポート番号
- **開発環境（ローカル）**: http://localhost:3000
- **開発環境（Docker）**: http://localhost:3001

## 📚 参考資料

Next.jsについて詳しく学ぶには、以下のリソースをご覧ください：

- [Next.js Documentation](https://nextjs.org/docs) - Next.jsの機能とAPIについて
- [Learn Next.js](https://nextjs.org/learn) - インタラクティブなNext.jsチュートリアル

[Next.js GitHub repository](https://github.com/vercel/next.js)もご確認ください。フィードバックや貢献を歓迎します！

## 🚀 デプロイ

Next.jsアプリケーションをデプロイする最も簡単な方法は、Next.jsの作成者による[Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)を使用することです。

詳細については、[Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying)をご確認ください。
