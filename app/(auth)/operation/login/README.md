# ログイン画面設計書

- 画面名: `運営者ログイン`
- パス: `/operation/login`
- URL: https://carebase-admin.vercel.app/operation/login

## 概要

運営者ログイン画面設計書です。
メールアドレスとパスワードによる認証機能を提供し、認証成功時は運営者管理画面のTOP（事業所一覧）へ遷移します。

認証フローは以下の通りです：

1. メールアドレスとパスワードで認証
2. 認証成功時にトークンとユーザー情報を取得
3. 運営者管理画面TOP (`/operation`) へ自動遷移
4. 認証情報はlocalStorageに永続化

## 全体レイアウト

<img width="409" height="392" alt="image" src="https://github.com/user-attachments/assets/7eb0d5ef-ed20-4f61-a1b1-375fb1f1bc2f" />

### 画面構成

運営者向けログイン画面は、CareBaseロゴ、ログインフォーム、フッターで構成されます。
シンプルで使いやすいデザインを採用し、管理者が迅速にアクセスできるよう配慮されています。

### 画面項目

| 項目名                       | コンポーネント  | 必須 | 最小桁数 | 最大桁数 | フォーマット | 初期値                                                     | 備考                                                     |
| ---------------------------- | --------------- | ---- | -------- | -------- | ------------ | ---------------------------------------------------------- | -------------------------------------------------------- |
| ページタイトル               | CardTitle       | -    | -        | -        | -            | 運営者 ログイン                                            | カード内ヘッダー                                         |
| ページ説明                   | CardDescription | -    | -        | -        | -            | メールアドレスとパスワードを入力してログインしてください。 | カード内説明文                                           |
| メールアドレス               | Input           | ◯    | 1        | -        | email        | -                                                          | メール入力フィールド、リアルタイムバリデーション対応     |
| パスワード                   | Input           | ◯    | 1        | -        | password     | -                                                          | パスワード入力フィールド、リアルタイムバリデーション対応 |
| エラーメッセージ             | テキスト        | -    | -        | -        | -            | -                                                          | 認証エラー時に表示                                       |
| ログインボタン               | Button          | -    | -        | -        | -            | ログイン                                                   | 認証実行ボタン、ローディング状態表示機能付き             |
| パスワードリマインダーリンク | Link            | -    | -        | -        | -            | パスワードを忘れた方はこちら                               | パスワードリセット画面への遷移                           |

## 機能仕様

### アクション

| 項目名                 | 処理内容                               | 対象API                    | 遷移先画面                                                  |
| ---------------------- | -------------------------------------- | -------------------------- | ----------------------------------------------------------- |
| ログインボタン         | メールアドレスとパスワードで認証を実行 | `/api/v1/auth/admin/login` | 運営者管理画面TOP (`/operation`)                            |
| フォーム送信           | Enterキー押下時の認証実行              | 同上                       | 同上                                                        |
| パスワードリマインダー | パスワードリセット画面へ遷移           | -                          | パスワードリマインダー画面 (`/operation/password-reminder`) |

### 入力チェック（リアルタイムバリデーション）

| 項目名         | イベント   | チェック内容         | エラーメッセージ                                 |
| -------------- | ---------- | -------------------- | ------------------------------------------------ |
| メールアドレス | input/blur | 必須項目チェック     | メールアドレスは必須です                         |
| メールアドレス | input/blur | フォーマットチェック | 正しいメールアドレスを入力してください           |
| パスワード     | input/blur | 必須項目チェック     | パスワードは必須です                             |
| フォーム全体   | submit     | 認証失敗チェック     | メールアドレスまたはパスワードが正しくありません |

### バリデーション仕様

#### リアルタイムバリデーション

- React Hookによる入力中のフィールドレベルバリデーション
- `touched` 状態管理により、フィールドがフォーカスされた後にバリデーションを実行
- エラー状態の場合、フィールドを赤色でハイライト
- エラーメッセージをフィールド下部に表示
- 開発環境では緩和されたバリデーションを使用

#### フォームバリデーション

