# tamanomi-admin/frontend リファクタリング計画

## 現在の構成分析

### tamanomi-admin/frontend (現在)
```
src/
├── app/                    # Next.js App Router
├── components/
│   ├── atoms/             # 基本コンポーネント
│   ├── molecules/         # 複合コンポーネント
│   ├── organisms/         # 複雑なコンポーネント
│   ├── pages/             # ページコンポーネント
│   └── templates/         # レイアウトテンプレート
├── constants/             # 定数
├── contexts/              # React Context
├── hooks/                 # カスタムフック
├── lib/                   # ライブラリ・ユーティリティ
└── utils/                 # ユーティリティ関数
```

### tamanomi-web/frontend (目標)
```
src/
├── app/                    # Next.js App Router
├── components/
│   ├── atoms/             # 基本コンポーネント
│   ├── molecules/         # 複合コンポーネント
│   ├── organisms/         # 複雑なコンポーネント
│   ├── templates/         # レイアウトテンプレート
│   ├── theme-provider.tsx # テーマプロバイダー
│   └── ui/                # UIコンポーネント（shadcn/ui）
├── data/                  # モックデータ・CSVファイル
├── hooks/                 # カスタムフック
├── lib/                   # ライブラリ・ユーティリティ
├── schemas/               # バリデーションスキーマ
├── styles/                # スタイルファイル
├── types/                 # TypeScript型定義
└── utils/                 # ユーティリティ関数
```

## 主な違いと必要な変更

### 1. ディレクトリ構造の変更

#### 追加が必要なディレクトリ
- `src/data/` - モックデータやCSVファイル用
- `src/schemas/` - バリデーションスキーマ用
- `src/styles/` - スタイルファイル用（globals.cssを移動）
- `src/types/` - TypeScript型定義用
- `src/components/ui/` - shadcn/uiコンポーネント用

#### 移動が必要なファイル
- `src/contexts/` → `src/components/` に統合または削除
- `src/constants/` → `src/lib/` に統合
- `src/components/pages/` → 削除（app/ディレクトリに統合済み）

### 2. ファイル命名規則の統一

#### 現在（PascalCase）
- `Button.tsx`
- `Checkbox.tsx`
- `Icon.tsx`

#### 目標（kebab-case）
- `button.tsx`
- `checkbox.tsx`
- `icon.tsx`

### 3. 設定ファイルの追加

#### 追加が必要なファイル
- `components.json` - shadcn/ui設定
- `.nvmrc` - Node.jsバージョン管理

### 4. スタイルファイルの整理

#### 移動が必要
- `src/app/globals.css` → `src/styles/globals.css`

## リファクタリング手順

### Phase 1: ディレクトリ構造の準備
1. 新しいディレクトリを作成
2. 既存ファイルの移動計画を策定

### Phase 2: ファイルの移動とリネーム
1. スタイルファイルの移動
2. コンポーネントファイルのリネーム
3. ディレクトリ構造の調整

### Phase 3: 設定ファイルの追加
1. components.jsonの追加
2. .nvmrcの追加
3. 必要に応じて他の設定ファイルを調整

### Phase 4: インポートパスの修正
1. 移動・リネームしたファイルのインポートパスを修正
2. 型定義の整理

### Phase 5: テストと検証
1. ビルドエラーの確認と修正
2. 動作確認

## 注意事項

- 既存の機能を壊さないよう段階的に進める
- 各フェーズでビルドが通ることを確認
- 必要に応じてコミットを細かく分ける
- インポートパスの変更は慎重に行う
