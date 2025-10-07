# 目標ディレクトリ構造

## tamanomi-web/frontend/src の構造（目標）

### app/ ディレクトリ
```
app/
├── api/                    # API Routes
│   ├── address/
│   │   └── search/
│   └── auth/
│       ├── register/
│       └── verify/
├── drink-demo/             # デモページ
├── email-registration/     # メール登録
├── globals.css
├── layout.tsx
├── page.tsx
├── plan-registration/      # プラン登録
├── register/               # 登録
├── register-complete/      # 登録完了
├── register-confirmation/  # 登録確認
├── signup/                 # サインアップ
└── usage-guide/            # 利用ガイド
```

### components/ ディレクトリ
```
components/
├── atoms/                  # 基本コンポーネント (22ファイル)
│   ├── area-button.tsx
│   ├── button.tsx
│   ├── coupon-card.tsx
│   ├── date-input.tsx
│   ├── favorite-button.tsx
│   ├── genre-button.tsx
│   ├── hamburger-icon.tsx
│   ├── header-logo.tsx
│   ├── input.tsx
│   ├── logo.tsx
│   ├── menu-button.tsx
│   ├── notification-icon.tsx
│   ├── notification-item.tsx
│   ├── plan-card.tsx
│   ├── popup-button.tsx
│   ├── radio-button.tsx
│   ├── rank-badge.tsx
│   ├── select.tsx
│   ├── status-badge.tsx
│   ├── store-card.tsx
│   └── usage-history-card.tsx
├── molecules/              # 複合コンポーネント (47ファイル)
│   ├── advanced-drink-animation.tsx
│   ├── area-popup.tsx
│   ├── banner-carousel.tsx
│   ├── basic-test.tsx
│   ├── confirmation-display.tsx
│   ├── coupon-confirmation-page.tsx
│   ├── coupon-confirmation-popup.tsx
│   ├── coupon-list-popup.tsx
│   ├── coupon-used-success-modal.tsx
│   ├── drink-animation.tsx
│   ├── email-change-complete.tsx
│   ├── email-change-form.tsx
│   ├── email-confirmation-complete.tsx
│   ├── email-registration-complete.tsx
│   ├── email-registration-form.tsx
│   ├── filter-controls.tsx
│   ├── footer-navigation.tsx
│   ├── genre-popup.tsx
│   ├── hamburger-menu.tsx
│   ├── header-menu.tsx
│   ├── history-popup.tsx
│   ├── login-form.tsx
│   ├── login-required-modal.tsx
│   ├── menu-dropdown.tsx
│   ├── navigation-bar.tsx
│   ├── notification-panel.tsx
│   ├── otp-input-form.tsx
│   ├── password-change-complete.tsx
│   ├── password-change-form.tsx
│   ├── password-reset-complete.tsx
│   ├── password-reset-form.tsx
│   ├── payment-history-list.tsx
│   ├── plan-change-form.tsx
│   ├── plan-change-success-modal.tsx
│   ├── plan-management.tsx
│   ├── plan-registration-form.tsx
│   ├── plan-section.tsx
│   ├── profile-edit-form.tsx
│   ├── profile-section.tsx
│   ├── profile-update-success-modal.tsx
│   ├── register-confirmation-display.tsx
│   ├── register-form.tsx
│   ├── signup-form.tsx
│   ├── simple-drink-test.tsx
│   ├── simple-drink-test2.tsx
│   ├── store-detail-popup.tsx
│   ├── store-list.tsx
│   ├── subscription-plans.tsx
│   ├── usage-guide-modal.tsx
│   ├── usage-guide-page.tsx
│   ├── usage-history-list.tsx
│   ├── withdrawal-complete.tsx
│   ├── withdrawal-confirmation.tsx
│   └── withdrawal-form.tsx
├── organisms/              # 複雑なコンポーネント (18ファイル)
│   ├── confirmation-container.tsx
│   ├── email-change-container.tsx
│   ├── email-confirmation-container.tsx
│   ├── email-registration-container.tsx
│   ├── home-container.tsx
│   ├── login-container.tsx
│   ├── mypage-container.tsx
│   ├── password-change-container.tsx
│   ├── password-reset-container.tsx
│   ├── plan-change-container.tsx
│   ├── plan-management-container.tsx
│   ├── plan-registration-container.tsx
│   ├── profile-edit-container.tsx
│   ├── register-confirmation-container.tsx
│   ├── register-container.tsx
│   ├── signup-container.tsx
│   ├── subscription-container.tsx
│   └── withdrawal-container.tsx
├── templates/              # レイアウトテンプレート (18ファイル)
│   ├── confirmation-layout.tsx
│   ├── email-change-layout.tsx
│   ├── email-confirmation-layout.tsx
│   ├── email-registration-layout.tsx
│   ├── home-layout.tsx
│   ├── login-layout.tsx
│   ├── mypage-layout.tsx
│   ├── password-change-layout.tsx
│   ├── password-reset-layout.tsx
│   ├── plan-change-layout.tsx
│   ├── plan-management-layout.tsx
│   ├── plan-registration-layout.tsx
│   ├── profile-edit-layout.tsx
│   ├── register-confirmation-layout.tsx
│   ├── register-layout.tsx
│   ├── signup-layout.tsx
│   ├── subscription-layout.tsx
│   └── withdrawal-layout.tsx
├── theme-provider.tsx      # テーマプロバイダー
└── ui/                     # UIコンポーネント（shadcn/ui）(50ファイル)
    ├── accordion.tsx
    ├── alert.tsx
    ├── alert-dialog.tsx
    ├── avatar.tsx
    ├── badge.tsx
    ├── button.tsx
    ├── calendar.tsx
    ├── card.tsx
    ├── carousel.tsx
    ├── checkbox.tsx
    ├── collapsible.tsx
    ├── command.tsx
    ├── context-menu.tsx
    ├── dialog.tsx
    ├── drawer.tsx
    ├── dropdown-menu.tsx
    ├── form.tsx
    ├── hover-card.tsx
    ├── input.tsx
    ├── label.tsx
    ├── menubar.tsx
    ├── navigation-menu.tsx
    ├── pagination.tsx
    ├── popover.tsx
    ├── progress.tsx
    ├── radio-group.tsx
    ├── resizable.tsx
    ├── scroll-area.tsx
    ├── select.tsx
    ├── separator.tsx
    ├── sheet.tsx
    ├── skeleton.tsx
    ├── slider.tsx
    ├── sonner.tsx
    ├── switch.tsx
    ├── table.tsx
    ├── tabs.tsx
    ├── textarea.tsx
    ├── toast.tsx
    ├── toggle.tsx
    ├── toggle-group.tsx
    ├── tooltip.tsx
    └── use-toast.ts
```

