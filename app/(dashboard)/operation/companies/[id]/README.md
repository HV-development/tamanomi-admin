# 会社詳細画面設計書

- 画面名: `会社詳細`
- パス: `/operation/companies/[id]`
- URL: https://carebase-admin.vercel.app/operation/companies/[id]

## 概要

運営者向け会社詳細画面設計書です。
指定された会社の詳細情報を表示し、編集・削除操作への遷移機能を提供します。

主要機能は以下の通りです：

1. 会社詳細情報の表示（基本情報、連絡先、代表者、その他）
2. ステータス表示とカラーコーディング
3. 編集画面への遷移機能
4. 削除確認ダイアログ（実装準備済み）
5. 会社一覧画面への戻り機能

## 全体レイアウト

### 画面構成

会社詳細画面は、ページヘッダー、情報表示セクション（4つのカード）で構成されます。
情報を整理して表示し、必要な操作への導線を提供する直感的なデザインを採用しています。

### 画面項目

| 項目名           | コンポーネント | 表示条件     | 初期値                 | 備考                         |
| ---------------- | -------------- | ------------ | ---------------------- | ---------------------------- |
| 戻るボタン       | Button + Link  | 常時         | -                      | 会社一覧画面への戻るボタン   |
| ページタイトル   | h1             | 常時         | {会社名}               | 動的に会社名を表示           |
| ページ説明       | p              | 常時         | 会社の詳細情報         | 固定説明文                   |
| 編集ボタン       | Button + Link  | 常時         | 編集                   | 編集画面への遷移ボタン       |
| 基本情報カード   | Card           | 常時         | -                      | 会社の基本情報表示セクション |
| 連絡先情報カード | Card           | 常時         | -                      | 連絡先情報表示セクション     |
| 代表者情報カード | Card           | 常時         | -                      | 代表者情報表示セクション     |
| その他情報カード | Card           | 常時         | -                      | その他の情報表示セクション   |
| ローディング表示 | LoadingSpinner | データ取得中 | "読み込み中..."        | データ取得中の表示           |
| エラー表示       | ErrorState     | エラー時     | "会社が見つかりません" | データ取得エラー時の表示     |

## 情報表示構造

### 基本情報セクション

| 項目名         | 表示データ                | 表示形式                   | 未設定時の表示 |
| -------------- | ------------------------- | -------------------------- | -------------- |
| 会社名         | `company.name`            | テキスト                   | -              |
| 会社名（カナ） | `company.nameKana`        | テキスト                   | -              |
| 法人番号       | `company.corporateNumber` | テキスト                   | "未設定"       |
| 事業種別       | `company.businessType`    | テキスト                   | -              |
| 設立日         | `company.establishedDate` | テキスト                   | "未設定"       |
| ステータス     | `company.status`          | バッジ（カラーコード付き） | -              |
| 住所           | `company.address`         | アイコン付きテキスト       | -              |

#### ステータス表示仕様

| ステータス値 | 表示名       | バッジカラー                         |
| ------------ | ------------ | ------------------------------------ |
| active       | アクティブ   | 緑色 (bg-green-100 text-green-800)   |
| inactive     | 非アクティブ | 灰色 (bg-gray-100 text-gray-800)     |
| suspended    | 一時停止     | 黄色 (bg-yellow-100 text-yellow-800) |

### 連絡先情報セクション

| 項目名         | 表示データ            | 表示形式             | アイコン |
| -------------- | --------------------- | -------------------- | -------- |
| 電話番号       | `company.phoneNumber` | アイコン付きテキスト | Phone    |
| メールアドレス | `company.email`       | アイコン付きテキスト | Mail     |

### 代表者情報セクション

| 項目名   | 表示データ                       | 表示形式 | 未設定時の表示 |
| -------- | -------------------------------- | -------- | -------------- |
| 代表者名 | `company.representativeName`     | テキスト | -              |
| 役職     | `company.representativePosition` | テキスト | "未設定"       |

### その他情報セクション

| 項目名   | 表示データ              | 表示形式             | アイコン   | 未設定時の表示 |
| -------- | ----------------------- | -------------------- | ---------- | -------------- |
| 資本金   | `company.capital`       | アイコン付きテキスト | DollarSign | "未設定"       |
| 従業員数 | `company.employeeCount` | アイコン付きテキスト | Users      | "未設定"       |
| 登録日   | `company.createdAt`     | アイコン付き日付     | Calendar   | -              |
| 更新日   | `company.updatedAt`     | アイコン付き日付     | Calendar   | -              |
| 備考     | `company.notes`         | テキスト             | -          | 表示しない     |

#### 日付表示フォーマット

- **フォーマット**: `toLocaleDateString('ja-JP')`
- **例**: `2024/01/15`

## 機能仕様

### アクション

