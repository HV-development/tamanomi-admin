# 事業所編集画面設計書

- 画面名: `事業所編集`
- パス: `/operation/offices/[id]/edit`
- URL: https://carebase-admin.vercel.app/operation/offices/[id]/edit

## 概要

運営者向け事業所編集画面設計書です。
既存の事業所情報を編集・更新する機能を提供し、基本情報、連絡先情報、営業時間等の変更を行えます。

主要機能は以下の通りです：

1. 既存事業所データの取得と表示
2. 事業所情報の編集（基本情報、連絡先、営業時間等）
3. リアルタイムバリデーション機能
4. 入力データの検証とエラー表示
5. 更新処理とフィードバック表示
6. 事業所詳細画面への遷移

## 全体レイアウト

### 画面構成

事業所編集画面は、ページヘッダー、事業所フォーム、アクションボタンで構成されます。
既存データを事前に入力した状態で表示し、効率的な情報更新を支援します。

### 画面項目

| 項目名           | コンポーネント | 必須 | 最小桁数 | 最大桁数 | フォーマット | 初期値                             | 備考                         |
| ---------------- | -------------- | ---- | -------- | -------- | ------------ | ---------------------------------- | ---------------------------- |
| 戻るボタン       | Button + Link  | -    | -        | -        | -            | -                                  | 事業所詳細画面への戻るボタン |
| ページタイトル   | h1             | -    | -        | -        | -            | 事業所編集                         | ページメインタイトル         |
| ページ説明       | p              | -    | -        | -        | -            | {事業所名}の情報を編集します       | 編集対象事業所名を含む説明文 |
| 事業所フォーム   | OfficeForm     | -    | -        | -        | -            | -                                  | 事業所情報編集フォーム       |
| ローディング表示 | LoadingSpinner | -    | -        | -        | -            | "読み込み中..."                    | データ取得中の表示           |
| エラー表示       | ErrorState     | -    | -        | -        | -            | "事業所情報を取得できませんでした" | データ取得エラー時の表示     |

## データ取得・表示仕様

### 初期データ読み込み

- **事業所データ取得**: ページ読み込み時に事業所IDから既存データを取得
- **法人データ取得**: 選択肢表示用の法人一覧を取得
- **フォーム初期化**: 取得したデータでフォームフィールドを初期化
- **ローディング表示**: データ取得中はローディングスピナーを表示
- **エラーハンドリング**: データ取得失敗時の適切なエラー表示

### 初期値設定

| 項目名       | 初期値設定                            |
| ------------ | ------------------------------------- |
| 事業所名     | `office.name`                         |
| 法人選択     | `office.companyId`                    |
| 住所         | `office.address`                      |
| 電話番号     | `office.phoneNumber`                  |
| サービス種別 | `office.serviceType`                  |
| 定員         | `office.capacity`                     |
| 開設日       | `office.establishedDate` または空文字 |
| 備考         | `office.description` または空文字     |

## フォーム構造

### 基本情報セクション

| 項目名       | コンポーネント | 必須 | 最小桁数 | 最大桁数 | フォーマット | プレースホルダー           | バリデーション                             |
| ------------ | -------------- | ---- | -------- | -------- | ------------ | -------------------------- | ------------------------------------------ |
| 事業所名     | Input          | ◯    | 1        | 100      | text         | さくら訪問看護ステーション | 必須チェック、文字数チェック               |
| 法人選択     | Select         | ◯    | -        | -        | select       | -                          | 必須チェック                               |
| 住所         | Input          | ◯    | 1        | 200      | text         | 東京都渋谷区...            | 必須チェック、文字数チェック               |
| 電話番号     | Input          | ◯    | 1        | -        | text         | 03-1234-5678               | 必須チェック、電話番号フォーマットチェック |
| サービス種別 | Select         | ◯    | -        | -        | select       | -                          | 必須チェック                               |
| 定員         | Input          | ◯    | 1        | -        | number       | 50                         | 必須チェック、1以上の数値チェック          |
| 開設日       | Input          | -    | -        | -        | date         | -                          | 日付フォーマットチェック（任意）           |
| 備考         | Textarea       | -    | -        | 1000     | text         | 事業所の詳細情報...        | 文字数チェック（任意）                     |

## 機能仕様

### アクション

| 項目名     | 処理内容             | 対象API                    | 遷移先画面                                 |
| ---------- | -------------------- | -------------------------- | ------------------------------------------ |
| 戻るボタン | 事業所詳細画面へ戻る | -                          | 事業所詳細画面 (`/operation/offices/[id]`) |
| 更新ボタン | 事業所更新処理を実行 | `PUT /api/v1/offices/[id]` | 事業所詳細画面 (`/operation/offices/[id]`) |

### データフロー

#### 初期化フロー

