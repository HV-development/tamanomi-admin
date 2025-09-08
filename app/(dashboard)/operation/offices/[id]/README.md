# 事業所詳細画面設計書

- 画面名: `事業所詳細`
- パス: `/operation/offices/[id]`
- URL: https://carebase-admin.vercel.app/operation/offices/[id]

## 概要

運営者向け事業所詳細画面設計書です。
指定された事業所の詳細情報を表示し、統計情報、基本情報、連絡先情報、営業時間等を包括的に提供します。

主要機能は以下の通りです：

1. 事業所詳細情報の表示（統計カード、基本情報、連絡先、営業時間）
2. 視覚的な統計情報表示（職員数、利用者数、稼働率、登録日）
3. ステータス・サービス種別の表示
4. 編集画面への遷移機能
5. 事業所一覧画面への戻り機能

## 全体レイアウト

### 画面構成

事業所詳細画面は、ページヘッダー、統計カードセクション、情報表示セクション（3つのカード）で構成されます。
重要な情報を階層化して表示し、直感的で分かりやすいデザインを採用しています。

### 画面項目

| 項目名             | コンポーネント | 表示条件     | 初期値                           | 備考                           |
| ------------------ | -------------- | ------------ | -------------------------------- | ------------------------------ |
| 戻るボタン         | Button + Link  | 常時         | -                                | 事業所一覧画面への戻るボタン   |
| 事業所アバター     | Avatar         | 常時         | 事業所名の頭文字                 | 事業所の視覚的識別子           |
| ページタイトル     | h1             | 常時         | {事業所名}                       | 動的に事業所名を表示           |
| 法人名・ステータス | p + Badge      | 常時         | {法人名} + ステータスバッジ      | 法人名とステータスの表示       |
| 編集ボタン         | Button + Link  | 常時         | 編集                             | 編集画面への遷移ボタン         |
| 統計カード群       | Card × 4       | 常時         | 職員数、利用者数、稼働率、登録日 | 重要指標の視覚的表示           |
| 基本情報カード     | Card           | 常時         | -                                | 事業所の基本情報表示セクション |
| 連絡先情報カード   | Card           | 常時         | -                                | 連絡先情報表示セクション       |
| 営業時間カード     | Card           | 常時         | -                                | 営業時間表示セクション         |
| ローディング表示   | Skeleton       | データ取得中 | スケルトンローダー               | データ取得中の表示             |
| エラー表示         | ErrorState     | エラー時     | "事業所が見つかりません"         | データ取得エラー時の表示       |

## 情報表示構造

### 統計カードセクション

| カード名 | 表示データ                  | アイコン  | 表示形式                                   |
| -------- | --------------------------- | --------- | ------------------------------------------ |
| 職員数   | `office.staffCount`         | UserCheck | 大きな数値 + "名" 単位                     |
| 利用者数 | `office.currentUsers`       | Users     | 大きな数値 + "/ {capacity} 名" 形式        |
| 稼働率   | 計算値（利用者数/定員×100） | Building2 | パーセンテージ + "定員に対する利用率" 説明 |
| 登録日   | `office.createdAt`          | Calendar  | 月日（大きく） + 年（小さく） 形式         |

#### 稼働率計算

```typescript
const capacityRate = Math.round((office.currentUsers / office.capacity) * 100);
```

### 基本情報セクション

| 項目名       | 表示データ               | 表示形式               | アイコン  | 未設定時の表示 |
| ------------ | ------------------------ | ---------------------- | --------- | -------------- |
| 住所         | `office.address`         | アイコン付きテキスト   | MapPin    | -              |
| サービス種別 | `office.serviceType`     | バッジ表示             | Building2 | -              |
| 開設日       | `office.establishedDate` | 日付形式               | Calendar  | -              |
| 管理者       | `office.managerName`     | テキスト               | UserCheck | 表示しない     |
| 事業所の説明 | `office.description`     | テキスト（複数行対応） | -         | 表示しない     |

