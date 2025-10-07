# リファクタリング実行手順

## Phase 1: ディレクトリ構造の準備

### 1.1 新しいディレクトリの作成
```bash
# 新しいディレクトリを作成
mkdir -p src/data
mkdir -p src/schemas
mkdir -p src/styles
mkdir -p src/types
mkdir -p src/components/ui
```

### 1.2 設定ファイルの追加
```bash
# components.jsonを追加（shadcn/ui設定）
# .nvmrcを追加（Node.jsバージョン管理）
```

## Phase 2: ファイルの移動とリネーム

### 2.1 スタイルファイルの移動
```bash
# globals.cssを移動
mv src/app/globals.css src/styles/globals.css
```

### 2.2 コンポーネントファイルのリネーム（PascalCase → kebab-case）

#### atoms/ ディレクトリ
```bash
mv src/components/atoms/Button.tsx src/components/atoms/button.tsx
mv src/components/atoms/Checkbox.tsx src/components/atoms/checkbox.tsx
mv src/components/atoms/Icon.tsx src/components/atoms/icon.tsx
mv src/components/atoms/Logo.tsx src/components/atoms/logo.tsx
mv src/components/atoms/Toast.tsx src/components/atoms/toast.tsx
```

#### molecules/ ディレクトリ
```bash
mv src/components/molecules/FloatingFooter.tsx src/components/molecules/floating-footer.tsx
mv src/components/molecules/MenuItem.tsx src/components/molecules/menu-item.tsx
mv src/components/molecules/SidebarHeader.tsx src/components/molecules/sidebar-header.tsx
mv src/components/molecules/ToastContainer.tsx src/components/molecules/toast-container.tsx
mv src/components/molecules/UserHeader.tsx src/components/molecules/user-header.tsx
```

#### organisms/ ディレクトリ
```bash
mv src/components/organisms/Sidebar.tsx src/components/organisms/sidebar.tsx
```

#### templates/ ディレクトリ
```bash
mv src/components/templates/DashboardLayout.tsx src/components/templates/dashboard-layout.tsx
```

### 2.3 その他のファイルのリネーム
```bash
# hooks/
mv src/hooks/useToast.ts src/hooks/use-toast.ts

# contexts/
mv src/contexts/AuthContext.tsx src/components/contexts/auth-context.tsx
```

### 2.4 ディレクトリの統合
```bash
# constants/をlib/に統合
mv src/constants/merchant.ts src/lib/constants/merchant.ts
```

## Phase 3: 設定ファイルの追加

### 3.1 components.jsonの作成
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/styles/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "src/components",
    "utils": "src/lib/utils"
  }
}
```

### 3.2 .nvmrcの作成
```
18.17.0
```

## Phase 4: インポートパスの修正

### 4.1 移動したファイルのインポートパス修正

#### globals.cssの参照を修正
```typescript
// src/app/layout.tsx
import '../styles/globals.css'
```

#### コンポーネントのインポートパス修正
```typescript
// 例: Button.tsx → button.tsx
import { Button } from '@/components/atoms/button'
```

#### contextsのインポートパス修正
```typescript
// AuthContext.tsx → auth-context.tsx
import { AuthProvider } from '@/components/contexts/auth-context'
```

#### constantsのインポートパス修正
```typescript
// merchant.tsの移動
import { MERCHANT_CONSTANTS } from '@/lib/constants/merchant'
```

### 4.2 型定義の整理

#### types/ディレクトリに型定義を移動
```typescript
// src/types/admin.ts
export interface Admin {
  id: string
  name: string
  email: string
  // ...
}

// src/types/merchant.ts
export interface Merchant {
  id: string
  name: string
  // ...
}
```

## Phase 5: shadcn/uiの導入

### 5.1 shadcn/uiの初期化
```bash
npx shadcn-ui@latest init
```

### 5.2 必要なUIコンポーネントの追加
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
```

## Phase 6: テストと検証

### 6.1 ビルドテスト
```bash
npm run build
```

### 6.2 型チェック
```bash
npm run type-check
```

### 6.3 リンター実行
```bash
npm run lint
```

## 注意事項

### 段階的実行
- 各Phaseは独立して実行可能
- 各Phase完了後にビルドテストを実行
- エラーが発生した場合は修正してから次に進む

### コミット戦略
- 各Phase完了後にコミット
- 機能別にコミットメッセージを分ける
- ロールバック可能な状態を維持

### バックアップ
- リファクタリング開始前にバックアップを作成
- 重要な変更前にはコミットを作成

## 予想される問題と対処法

### 1. インポートパスの問題
- **問題**: ファイル移動後のインポートエラー
- **対処**: 段階的にインポートパスを修正

### 2. 型定義の不整合
- **問題**: 型定義ファイルの移動による型エラー
- **対処**: types/ディレクトリに型定義を整理

### 3. スタイルの不整合
- **問題**: globals.cssの移動によるスタイル読み込みエラー
- **対処**: layout.tsxでのインポートパス修正

### 4. shadcn/uiの競合
- **問題**: 既存コンポーネントとshadcn/uiの競合
- **対処**: 既存コンポーネントを段階的に置き換え
