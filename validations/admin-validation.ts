import { z } from 'zod';

// 管理者フォームのバリデーション
export const adminFormSchema = z.object({
  name: z.string().min(1, '氏名は必須です').max(50, '氏名は50文字以内で入力してください'),
  nameKana: z
    .string()
    .min(1, 'フリガナは必須です')
    .max(50, 'フリガナは50文字以内で入力してください')
    .regex(/^[ァ-ヶー\s]+$/, 'カタカナで入力してください'),
  email: z
    .string()
    .min(1, 'メールアドレスは必須です')
    .email('正しいメールアドレスを入力してください'),
  phoneNumber: z
    .string()
    .min(1, '電話番号は必須です')
    .regex(/^[0-9-]+$/, '正しい電話番号を入力してください'),
  status: z.enum(['active', 'inactive'], {
    errorMap: () => ({ message: 'ステータスを選択してください' }),
  }),
  department: z.string().max(50, '部署は50文字以内で入力してください').optional(),
  notes: z.string().max(500, '備考は500文字以内で入力してください').optional(),
});

export type AdminFormData = z.infer<typeof adminFormSchema>;

// 作成用のスキーマ
export const createAdminSchema = adminFormSchema;

// 編集用のスキーマ
export const editAdminSchema = adminFormSchema;
