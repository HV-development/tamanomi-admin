# 現在のディレクトリ構造詳細

## tamanomi-admin/frontend/src の詳細構造

### app/ ディレクトリ
```
app/
├── admins/                 # 管理者管理
│   ├── [id]/
│   │   ├── confirm/
│   │   └── edit/
│   ├── confirm/
│   ├── new/
│   └── page.tsx
├── api/                    # API Routes
│   ├── auth/
│   │   ├── login/
│   │   ├── logout/
│   │   ├── refresh/
│   │   └── register/
│   ├── merchants/
│   │   ├── [id]/
│   │   └── route.ts
│   └── shops/
│       ├── [id]/
│       └── route.ts
├── coupon-history/         # クーポン履歴
├── coupons/                # クーポン管理
│   ├── [id]/
│   │   ├── confirm/
│   │   ├── edit/
│   │   └── history/
│   ├── confirm/
│   ├── new/
│   └── page.tsx
├── merchants/              # 加盟店管理
│   ├── [id]/
│   │   ├── confirm/
│   │   └── edit/
│   ├── confirm/
│   ├── new/
│   └── page.tsx
├── shops/                  # 店舗管理
│   ├── [id]/
│   │   ├── confirm/
│   │   ├── edit/
│   │   └── page.tsx
│   ├── new/
│   └── page.tsx
├── users/                  # ユーザー管理
│   ├── [id]/
│   │   ├── confirm/
│   │   ├── coupon-history/
│   │   ├── edit/
│   │   └── page.tsx
│   └── page.tsx
├── error.tsx
├── favicon.ico
├── globals.css
├── layout.tsx
├── login/
├── not-found.tsx
└── page.tsx
```

### components/ ディレクトリ
```
components/
├── atoms/                  # 基本コンポーネント (5ファイル)
│   ├── Button.tsx
│   ├── Checkbox.tsx
│   ├── Icon.tsx
│   ├── Logo.tsx
│   └── Toast.tsx
├── molecules/              # 複合コンポーネント (5ファイル)
│   ├── FloatingFooter.tsx
│   ├── MenuItem.tsx
│   ├── SidebarHeader.tsx
│   ├── ToastContainer.tsx
│   └── UserHeader.tsx
├── organisms/              # 複雑なコンポーネント (1ファイル)
│   └── Sidebar.tsx
├── pages/                  # ページコンポーネント (33ファイル)
│   ├── AdminEdit.tsx
│   ├── AdminEditConfirmation.tsx
│   ├── AdminManagement.tsx
│   ├── AdminRegistration.tsx
│   ├── AdminRegistrationConfirmation.tsx
│   ├── CouponDetail.tsx
│   ├── CouponEdit.tsx
│   ├── CouponEditConfirmation.tsx
│   ├── CouponHistory.tsx
│   ├── CouponManagement.tsx
│   ├── CouponRegistration.tsx
│   ├── CouponRegistrationConfirmation.tsx
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── MerchantConfirmation.tsx
│   ├── MerchantEdit.tsx
│   ├── MerchantEditConfirmation.tsx
│   ├── MerchantManagement.tsx
│   ├── MerchantRegistration.tsx
│   ├── ShopConfirm.tsx
│   ├── ShopDetail.tsx
│   ├── ShopForm.tsx
│   ├── ShopManagement.tsx
│   ├── StoreConfirmation.tsx
│   ├── StoreEdit.tsx
│   ├── StoreEditConfirmation.tsx
│   ├── StoreManagement.tsx
│   ├── StoreRegistration.tsx
│   ├── UserDetail.tsx
│   ├── UserEdit.tsx
│   ├── UserEditConfirmation.tsx
│   └── UserManagement.tsx
└── templates/              # レイアウトテンプレート (1ファイル)
    └── DashboardLayout.tsx
```

### その他のディレクトリ
```
constants/                  # 定数 (1ファイル)
└── merchant.ts

contexts/                   # React Context (1ファイル)
└── AuthContext.tsx

hooks/                      # カスタムフック (1ファイル)
└── useToast.ts

lib/                        # ライブラリ・ユーティリティ (2ファイル)
├── api.ts
└── hooks/
    └── useZipcodeSearch.ts

utils/                      # ユーティリティ関数 (1ファイル)
└── validation.ts
```

## ファイル命名規則

### 現在の命名規則
- **PascalCase**: `Button.tsx`, `Checkbox.tsx`, `Icon.tsx`
- **camelCase**: `useToast.ts`, `AuthContext.tsx`

### 問題点
1. コンポーネントファイルがPascalCaseとkebab-caseが混在
2. tamanomi-webではkebab-caseが統一されている
3. 一貫性がない

## 設定ファイル

### 現在の設定ファイル
- `package.json` - 依存関係とスクリプト
- `tsconfig.json` - TypeScript設定
- `next.config.mjs` - Next.js設定
- `tailwind.config.ts` - Tailwind CSS設定
- `postcss.config.mjs` - PostCSS設定
- `eslint.config.mjs` - ESLint設定
- `pnpm-workspace.yaml` - pnpmワークスペース設定

### 不足している設定ファイル
- `components.json` - shadcn/ui設定
- `.nvmrc` - Node.jsバージョン管理