| 項目名     | 処理内容           | 対象API | 遷移先画面                                      |
| ---------- | ------------------ | ------- | ----------------------------------------------- |
| 戻るボタン | 会社一覧画面へ戻る | -       | 会社一覧画面 (`/operation/companies`)           |
| 編集ボタン | 会社編集画面へ遷移 | -       | 会社編集画面 (`/operation/companies/[id]/edit`) |

### データ取得仕様

#### 初期データ読み込み

- **データ取得**: ページ読み込み時に会社IDから詳細データを取得
- **useCompany フック**: 個別会社データの取得と状態管理
- **ローディング管理**: データ取得中の適切なローディング表示
- **エラーハンドリング**: データ取得失敗時の適切なエラー表示

#### データ取得フロー

1. **URLパラメータ解析**: `use(params)` でパスパラメータから会社IDを取得
2. **API呼び出し**: `useCompany(companyId)` でデータ取得開始
3. **ローディング状態**: `loading` 状態でスピナー表示
4. **データ表示**: 取得成功時に詳細情報を表示
5. **エラー処理**: 取得失敗時にエラーメッセージ表示

### 状態管理

#### データ状態

- **company**: 取得した会社データ（Company型 | null）
- **loading**: データ取得中の状態（boolean）
- **error**: エラーメッセージ（string | null）

#### UI状態

- **showDeleteDialog**: 削除確認ダイアログ表示状態（boolean）
- **deleting**: 削除処理中の状態（boolean）

### エラーハンドリング

#### データ取得エラー