1. **ページアクセス**: URLパラメータから事業所IDを取得
2. **データ取得**: useOffice、useCompaniesフックでデータを取得
3. **ローディング表示**: データ取得中はスピナー表示
4. **フォーム初期化**: 取得データでフォームを初期化
5. **編集可能状態**: フォーム表示完了

#### 更新フロー

1. **バリデーション**: フォーム送信時にクライアント側バリデーション実行
2. **データ変換**: EditOfficeFormDataからUpdateOfficeRequestへの型変換
3. **API呼び出し**: updateOffice関数で更新APIを呼び出し
4. **楽観的更新**: 成功時にローカル状態を即座に更新
5. **成功通知**: トースト通知で更新成功をフィードバック
6. **画面遷移**: 事業所詳細画面に自動遷移

### 状態管理

#### データ取得状態

- **office**: 取得した事業所データ
- **officeLoading**: 事業所データ取得中の状態
- **companies**: 取得した法人データ
- **companiesLoading**: 法人データ取得中の状態
- **error**: データ取得エラー時の状態

#### フォーム状態

- **OfficeForm**: mode="edit"で編集モードに設定
- **initialData**: 既存データをフォームの初期値として設定
- **formLoading**: 更新処理中のローディング状態
- **バリデーション**: 編集用バリデーションスキーマの適用

#### 処理状態

- **formLoading**: 更新処理中のローディング状態
- **ボタン無効化**: 処理中は全ボタンを無効化
- **エラーハンドリング**: 更新失敗時のエラー表示

### バリデーション仕様

#### 編集モード専用バリデーション

- **officeEditSchema**: 編集用のZodスキーマを使用
- **必須項目維持**: 登録時と同様の必須項目チェック
- **データ整合性**: 既存データとの整合性チェック
- **変更検知**: 実際に変更された項目のみを更新

### データ変換処理

#### 型変換仕様

```typescript
// EditOfficeFormDataからUpdateOfficeRequestへの変換
const updateData: UpdateOfficeRequest = {
  id: id,
  ...data,
  // 編集フォームから取得したnotesをdescriptionにマップ
  description: data.notes,
  // 編集フォームにはない項目のデフォルト値
  faxNumber: '',
  website: '',
  certifications: [],
};
```

## コンポーネント構成

### 主要コンポーネント

- **EditOfficePage** (`app/(dashboard)/operation/offices/[id]/edit/page.tsx`)
  - ページ全体の制御とレイアウト
  - 事業所・法人データの取得と状態管理
  - フォーム送信処理とエラーハンドリング
  - 成功時の画面遷移制御
  - データ型変換処理

- **OfficeForm** (`components/2_molecules/forms/office-form.tsx`)
  - 事業所フォーム全体の制御とレイアウト
  - mode="edit"で編集モードに設定
  - initialData で既存データを初期値として設定
  - officeEditSchema による編集用バリデーション

### 状態管理フック

- **useOffice** (`hooks/use-offices.ts`)
  - 個別事業所データの取得と管理
  - ローディング・エラー状態の管理
  - データ再取得機能

- **useCompanies** (`hooks/use-companies.ts`)
  - 法人データの取得と管理
  - 選択肢用データの提供

- **useOfficeActions** (`hooks/use-offices.ts`)
  - updateOffice関数による事業所更新処理
  - 楽観的更新による UI 応答性向上
  - エラーハンドリングと状態管理

### ローディング・エラー状態

#### ローディング状態

```typescript
if (officeLoading || companiesLoading) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    </div>
  );
}
```

#### エラー状態

```typescript
if (error || !office) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-4">
        <div className="text-red-600 text-lg font-medium">エラーが発生しました</div>
        <p className="text-muted-foreground">{error || '事業所情報を取得できませんでした'}</p>
        <Button asChild>
          <Link href="/operation/offices">事業所一覧に戻る</Link>
        </Button>
      </div>
    </div>
  );
}
```

## API仕様

### エンドポイント

| エンドポイント         | メソッド | 説明           |
| ---------------------- | -------- | -------------- |
| `/api/v1/offices/[id]` | GET      | 事業所詳細取得 |
| `/api/v1/offices/[id]` | PUT      | 事業所情報更新 |
| `/api/v1/companies`    | GET      | 法人一覧取得   |

### リクエスト仕様

#### 事業所詳細取得

- **パラメータ**: URL パラメータで事業所ID指定
- **レスポンス**: Office型のデータオブジェクト

#### 事業所情報更新

```typescript
interface UpdateOfficeRequest {
  id: string;
  name?: string;
  companyId?: string;
  address?: string;
  phoneNumber?: string;
  faxNumber?: string;
  email?: string;
  website?: string;
  serviceType?: string;
  establishedDate?: string;
  capacity?: number;
  description?: string;
  operatingHours?: {
    [key: string]: {
      isOpen: boolean;
      openTime?: string;
      closeTime?: string;
    };
  };
  certifications?: string[];
}
```

