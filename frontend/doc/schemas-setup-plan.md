# tamanomi-schemas設定計画

## 概要
tamanomi-adminのfrontendでtamanomi-schemasパッケージを適切に設定し、型定義を活用できるようにする。

## 現在の状況

### tamanomi-schemasパッケージ
- **パッケージ名**: `@hv-development/schemas`
- **バージョン**: 1.4.0
- **説明**: tamayoiアプリケーション用のZodスキーマ定義を集約管理
- **公開先**: GitHub Packages (`https://npm.pkg.github.com`)

### 現在のtamanomi-admin/frontendでの使用状況
- `@hv-development/schemas`のインポートがコメントアウトされている
- 一時的な型定義を各ファイルで直接定義している
- 型安全性が確保されていない状態

## 目標

### ローカル開発環境
- tamanomi-schemasを直接インポートして開発作業を行う
- 型定義の一元管理
- リアルタイムでのスキーマ変更の反映

### 本番環境
- GitHub Packagesからパッケージをインストール
- 安定したバージョンのスキーマを使用

## 設定手順

### Phase 1: ローカル環境の設定

#### 1.1 pnpm workspaceの設定
```json
// pnpm-workspace.yaml
packages:
  - '.'
  - '../../tamanomi-schemas'
```

#### 1.2 package.jsonの依存関係設定
```json
{
  "dependencies": {
    "@hv-development/schemas": "workspace:*"
  }
}
```

#### 1.3 TypeScript設定の調整
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@hv-development/schemas": ["../../tamanomi-schemas/src"],
      "@hv-development/schemas/*": ["../../tamanomi-schemas/src/*"]
    }
  }
}
```

### Phase 2: スキーマの活用

#### 2.1 利用可能なスキーマ
- **auth**: 認証関連（admin-schemas, signup-schemas）
- **address**: 住所関連
- **coupon**: クーポン関連
- **merchant**: 加盟店関連
- **shop**: 店舗関連
- **payment**: 決済関連
- **plan**: プラン関連
- **user**: ユーザー関連
- **validation**: 共通バリデーション

#### 2.2 インポート例
```typescript
// 認証関連
import { AdminLoginInput, RegisterInput, AuthResponse } from '@hv-development/schemas';

// 加盟店関連
import { validateMerchantField, validateMerchantForm, type MerchantFormData } from '@hv-development/schemas';

// 店舗関連
import { StoreDetailResponse, StoreListResponse, StoreCreateRequest, StoreUpdateRequest } from '@hv-development/schemas';
```

### Phase 3: 既存コードの移行

#### 3.1 移行対象ファイル
1. `src/components/contexts/auth-context.tsx`
2. `src/lib/api.ts`
3. `src/components/pages/Login.tsx`
4. `src/components/pages/MerchantRegistration.tsx`
5. `src/components/pages/MerchantEdit.tsx`
6. `src/components/pages/ShopManagement.tsx`
7. `src/components/pages/ShopDetail.tsx`
8. `src/components/pages/ShopConfirm.tsx`
9. `src/components/pages/ShopForm.tsx`

#### 3.2 移行手順
1. 一時的な型定義を削除
2. tamanomi-schemasからのインポートを有効化
3. 型の整合性を確認
4. ビルドテストを実行

### Phase 4: 開発ワークフロー

#### 4.1 スキーマ変更時の手順
1. tamanomi-schemasでスキーマを変更
2. `pnpm build`でスキーマをビルド
3. tamanomi-adminで自動的に変更が反映される

#### 4.2 便利なスクリプト
```json
{
  "scripts": {
    "schema:build": "cd ../../tamanomi-schemas && pnpm build",
    "schema:watch": "cd ../../tamanomi-schemas && pnpm dev",
    "schema:update": "pnpm schema:build && pnpm dev"
  }
}
```

## 注意事項

### 開発環境での注意点
- tamanomi-schemasの変更は即座に反映される
- スキーマの破壊的変更時は注意が必要
- 型エラーが発生した場合はスキーマの変更を確認

### 本番環境での注意点
- GitHub Packagesからのインストール
- バージョン管理の徹底
- スキーマの互換性確認

## 期待される効果

1. **型安全性の向上**: コンパイル時エラーの検出
2. **開発効率の向上**: 型定義の一元管理
3. **保守性の向上**: スキーマ変更の一元管理
4. **一貫性の確保**: APIとフロントエンドでの型定義の統一