- 全フィールドが有効かつ空でない場合のみログインボタンを有効化
- 無効な状態では `disabled` 属性を設定
- 動的な有効性チェック

#### ローディング状態

- 認証処理中はローディングスピナーを表示
- ボタンテキストが「ログイン中...」に変更
- フォーム全体が無効化され、重複送信を防止

## 開発環境での認証

### モック認証情報

開発環境では任意の認証情報でテストが可能です。

（例：admin@carebase.jp / password）

### 認証フロー詳細

1. **認証処理**
   - 認証API呼び出し
   - 開発環境ではモック認証を使用
   - 成功時にJWTトークンとユーザー情報を取得

2. **状態管理**
   - React stateによる認証状態の管理
   - localStorage への認証情報永続化
   - 認証状態の自動復元

3. **管理画面遷移**
   - 認証成功後、`/operation` へ自動遷移
   - 運営者権限の確認
   - セッション情報の設定

## コンポーネント構成

### 主要コンポーネント

- **LoginForm** (`components/2_molecules/login-form.tsx`)
  - フォーム全体の制御とレイアウト
  - roleName="運営者", redirectPath="/operation" で設定
  - shadcn/ui Cardコンポーネントを使用

- **Input** (`components/ui/input.tsx`)
  - shadcn/ui Input コンポーネント
  - type="email" および type="password" 対応
  - required属性による基本バリデーション

- **Button** (`components/ui/button.tsx`)
  - shadcn/ui Button コンポーネント
  - type="submit" でフォーム送信
  - className="w-full" で全幅表示

- **Card関連** (`components/ui/card.tsx`)
  - Card, CardContent, CardDescription, CardTitle
  - ログインフォームのコンテナとして使用

- **Label** (`components/ui/label.tsx`)
  - shadcn/ui Label コンポーネント
  - フォームフィールドのラベル表示

### 状態管理

- **useState** フック
  - email, password, error の状態管理
  - リアルタイムな入力値の追跡

- **useRouter** フック
  - Next.js App Router による画面遷移
  - 認証成功時の `/operation` への遷移

## API仕様

### エンドポイント

| エンドポイント                         | 説明                   |
| -------------------------------------- | ---------------------- |
| `/api/v1/auth/admin/login`             | 運営者ログイン         |
| `/api/v1/auth/admin/logout`            | ログアウト             |
| `/api/v1/auth/admin/password-reminder` | パスワードリマインダー |
| `/api/v1/auth/admin/password-reset`    | パスワードリセット     |

### 認証レスポンス

```typescript
interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    role: 'operator' | 'facility_manager' | 'care_manager';
    permissions: string[];
    organizationId?: string;
  };
  error?: string;
}

interface LoginResult {
  success: boolean;
  error?: string;
}
```

### リクエスト仕様

```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

## UI/UX仕様

### レスポンシブデザイン

- **デスクトップ**: 最大幅 `max-w-md` (384px) のカード表示
- **タブレット**: 1024px以下でも同様のレイアウトを維持
- **モバイル**: 375px以下でも適切に表示

### アクセシビリティ

- 適切なラベル付け（Label コンポーネント使用）
- キーボードナビゲーション対応
- スクリーンリーダー対応
- 適切なコントラスト比の確保

### カラーテーマ

- shadcn/ui のデフォルトテーマを使用
- エラー状態: `text-red-500` クラス
- 一貫したデザインシステムの適用

## セキュリティ仕様

### 入力検証

- メールアドレスフォーマットの検証
- パスワード必須チェック
- XSS対策（React の自動エスケープ）

### 認証セキュリティ

- JWTトークンによる認証
- HTTPS通信の強制
- セッションタイムアウト機能

## 参考資料

- [CareBase-admin Issue #237](https://github.com/ambi-tious/CareBase-admin/issues/237)
- [運営者画面一覧](../../../docs/運営者.md)
- [画面一覧インデックス](../../../docs/screen-list.md)
- [LoginForm コンポーネント](../../../components/2_molecules/login-form.tsx)
- [shadcn/ui ドキュメント](https://ui.shadcn.com/)