### その他のディレクトリ
```
data/                       # モックデータ・CSVファイル (5ファイル)
├── KEN_ALL.CSV
├── mock-coupons.ts
├── mock-notifications.ts
├── mock-stores.ts
└── mock-user.ts

hooks/                      # カスタムフック (3ファイル)
├── use-audio.ts
├── use-mobile.tsx
└── use-toast.ts

lib/                        # ライブラリ・ユーティリティ (1ファイル)
└── utils.ts

schemas/                    # バリデーションスキーマ (1ファイル)
└── auth.ts

styles/                     # スタイルファイル (1ファイル)
└── globals.css

types/                      # TypeScript型定義 (4ファイル)
├── coupon.ts
├── notification.ts
├── store.ts
└── user.ts

utils/                      # ユーティリティ関数 (4ファイル)
├── genre-colors.ts
├── location.ts
├── rank-calculator.ts
└── validation.ts
```

## ファイル命名規則

### 統一された命名規則
- **kebab-case**: すべてのファイルがkebab-caseで統一
- **PascalCase**: コンポーネント名はPascalCase（ファイル名はkebab-case）

### 設定ファイル
- `components.json` - shadcn/ui設定
- `.nvmrc` - Node.jsバージョン管理
- `package.json` - 依存関係とスクリプト
- `tsconfig.json` - TypeScript設定
- `next.config.mjs` - Next.js設定
- `tailwind.config.ts` - Tailwind CSS設定
- `postcss.config.mjs` - PostCSS設定

## 主な特徴

1. **Atomic Design**: atoms, molecules, organisms, templatesの階層構造
2. **shadcn/ui**: UIコンポーネントライブラリの使用
3. **型安全性**: 専用のtypesディレクトリで型定義を管理
4. **データ分離**: dataディレクトリでモックデータを管理
5. **スキーマ管理**: schemasディレクトリでバリデーションスキーマを管理
6. **スタイル分離**: stylesディレクトリでスタイルファイルを管理
