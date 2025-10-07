# tamanomi-schemas詳細分析

## パッケージ構成

### 基本情報
- **パッケージ名**: `@hv-development/schemas`
- **バージョン**: 1.4.0
- **メインファイル**: `dist/index.js`
- **型定義ファイル**: `dist/index.d.ts`
- **依存関係**: `zod: ^3.25.76`

### エクスポート設定
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "require": "./dist/index.js",
      "import": "./dist/index.js"
    },
    "./merchant/schema": {
      "types": "./dist/merchant/schema.d.ts",
      "require": "./dist/merchant/schema.js",
      "import": "./dist/merchant/schema.js"
    },
    "./user/schema": {
      "types": "./dist/user/schema.d.ts",
      "require": "./dist/user/schema.js",
      "import": "./dist/user/schema.js"
    }
  }
}
```

## スキーマ構成

### ディレクトリ構造
```
src/
├── address/
│   └── address-schemas.ts
├── auth/
│   ├── admin-schemas.ts
│   └── signup-schemas.ts
├── coupon/
│   └── schema.ts
├── index.ts
├── merchant/
│   ├── schema.ts
│   └── validation.ts
├── payment/
│   └── schema.ts
├── plan/
│   ├── schema.ts
│   └── validation.ts
├── shop/
│   ├── schema.ts
│   └── validation.ts
├── user/
│   └── schema.ts
└── validation/
    └── common.ts
```

### エクスポート内容
```typescript
// src/index.ts
export * from './auth/signup-schemas';
export * from './auth/admin-schemas';
export * from './address/address-schemas';
export * from './coupon/schema';
export * from './merchant/schema';
export * from './merchant/validation';
export * from './shop/schema';
export * from './shop/validation';
export * from './payment/schema';
export * from './plan/schema';
export * from './plan/validation';
export * from './user/schema';
export * from './validation/common';
```

## 現在のtamanomi-admin/frontendでの使用状況

### コメントアウトされているインポート
1. **認証関連**
   - `AdminLoginInput`
   - `RegisterInput`
   - `AuthResponse`

2. **加盟店関連**
   - `validateMerchantField`
   - `validateMerchantForm`
   - `MerchantFormData`
   - `MerchantStatus`

3. **店舗関連**
   - `StoreDetailResponse`
   - `StoreListResponse`
   - `StoreCreateRequest`
   - `StoreUpdateRequest`

### 一時的な型定義
現在、各ファイルで一時的な型定義が直接記述されている：

```typescript
// 例: auth-context.tsx
type AdminLoginInput = {
  email: string;
  password: string;
};

type RegisterInput = {
  email: string;
  password: string;
  name: string;
};

type AuthResponse = {
  user: User;
  token: string;
  accessToken: string;
  refreshToken: string;
  account: {
    id: string;
    email: string;
    name: string;
    role: string;
    displayName: string;
  };
};
```

## 利用可能なスキーマ詳細

### 認証関連 (auth/)
- **admin-schemas.ts**: 管理者認証用スキーマ
- **signup-schemas.ts**: サインアップ用スキーマ

### 住所関連 (address/)
- **address-schemas.ts**: 住所関連のスキーマ

### クーポン関連 (coupon/)
- **schema.ts**: クーポン関連のスキーマ

### 加盟店関連 (merchant/)
- **schema.ts**: 加盟店の基本スキーマ
- **validation.ts**: 加盟店のバリデーション関数

### 決済関連 (payment/)
- **schema.ts**: 決済関連のスキーマ

### プラン関連 (plan/)
- **schema.ts**: プランの基本スキーマ
- **validation.ts**: プランのバリデーション関数

### 店舗関連 (shop/)
- **schema.ts**: 店舗の基本スキーマ
- **validation.ts**: 店舗のバリデーション関数

### ユーザー関連 (user/)
- **schema.ts**: ユーザーの基本スキーマ

### 共通バリデーション (validation/)
- **common.ts**: 共通で使用されるバリデーション関数

## 開発ワークフロー

### ローカル開発環境
1. tamanomi-schemasを直接インポート
2. スキーマ変更が即座に反映される
3. 型安全性が確保される

### 本番環境
1. GitHub Packagesからパッケージをインストール
2. 安定したバージョンのスキーマを使用
3. バージョン管理による互換性確保

## 設定に必要な作業

### 1. pnpm workspace設定
- pnpm-workspace.yamlの更新
- 依存関係の設定

### 2. TypeScript設定
- tsconfig.jsonのpaths設定
- 型解決の設定

### 3. 既存コードの移行
- 一時的な型定義の削除
- スキーマからのインポートに変更
- 型の整合性確認

### 4. 開発スクリプトの追加
- スキーマビルドスクリプト
- スキーマ監視スクリプト
- 更新スクリプト