#### サービス種別表示

```typescript
const getServiceTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'visiting-nursing': '訪問看護',
    'day-service': 'デイサービス',
    'home-help': '訪問介護',
    'care-management': '居宅介護支援',
    'group-home': 'グループホーム',
    rehabilitation: 'リハビリテーション',
  };
  return labels[type] || type;
};
```

### 連絡先情報セクション

| 項目名         | 表示データ           | 表示形式             | アイコン | 表示条件         |
| -------------- | -------------------- | -------------------- | -------- | ---------------- |
| 電話番号       | `office.phoneNumber` | アイコン付きテキスト | Phone    | 常時             |
| FAX番号        | `office.faxNumber`   | アイコン付きテキスト | Phone    | 存在する場合のみ |
| メールアドレス | `office.email`       | アイコン付きテキスト | Mail     | 存在する場合のみ |
| ウェブサイト   | `office.website`     | リンク付きテキスト   | Globe    | 存在する場合のみ |

### 営業時間セクション

| 曜日   | 表示形式                                        |
| ------ | ----------------------------------------------- |
| 月〜日 | "X曜日" + 営業時間（"09:00 - 18:00" or "休業"） |

#### 営業時間フォーマット関数

```typescript
const formatOperatingHours = (hours: any) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = ['月', '火', '水', '木', '金', '土', '日'];

  return days.map((day, index) => {
    const dayHours = hours[day];
    return {
      day: dayLabels[index],
      isOpen: dayHours.isOpen,
      time: dayHours.isOpen ? `${dayHours.openTime} - ${dayHours.closeTime}` : '休業',
    };
  });
};
```

### ステータス表示

| ステータス | 表示名   | バッジカラー                         |
| ---------- | -------- | ------------------------------------ |
| active     | 稼働中   | 緑色 (bg-green-100 text-green-800)   |
| inactive   | 停止中   | 灰色 (bg-gray-100 text-gray-800)     |
| suspended  | 一時停止 | 黄色 (bg-yellow-100 text-yellow-800) |

## 機能仕様

### アクション

| 項目名     | 処理内容             | 対象API | 遷移先画面                                      |
| ---------- | -------------------- | ------- | ----------------------------------------------- |
| 戻るボタン | 事業所一覧画面へ戻る | -       | 事業所一覧画面 (`/operation/offices`)           |
| 編集ボタン | 事業所編集画面へ遷移 | -       | 事業所編集画面 (`/operation/offices/[id]/edit`) |

### データ取得仕様

#### 初期データ読み込み

- **データ取得**: ページ読み込み時に事業所IDから詳細データを取得
- **useOffice フック**: 個別事業所データの取得と状態管理
- **ローディング管理**: データ取得中の適切なスケルトンローダー表示
- **エラーハンドリング**: データ取得失敗時の適切なエラー表示

#### データ取得フロー

1. **URLパラメータ解析**: `use(params)` でパスパラメータから事業所IDを取得
2. **API呼び出し**: `useOffice(id)` でデータ取得開始
3. **ローディング状態**: `loading` 状態でスケルトンローダー表示
4. **データ表示**: 取得成功時に詳細情報を表示
5. **エラー処理**: 取得失敗時にエラーメッセージ表示

### 状態管理

#### データ状態

- **office**: 取得した事業所データ（Office型 | null）
- **loading**: データ取得中の状態（boolean）
- **error**: エラーメッセージ（string | null）

### エラーハンドリング

#### データ取得エラー