```typescript
if (error || !company) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/operation/companies">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">会社詳細</h1>
          <p className="text-muted-foreground">エラーが発生しました</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="p-12 text-center">
          <Building2 className="mx-auto h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">会社が見つかりません</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {error || '指定された会社が見つかりませんでした'}
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/operation/companies">会社一覧に戻る</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## コンポーネント構成

### 主要コンポーネント

- **CompanyDetailPage** (`app/(dashboard)/operation/companies/[id]/page.tsx`)
  - ページ全体の制御とレイアウト
  - 会社データの取得と状態管理
  - ローディング・エラー状態の表示制御
  - 削除確認ダイアログの管理（実装準備済み）

### UI コンポーネント

- **Card関連** (`components/ui/card.tsx`)
  - Card, CardContent, CardHeader, CardTitle
  - 情報セクションのコンテナとして使用

- **Button** (`components/ui/button.tsx`)
  - 戻るボタン、編集ボタンの実装
  - リンク機能付きボタン

- **Badge** (`components/ui/badge.tsx`)
  - ステータス表示用バッジ
  - カラーコーディング対応

- **Label** (`components/ui/label.tsx`)
  - 各情報項目のラベル表示

- **AlertDialog関連** (`components/ui/alert-dialog.tsx`)
  - 削除確認ダイアログ（実装準備済み）

### アイコンコンポーネント

- **Lucide React アイコン**
  - Building2: 基本情報セクションアイコン
  - Phone: 連絡先セクションアイコン、電話番号アイコン
  - User: 代表者セクションアイコン
  - FileText: その他情報セクションアイコン
  - Mail: メールアドレスアイコン
  - MapPin: 住所アイコン
  - DollarSign: 資本金アイコン
  - Users: 従業員数アイコン
  - Calendar: 日付アイコン
  - ArrowLeft: 戻るボタンアイコン
  - Edit: 編集ボタンアイコン

### カスタムフック

- **useCompany** (`hooks/use-companies.ts`)
  - 個別会社データの取得と管理
  - ローディング・エラー状態の管理
  - データ再取得機能（refetch）

### ユーティリティ関数

#### ステータス表示関数

```typescript
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'suspended':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return 'アクティブ';
    case 'inactive':
      return '非アクティブ';
    case 'suspended':
      return '一時停止';
    default:
      return status;
  }
};
```

## API仕様

### エンドポイント

| エンドポイント           | メソッド | 説明         |
| ------------------------ | -------- | ------------ |
| `/api/v1/companies/[id]` | GET      | 会社詳細取得 |

### リクエスト仕様

- **パラメータ**: URL パラメータで会社ID指定
- **認証**: JWTトークンによる認証必須
- **権限**: 運営者権限の確認

### レスポンス仕様

```typescript
interface CompanyDetailResponse {
  id: string;
  name: string;
  nameKana: string;
  corporateNumber?: string;
  address: string;
  phoneNumber: string;
  email: string;
  representativeName: string;
  representativePosition?: string;
  businessType: string;
  establishedDate?: string;
  capital?: string;
  employeeCount?: number;
  status: 'active' | 'inactive' | 'suspended';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### エラーレスポンス

| ステータスコード | 説明               | メッセージ例                     |
| ---------------- | ------------------ | -------------------------------- |
| 404              | 会社が見つからない | "指定された会社が見つかりません" |
| 401              | 認証エラー         | "認証が必要です"                 |
| 403              | アクセス権限なし   | "アクセス権限がありません"       |
| 500              | サーバーエラー     | "サーバーエラーが発生しました"   |

## UI/UX仕様

### レスポンシブデザイン

- **デスクトップ**: 2列グリッドレイアウトで情報を効率的に表示
- **タブレット**: 1024px以下では1列レイアウトに変更
- **モバイル**: 768px以下でも適切な情報表示を提供

### アクセシビリティ

- **セマンティックHTML**: 適切なHTML要素の使用
- **ラベル関連付け**: 情報項目とラベルの適切な関連付け
- **キーボードナビゲーション**: Tab キーでの順次移動対応
- **スクリーンリーダー対応**: 適切なARIA属性設定
- **コントラスト比**: WCAG 2.1 AA準拠のコントラスト比

### インタラクション

#### 読み込み体験

- **スムーズローディング**: 段階的な情報表示
- **スケルトンローディング**: コンテンツ構造を保持したローディング表示
- **プログレッシブエンハンスメント**: 基本情報から詳細情報への順次表示

#### 情報表示

- **階層的表示**: 重要度に応じた情報の階層化
- **視覚的グルーピング**: 関連情報のカード単位でのグループ化
- **アイコン活用**: 直感的な理解を支援するアイコン表示

#### ナビゲーション

- **明確な導線**: 戻る・編集ボタンの分かりやすい配置
- **ブレッドクラム**: 現在位置の明確な表示
- **関連アクション**: 次に実行可能なアクションの提示

### カラーテーマ

- **shadcn/ui**: デフォルトテーマを使用
- **ステータス色**: 意味に応じたカラーコーディング
- **情報階層**: テキストカラーによる情報の重要度表現
- **一貫性**: プロジェクト全体のデザインシステムに準拠

## パフォーマンス最適化

### データ取得最適化

- **効率的フェッチ**: 必要なデータのみを取得
- **キャッシュ戦略**: 適切なデータキャッシュ
- **エラーリトライ**: 失敗時の適切なリトライ機能

### レンダリング最適化

- **条件付きレンダリング**: 状態に応じた効率的な表示切り替え
- **メモ化**: 不要な再レンダリングの防止
- **遅延ローディング**: 必要に応じた段階的コンテンツ読み込み

### ネットワーク最適化

- **リクエスト最適化**: 不要なAPI呼び出しの削減
- **圧縮**: 適切なデータ圧縮
- **CDN活用**: 静的リソースの効率的配信

## セキュリティ仕様

### 認証・認可

- **JWT認証**: トークンベース認証
- **権限チェック**: 運営者権限の確認
- **会社アクセス権限**: 表示対象会社への適切なアクセス権限確認

### データ保護

- **HTTPS通信**: 暗号化通信の強制
- **機密情報保護**: 適切なデータマスキング
- **XSS対策**: Reactの自動エスケープ機能

### URL セキュリティ

- **パラメータ検証**: URLパラメータの適切な検証
- **不正アクセス防止**: 存在しない会社IDでのアクセス制御
- **エラー情報制御**: 適切なエラーメッセージの表示

## 開発環境での動作

### モック機能

- **開発環境**: モックデータによる詳細情報表示
- **遅延シミュレーション**: 200msの遅延で実際のAPI通信を模擬
- **エラーテスト**: 意図的なエラー発生によるエラーハンドリングテスト

### テストデータ

開発環境では以下のモック会社データを使用：

- **ID: 1** - 株式会社ケアサポート (アクティブ)
- **ID: 2** - 有限会社ライフケア (アクティブ)
- **ID: 3** - 合同会社ヘルスケア (アクティブ)
- **ID: 4** - 株式会社シニアサポート (アクティブ)
- **ID: 5** - 有限会社ケアネット (非アクティブ)
- **ID: 6** - 株式会社ウェルフェアパートナーズ (一時停止)

### テスト機能

- **データ表示テスト**: 各種会社データでの表示確認
- **状態テスト**: ローディング・エラー状態の表示確認
- **ナビゲーションテスト**: 各種リンクの動作確認
- **レスポンシブテスト**: 各種画面サイズでの表示確認

## 参考資料

- [CareBase-admin プロジェクト](https://github.com/ambi-tious/CareBase-admin)
- [会社一覧画面](../README.md)
- [会社編集画面](edit/README.md)
- [会社登録画面](../register/README.md)
- [運営者画面一覧](../../../../docs/運営者.md)
- [useCompanies フック](../../../../hooks/use-companies.ts)
- [Company 型定義](../../../../types/company.ts)
- [Company モックデータ](../../../../mocks/companies.ts)
- [shadcn/ui ドキュメント](https://ui.shadcn.com/)
- [Lucide React アイコン](https://lucide.dev/)
