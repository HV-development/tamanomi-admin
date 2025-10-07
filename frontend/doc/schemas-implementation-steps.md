# tamanomi-schemas実装手順

## Phase 1: ローカル環境の設定

### 1.1 pnpm workspaceの設定
```bash
# pnpm-workspace.yamlを更新
```

**現在の設定:**
```yaml
packages:
  - '.'
```

**更新後の設定:**
```yaml
packages:
  - '.'
  - '../../tamanomi-schemas'
```

### 1.2 package.jsonの依存関係設定
```bash
# package.jsonに依存関係を追加
```

**追加する依存関係:**
```json
{
  "dependencies": {
    "@hv-development/schemas": "workspace:*"
  }
}
```

### 1.3 TypeScript設定の調整
```bash
# tsconfig.jsonのpaths設定を更新
```

**追加する設定:**
```json
{
  "compilerOptions": {
    "paths": {
      "@hv-development/schemas": ["../../tamanomi-schemas/src"],
      "@hv-development/schemas/*": ["../../tamanomi-schemas/src/*"]
    }
  }
}
```

## Phase 2: スキーマのビルドとインストール

### 2.1 tamanomi-schemasのビルド
```bash
cd ../../tamanomi-schemas
pnpm build
```

### 2.2 依存関係のインストール
```bash
cd /Users/yuta/develop/tamanomi/tamanomi-admin/frontend
pnpm install
```

## Phase 3: 既存コードの移行

### 3.1 移行対象ファイルのリスト
1. `src/components/contexts/auth-context.tsx`
2. `src/lib/api.ts`
3. `src/components/pages/Login.tsx`
4. `src/components/pages/MerchantRegistration.tsx`
5. `src/components/pages/MerchantEdit.tsx`
6. `src/components/pages/ShopManagement.tsx`
7. `src/components/pages/ShopDetail.tsx`
8. `src/components/pages/ShopConfirm.tsx`
9. `src/components/pages/ShopForm.tsx`

### 3.2 各ファイルの移行手順

#### auth-context.tsx
**現在:**
```typescript
// import { AdminLoginInput, RegisterInput, AuthResponse } from '@hv-development/schemas';

// 一時的な型定義
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

**更新後:**
```typescript
import { AdminLoginInput, RegisterInput, AuthResponse } from '@hv-development/schemas';

// 一時的な型定義を削除
```

#### api.ts
**現在:**
```typescript
// import { AdminLoginInput, RegisterInput, RefreshTokenInput, AuthResponse, RefreshResponse } from '@hv-development/schemas';
```

**更新後:**
```typescript
import { AdminLoginInput, RegisterInput, RefreshTokenInput, AuthResponse, RefreshResponse } from '@hv-development/schemas';
```

#### 各ページコンポーネント
**現在:**
```typescript
// import { validateMerchantField, validateMerchantForm, type MerchantFormData } from '@hv-development/schemas';
```

**更新後:**
```typescript
import { validateMerchantField, validateMerchantForm, type MerchantFormData } from '@hv-development/schemas';
```

## Phase 4: 開発スクリプトの追加

### 4.1 package.jsonにスクリプトを追加
```json
{
  "scripts": {
    "schema:build": "cd ../../tamanomi-schemas && pnpm build",
    "schema:watch": "cd ../../tamanomi-schemas && pnpm dev",
    "schema:update": "pnpm schema:build && pnpm dev",
    "schema:link": "cd ../../tamanomi-schemas && pnpm dev:link",
    "schema:unlink": "cd ../../tamanomi-schemas && pnpm dev:unlink"
  }
}
```

## Phase 5: テストと検証

### 5.1 ビルドテスト
```bash
pnpm run build
```

### 5.2 型チェック
```bash
pnpm run type-check
```

### 5.3 開発サーバーの起動
```bash
pnpm run dev
```

## Phase 6: 開発ワークフローの確立

### 6.1 スキーマ変更時の手順
1. tamanomi-schemasでスキーマを変更
2. `pnpm schema:build`でスキーマをビルド
3. tamanomi-adminで自動的に変更が反映される

### 6.2 スキーマ監視モード
```bash
# ターミナル1: スキーマ監視
pnpm run schema:watch

# ターミナル2: 開発サーバー
pnpm run dev
```

## 注意事項

### 開発環境での注意点
- tamanomi-schemasの変更は即座に反映される
- スキーマの破壊的変更時は注意が必要
- 型エラーが発生した場合はスキーマの変更を確認

### トラブルシューティング
1. **型エラーが発生する場合**
   - tamanomi-schemasが正しくビルドされているか確認
   - インポートパスが正しいか確認
   - スキーマのバージョンが一致しているか確認

2. **ビルドが失敗する場合**
   - 依存関係が正しくインストールされているか確認
   - TypeScript設定が正しいか確認
   - スキーマの型定義が正しいか確認

3. **開発サーバーが起動しない場合**
   - ポートが競合していないか確認
   - 依存関係が正しくインストールされているか確認
   - スキーマのビルドが完了しているか確認

## 期待される効果

1. **型安全性の向上**: コンパイル時エラーの検出
2. **開発効率の向上**: 型定義の一元管理
3. **保守性の向上**: スキーマ変更の一元管理
4. **一貫性の確保**: APIとフロントエンドでの型定義の統一
5. **リアルタイム開発**: スキーマ変更の即座反映