```typescript
if (error || !office) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/operation/offices">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">事業所が見つかりません</h1>
          <p className="text-muted-foreground">
            指定された事業所は存在しないか、削除されています
          </p>
        </div>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">事業所の詳細を取得できませんでした</p>
          <Button asChild>
            <Link href="/operation/offices">事業所一覧に戻る</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

## コンポーネント構成

### 主要コンポーネント

- **OfficeDetailPage** (`app/(dashboard)/operation/offices/[id]/page.tsx`)
  - ページ全体の制御とレイアウト
  - 事業所データの取得と状態管理
  - ローディング・エラー状態の表示制御
  - 統計計算とデータ変換処理

### UI コンポーネント

- **Avatar関連** (`components/ui/avatar.tsx`)
  - Avatar, AvatarFallback
  - 事業所の視覚的識別子として使用

- **Card関連** (`components/ui/card.tsx`)
  - Card, CardContent, CardHeader, CardTitle
  - 情報セクションのコンテナとして使用

- **Button** (`components/ui/button.tsx`)
  - 戻るボタン、編集ボタンの実装
  - リンク機能付きボタン

- **Badge** (`components/ui/badge.tsx`)
  - ステータス・サービス種別表示用バッジ
  - バリアント対応

- **Skeleton** (`components/ui/skeleton.tsx`)
  - ローディング状態のスケルトン表示
  - 構造を保持したローディング体験

- **Separator** (`components/ui/separator.tsx`)
  - セクション間の視覚的分離

### アイコンコンポーネント

- **Lucide React アイコン**
  - ArrowLeft: 戻るボタンアイコン
  - Edit: 編集ボタンアイコン
  - UserCheck: 職員・管理者アイコン
  - Users: 利用者アイコン
  - Building2: 事業所・サービス種別アイコン
  - Calendar: 日付アイコン
  - MapPin: 住所アイコン
  - Phone: 電話・FAXアイコン
  - Mail: メールアドレスアイコン
  - Globe: ウェブサイトアイコン
  - Clock: 営業時間アイコン
  - AlertCircle: エラーアイコン

### カスタムフック

- **useOffice** (`hooks/use-offices.ts`)
  - 個別事業所データの取得と管理
  - ローディング・エラー状態の管理
  - データ再取得機能

### ユーティリティ関数

#### ステータスバッジ生成

```typescript
const getStatusBadge = (status: string) => {
  const variants = {
    active: { label: '稼働中', className: 'bg-green-100 text-green-800' },
    inactive: { label: '停止中', className: 'bg-gray-100 text-gray-800' },
    suspended: { label: '一時停止', className: 'bg-yellow-100 text-yellow-800' },
  };

  const config = variants[status as keyof typeof variants] || variants.active;
  return <Badge className={config.className}>{config.label}</Badge>;
};
```

## API仕様

### エンドポイント

| エンドポイント         | メソッド | 説明           |
| ---------------------- | -------- | -------------- |
| `/api/v1/offices/[id]` | GET      | 事業所詳細取得 |

### リクエスト仕様

- **パラメータ**: URL パラメータで事業所ID指定
- **認証**: JWTトークンによる認証必須
- **権限**: 運営者権限の確認

### レスポンス仕様

```typescript
interface OfficeDetailResponse {
  id: string;
  name: string;
  companyId: string;
  companyName: string;
  address: string;
  phoneNumber: string;
  faxNumber?: string;
  email?: string;
  website?: string;
  serviceType:
    | 'visiting-nursing'
    | 'day-service'
    | 'home-help'
    | 'care-management'
    | 'group-home'
    | 'rehabilitation';
  establishedDate?: string;
  capacity: number;
  currentUsers: number;
  staffCount: number;
  status: 'active' | 'inactive' | 'suspended';
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

### エラーレスポンス

| ステータスコード | 説明                 | メッセージ例                       |
| ---------------- | -------------------- | ---------------------------------- |
| 404              | 事業所が見つからない | "指定された事業所が見つかりません" |
| 401              | 認証エラー           | "認証が必要です"                   |
| 403              | アクセス権限なし     | "アクセス権限がありません"         |
| 500              | サーバーエラー       | "サーバーエラーが発生しました"     |

## UI/UX仕様

### レスポンシブデザイン

- **デスクトップ**: 4列の統計カード + 2列の情報カード表示
- **タブレット**: 1024px以下では2列の統計カード + 1列の情報カード
- **モバイル**: 768px以下では1列レイアウト

### アクセシビリティ

- **セマンティックHTML**: 適切なHTML要素の使用
- **ラベル関連付け**: 情報項目とラベルの適切な関連付け
- **キーボードナビゲーション**: Tab キーでの順次移動対応
- **スクリーンリーダー対応**: 適切なARIA属性設定
- **コントラスト比**: WCAG 2.1 AA準拠のコントラスト比

### インタラクション

#### 読み込み体験

- **スケルトンローダー**: コンテンツ構造を保持したローディング表示
- **段階的表示**: 統計カードから詳細情報への順次表示
- **プログレッシブエンハンスメント**: 基本情報から詳細情報への順次表示

#### 情報表示

- **階層的表示**: 重要度に応じた情報の階層化
- **視覚的グルーピング**: 関連情報のカード単位でのグループ化
- **アイコン活用**: 直感的な理解を支援するアイコン表示
- **データ視覚化**: 統計情報の分かりやすい数値表示

#### ナビゲーション

- **明確な導線**: 戻る・編集ボタンの分かりやすい配置
- **ブレッドクラム**: 現在位置の明確な表示
- **関連アクション**: 次に実行可能なアクションの提示

### カラーテーマ

- **shadcn/ui**: デフォルトテーマを使用
- **ステータス色**: 意味に応じたカラーコーディング
- **情報階層**: テキストカラーによる情報の重要度表現
- **アクセント色**: 重要な統計情報のアクセントカラー
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

### 計算最適化

- **稼働率計算**: クライアント側での効率的な計算処理
- **日付フォーマット**: 最適化された日付表示処理
- **営業時間変換**: 効率的なデータ変換処理

## セキュリティ仕様

### 認証・認可

- **JWT認証**: トークンベース認証
- **権限チェック**: 運営者権限の確認
- **事業所アクセス権限**: 表示対象事業所への適切なアクセス権限確認

### データ保護

- **HTTPS通信**: 暗号化通信の強制
- **機密情報保護**: 適切なデータマスキング
- **XSS対策**: Reactの自動エスケープ機能

### URL セキュリティ

- **パラメータ検証**: URLパラメータの適切な検証
- **不正アクセス防止**: 存在しない事業所IDでのアクセス制御
- **エラー情報制御**: 適切なエラーメッセージの表示

## 開発環境での動作

### モック機能

- **開発環境**: モックデータによる詳細情報表示
- **遅延シミュレーション**: 200msの遅延で実際のAPI通信を模擬
- **エラーテスト**: 意図的なエラー発生によるエラーハンドリングテスト

### テストデータ

開発環境では以下のモック事業所データを使用：

- **基本情報**: 事業所名、法人名、住所、サービス種別
- **統計情報**: 職員数、利用者数、定員、稼働率
- **連絡先情報**: 電話、FAX、メール、ウェブサイト
- **営業時間**: 曜日別の営業時間設定
- **管理者情報**: 事業所管理者データ

### テスト機能

- **データ表示テスト**: 各種事業所データでの表示確認
- **状態テスト**: ローディング・エラー状態の表示確認
- **計算テスト**: 稼働率等の計算処理確認
- **ナビゲーションテスト**: 各種リンクの動作確認
- **レスポンシブテスト**: 各種画面サイズでの表示確認

## 参考資料

- [CareBase-admin プロジェクト](https://github.com/ambi-tious/CareBase-admin)
- [事業所一覧画面](../README.md)
- [事業所編集画面](edit/README.md)
- [事業所登録画面](../register/README.md)
- [運営者画面一覧](../../../../docs/運営者.md)
- [useOffices フック](../../../../hooks/use-offices.ts)
- [Office 型定義](../../../../types/office.ts)
- [Office モックデータ](../../../../mocks/offices.ts)
- [shadcn/ui ドキュメント](https://ui.shadcn.com/)
- [Lucide React アイコン](https://lucide.dev/)
