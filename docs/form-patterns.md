# React Hook Form + Zod フォームパターン実装ガイド

## 概要

CareBase Adminプロジェクトでは、すべてのフォームでReact Hook FormとZodを使用した統一的なパターンを採用しています。これにより、型安全性、バリデーション、エラーハンドリングの一貫性を保っています。

## 技術スタック

- **React Hook Form**: フォーム状態管理
- **Zod**: スキーマバリデーション
- **@hookform/resolvers/zod**: ZodとReact Hook Formの統合
- **shadcn/ui**: UIコンポーネント

## 実装パターン

### 1. バリデーションスキーマの定義

```typescript
// validations/example-validation.ts
import { z } from 'zod';

export const exampleFormSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(50, '名前は50文字以内で入力してください'),
  email: z
    .string()
    .min(1, 'メールアドレスは必須です')
    .email('有効なメールアドレスを入力してください'),
  age: z.number().min(18, '18歳以上で入力してください').max(120, '有効な年齢を入力してください'),
});

export type ExampleFormData = z.infer<typeof exampleFormSchema>;

// 作成用のスキーマ
export const createExampleSchema = exampleFormSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateExampleFormData = z.infer<typeof createExampleSchema>;
```

### 2. 共通フォームフィールドコンポーネント

```typescript
// components/2_molecules/forms/form-field.tsx
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';

// 入力フィールド
export function InputField<T extends Record<string, any>>({
  name,
  label,
  required = false,
  ...props
}: InputFieldProps<T>) {
  const form = useFormContext<T>();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel className={required && 'after:content-["*"] after:text-red-500 after:ml-1'}>
            {label}
          </FormLabel>
          <FormControl>
            <input {...field} {...props} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
```

### 3. 統合フォームコンポーネントの実装

作成と編集の両方に対応した統合フォームコンポーネントの実装パターン：

```typescript
// components/2_molecules/forms/example-form.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { InputField, SelectField } from './form-field';
import {
  createExampleSchema,
  editExampleSchema,
  type CreateExampleFormData,
  type EditExampleFormData
} from '@/validations/example-validation';
import { useEffect } from 'react';

// 共通のフォームデータ型
type ExampleFormData = CreateExampleFormData | EditExampleFormData;

interface ExampleFormProps {
  // 編集モードの場合は既存データを渡す
  initialData?: ExampleEntity;
  onSubmit: (data: ExampleFormData) => Promise<void>;
  loading?: boolean;
  mode?: 'create' | 'edit';
  submitLabel?: string;
}

export function ExampleForm({
  initialData,
  onSubmit,
  loading,
  mode = 'create',
  submitLabel
}: ExampleFormProps) {
  // モードに応じてスキーマを選択
  const schema = mode === 'edit' ? editExampleSchema : createExampleSchema;
  const defaultSubmitLabel = mode === 'edit' ? '更新' : '登録';

  const form = useForm<ExampleFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      age: 18,
    },
  });

  // 編集モードで初期データが変更されたらフォームを更新
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      form.reset({
        name: initialData.name,
        email: initialData.email,
        age: initialData.age,
      });
    }
  }, [initialData, form, mode]);

  const handleSubmit = async (data: ExampleFormData) => {
    try {
      await onSubmit(data);
      if (mode === 'create') {
        form.reset();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <InputField name="name" label="名前" required placeholder="山田太郎" />
        <InputField name="email" label="メールアドレス" required type="email" placeholder="yamada@example.com" />
        <InputField name="age" label="年齢" required type="number" min="18" max="120" />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={loading}
          >
            リセット
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? '処理中...' : (submitLabel || defaultSubmitLabel)}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

### 4. ページでの使用

**作成ページ**

```typescript
// app/example/create/page.tsx
export default function CreateExamplePage() {
  const handleSubmit = async (data: CreateExampleFormData) => {
    // 作成処理
  };

  return (
    <ExampleForm
      mode="create"
      onSubmit={handleSubmit}
      submitLabel="作成する"
    />
  );
}
```

**編集ページ**

```typescript
// app/example/[id]/edit/page.tsx
export default function EditExamplePage({ params }) {
  const { example } = useExample(params.id);

  const handleSubmit = async (data: EditExampleFormData) => {
    // 更新処理
  };

  return (
    <ExampleForm
      mode="edit"
      initialData={example}
      onSubmit={handleSubmit}
      submitLabel="更新する"
    />
  );
}
```

## フォーム共通化のメリット

### 1. コードの重複削減

- 作成と編集で別々のコンポーネントを作る必要がない
- 同じUIロジックを2回書く必要がない
- メンテナンスが容易

### 2. 一貫性の確保

- 作成と編集で同じフィールドレイアウト
- 同じバリデーションルール
- 同じユーザー体験

### 3. 保守性の向上

- フィールドの追加・変更が1箇所で済む
- バグ修正も1箇所で完了
- テストも1つのコンポーネントに集約

## ベストプラクティス

### 1. 型安全性の確保

- すべてのフォームデータにZodスキーマを定義
- `any`型の使用は禁止
- 適切な型変換とバリデーション
- モードに応じた適切なスキーマ選択

### 2. エラーハンドリング

- 統一的なエラーメッセージ表示
- フォーム送信エラーの適切な処理
- ユーザーフレンドリーなエラー表示

### 3. パフォーマンス

- 不要な再レンダリングの回避
- 適切なメモ化の使用
- フォーム状態の効率的な管理

### 4. アクセシビリティ

- 適切なラベルとエラー表示
- キーボードナビゲーション対応
- スクリーンリーダー対応

## 禁止事項

❌ **避けるべきパターン**

```typescript
// 悪い例：手動バリデーション
const [errors, setErrors] = useState({});
const validateForm = () => {
  if (!formData.name) {
    setErrors(prev => ({ ...prev, name: '名前は必須です' }));
  }
};

