# Tamanomi Admin

たまのみ管理画面のNext.jsアプリケーションです。店舗管理、ユーザー管理、クーポン管理などの機能を提供します。

## 🚀 特徴

- **Next.js 14**: App Routerを使用したモダンなNext.jsアプリケーション
- **TypeScript**: 型安全性を確保
- **Tailwind CSS**: ユーティリティファーストのCSSフレームワーク
- **認証機能**: JWT認証によるセキュアなログイン
- **API統合**: `@tamanomi/schemas`パッケージを使用した型安全なAPI通信

## 📦 ローカルパッケージ化

このプロジェクトは`@tamanomi/schemas`パッケージを使用しており、ローカル開発環境では以下の手順でセットアップします。

### 前提条件

- Node.js 18以上
- pnpm
- `tamanomi-schemas`パッケージがビルド済み

### セットアップ手順

1. **ワークスペースルートで依存関係をインストール**

```bash
cd /path/to/tamanomi
pnpm install
```

2. **ローカルパッケージをインストール**

```bash
cd tamanomi-admin/frontend
pnpm add @tamanomi/schemas@file:../../tamanomi-schemas
```

3. **開発サーバーを起動**

```bash
pnpm dev
```

### 開発中の注意点

- `@tamanomi/schemas`パッケージを変更した場合は、`tamanomi-schemas`ディレクトリで`pnpm build`を実行してください
- 型定義の変更は自動的に反映されます

## 🛠️ 開発

### 利用可能なスクリプト

```bash
# 開発サーバー起動
pnpm dev

# キャッシュ無効化で開発サーバー起動
pnpm dev:no-cache

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

### 開発サーバー起動

```bash
cd frontend
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `frontend/src/app/page.tsx`. The page auto-updates as you edit the file.

## 📚 参考資料

Next.jsについて詳しく学ぶには、以下のリソースをご覧ください：

- [Next.js Documentation](https://nextjs.org/docs) - Next.jsの機能とAPIについて
- [Learn Next.js](https://nextjs.org/learn) - インタラクティブなNext.jsチュートリアル

[Next.js GitHub repository](https://github.com/vercel/next.js)もご確認ください。フィードバックや貢献を歓迎します！

## 🚀 デプロイ

Next.jsアプリケーションをデプロイする最も簡単な方法は、Next.jsの作成者による[Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)を使用することです。

詳細については、[Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying)をご確認ください。