### レスポンス仕様

```typescript
interface UpdateOfficeResponse {
  id: string;
  name: string;
  companyId: string;
  companyName: string;
  address: string;
  phoneNumber: string;
  faxNumber?: string;
  email?: string;
  website?: string;
  serviceType: string;
  establishedDate?: string;
  capacity: number;
  currentUsers: number;
  staffCount: number;
  status: string;
  managerId?: string;
  managerName?: string;
  description?: string;
  operatingHours: {
    [key: string]: {
      isOpen: boolean;
      openTime?: string;
      closeTime?: string;
    };
  };
  certifications: string[];
  createdAt: string;
  updatedAt: string;
}
```

## UI/UX仕様

### レスポンシブデザイン

- **デスクトップ**: 2列レイアウトでフィールドを効率的に配置
- **タブレット**: 1024px以下では1列レイアウトに変更
- **モバイル**: 768px以下でも適切な編集体験を提供

### アクセシビリティ

- **ラベル関連付け**: 全入力フィールドに適切なラベル設定
- **キーボードナビゲーション**: Tab キーでの順次移動対応
- **エラー通知**: スクリーンリーダー対応のエラーメッセージ
- **フォーカス管理**: 視覚的に明確なフォーカス表示

### インタラクション

#### 初期表示

- **データ読み込み**: 既存データでフィールドを事前入力
- **編集準備**: 即座に編集可能な状態で表示
- **変更追跡**: フィールド変更時の視覚的フィードバック

#### 編集体験

- **リアルタイムバリデーション**: 入力中の即座なフィードバック
- **変更表示**: 変更されたフィールドの視覚的ハイライト
- **保存状態**: 未保存の変更がある場合の警告表示

#### フィードバック

- **成功通知**: 更新成功時のトースト通知と自動遷移
- **エラー通知**: 更新失敗時のトースト通知
- **バリデーションエラー**: フィールド下部のインラインエラー表示

### カラーテーマ

- **shadcn/ui**: デフォルトテーマを使用
- **変更ハイライト**: 変更されたフィールドの強調表示
- **エラー色**: 赤色系統でエラー状態を表示
- **成功色**: 緑色系統で成功状態を表示

## パフォーマンス最適化

### データ取得最適化

- **並行取得**: useOffice と useCompanies の並行データ取得
- **キャッシュ活用**: 既存データの再利用
- **エラーリトライ**: 失敗時の適切なリトライ機能

### フォーム最適化

- **React Hook Form**: 効率的なフォーム状態管理
- **メモ化**: 不要な再レンダリングの防止
- **楽観的更新**: 更新成功時の即座のUI更新

### レンダリング最適化

- **条件付きレンダリング**: ローディング・エラー状態の効率的な表示切り替え
- **useEffect依存**: 適切な依存配列による不要な処理の防止

## セキュリティ仕様

### 認証・認可

- **事業所アクセス権限**: 編集対象事業所への適切なアクセス権限確認
- **URL直接アクセス**: 不正なIDでのアクセス時の適切なエラー処理
- **セッション管理**: 認証状態の適切な管理

### 入力検証

- **クライアント側バリデーション**: Zodスキーマによる厳密な入力検証
- **サーバー側バリデーション**: APIレベルでの二重チェック
- **XSS対策**: Reactの自動エスケープ機能
- **データ整合性**: 更新データの整合性チェック

## 開発環境での動作

### モック機能

- **開発環境**: モックサービスによる更新処理シミュレーション
- **遅延シミュレーション**: 500msの遅延で実際のAPI通信を模擬
- **エラーテスト**: 意図的なエラー発生によるエラーハンドリングテスト

### テスト機能

- **データ取得テスト**: 正常系・異常系での事業所データ取得確認
- **フォーム初期化テスト**: 既存データでのフォーム初期化確認
- **更新処理テスト**: 各種入力パターンでの更新処理確認
- **バリデーションテスト**: 編集用バリデーションの動作確認
- **型変換テスト**: EditOfficeFormDataからUpdateOfficeRequestへの変換確認

## 参考資料

- [CareBase-admin プロジェクト](https://github.com/ambi-tious/CareBase-admin)
- [事業所詳細画面](../README.md)
- [事業所一覧画面](../../README.md)
- [事業所登録画面](../../register/README.md)
- [運営者画面一覧](../../../../../docs/運営者.md)
- [OfficeForm コンポーネント](../../../../../components/2_molecules/forms/office-form.tsx)
- [useOffices フック](../../../../../hooks/use-offices.ts)
- [useCompanies フック](../../../../../hooks/use-companies.ts)
- [Office 型定義](../../../../../types/office.ts)
- [React Hook Form ドキュメント](https://react-hook-form.com/)
- [Zod ドキュメント](https://zod.dev/)
- [shadcn/ui ドキュメント](https://ui.shadcn.com/)
