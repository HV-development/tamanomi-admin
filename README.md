# Tamanomi Admin

たまのみ管理画面 - Next.js 14 + TypeScript

> **統合管理**: セットアップとDocker管理は[tamanomi-root](https://github.com/HV-development/tamanomi-root)で行います。

## 🚀 特徴

- **Next.js 14**: App Routerを使用したモダンなNext.jsアプリケーション
- **TypeScript**: 型安全性を確保
- **Tailwind CSS**: ユーティリティファーストのCSSフレームワーク
- **JWT認証**: セキュアなログイン
- **API統合**: `@hv-development/schemas`パッケージを使用した型安全なAPI通信

## 🛠️ ローカル開発

### 単独での開発サーバー起動

```bash
cd tamanomi-admin/frontend

# 開発サーバー起動
pnpm dev
# → http://localhost:3000

# 本番ビルド
pnpm build

# 本番サーバー起動
pnpm start
```

### コード品質

```bash
# リント実行
pnpm lint

# 型チェック
pnpm type-check

# クリーンアップ
pnpm clean
```

## 📦 主な機能

### 店舗管理
- 店舗の登録・編集・削除
- 店舗情報の一覧表示
- 店舗ステータス管理

### ユーザー管理
- ユーザー一覧
- ユーザー詳細情報
- ユーザーステータス管理

### クーポン管理
- クーポンの発行
- クーポン利用履歴
- クーポン統計

### プラン管理
- サブスクリプションプラン設定
- プラン別機能制限

## 🚀 デプロイ (Vercel)

Vercelへのデプロイを推奨します。

### 環境変数

```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1
JWT_SECRET=your-jwt-secret  # API側と同じ値
```

詳細は [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) を参照。

## 📝 ライセンス

ISC License