// 悪い例：useStateでのフォーム管理
const [formData, setFormData] = useState({
  name: '',
  email: '',
});

// 悪い例：型定義なし
const handleSubmit = (data: any) => {
  // 処理
};

// 悪い例：Zodでのoptional().max()の順序
notes: z.string()
  .optional()  // ❌ optional()の後にmax()は使えない
  .max(1000, 'エラーメッセージ'),

// 悪い例：undefinedから値への変更（制御されていない→制御されたinput）
defaultValues: {
  name: undefined,  // ❌ undefinedは避ける
  count: undefined, // ❌ 数値フィールドでも避ける
}
```

✅ **推奨パターン**

```typescript
// 良い例：React Hook Form + Zod
const form = useForm<ExampleFormData>({
  resolver: zodResolver(exampleSchema),
  defaultValues: { name: '', email: '' },
});

// 良い例：型安全なデータ処理
const handleSubmit = async (data: CreateExampleFormData) => {
  // 処理
};

// 良い例：Zodでのoptional()フィールドの正しい順序
notes: z.string()
  .max(1000, 'エラーメッセージ')  // ✅ バリデーションを先に
  .optional(),                    // ✅ optional()は最後に

// または
notes: z.optional(z.string().max(1000, 'エラーメッセージ')),  // ✅ z.optional()でラップ

// 良い例：適切なdefaultValues
defaultValues: {
  name: '',        // ✅ 文字列フィールドは空文字
  count: 0,        // ✅ 数値フィールドは0またはデフォルト値
  status: 'active', // ✅ enumフィールドはデフォルト値
}

// 良い例：フィールドでの値の安全な処理
value={field.value ?? ''}  // ✅ nullish coalescingで安全な値を保証
```

## Next.js 15対応

### paramsアクセスの変更

Next.js 15では、動的ルートの`params`が非同期になりました：

```typescript
// ❌ 旧形式（Next.js 14以前）
interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  const id = params.id; // 直接アクセス
}

// ✅ 新形式（Next.js 15以降）
import { use } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  const { id } = use(params); // React.use()でunwrap
}
```

## 既存フォームの移行手順

1. **バリデーションスキーマの作成**: `validations/`ディレクトリにZodスキーマを定義
2. **フォームコンポーネントの作成**: 共通フォームフィールドを使用したコンポーネントを作成
3. **ページの更新**: 新しいフォームコンポーネントを使用するようにページを更新
4. **Next.js 15対応**: `params`アクセスを`React.use()`に変更
5. **テスト**: 動作確認とエラーケースのテスト

## 実装済みフォーム一覧

### ✅ 移行完了

- **認証関連フォーム**
  - ログインフォーム (`components/2_molecules/forms/login-form.tsx`)
  - パスワードリセット要求フォーム (`components/2_molecules/forms/request-password-reset-form.tsx`)
  - パスワードリセットフォーム (`components/2_molecules/forms/reset-password-form.tsx`)

- **会社管理フォーム**
  - 統合フォーム (`components/2_molecules/forms/company-form.tsx`) - 作成・編集両対応

- **事業所管理フォーム**
  - 統合フォーム (`components/2_molecules/forms/office-form.tsx`) - 作成・編集両対応

### 📋 バリデーションスキーマ

- **認証**: `validations/auth-validation.ts`
- **会社**: `validations/company-validation.ts`
- **事業所**: `validations/office-validation.ts`
- **管理者**: `validations/admin-validation.ts` (準備済み)
- **ケアマネージャー**: `validations/care-manager-validation.ts` (準備済み)

### 🔧 共通コンポーネント

- **フォームフィールド**: `components/2_molecules/forms/form-field.tsx`
  - InputField
  - TextareaField
  - SelectField
  - FormFieldComponent

## まとめ

React Hook Form + Zodパターンの採用により、以下のメリットを実現しています：

- **型安全性**: TypeScriptとの完全な統合
- **一貫性**: 統一的なバリデーションとエラーハンドリング
- **保守性**: 再利用可能なコンポーネントとスキーマ
- **開発効率**: 自動補完とエラー検出
- **ユーザー体験**: 適切なバリデーションとエラー表示

プロジェクト内のすべての主要フォームが統一的なパターンに移行されました。今後新しいフォームを追加する際は、このパターンに従って実装してください。
