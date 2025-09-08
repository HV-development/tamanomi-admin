import { z } from 'zod';

// 職員フォームのバリデーション
export const staffFormSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(50, '名前は50文字以内で入力してください'),
  nameKana: z
    .string()
    .min(1, 'フリガナは必須です')
    .max(50, 'フリガナは50文字以内で入力してください')
    .regex(/^[ァ-ヶー\s]+$/, 'カタカナで入力してください'),
  email: z
    .string()
    .min(1, 'メールアドレスは必須です')
    .email('有効なメールアドレスを入力してください'),
  phoneNumber: z
    .string()
    .min(1, '電話番号は必須です')
    .regex(/^[\d-+()]+$/, '正しい電話番号を入力してください'),
  role: z.enum(
    [
      'nurse',
      'care-worker',
      'physical-therapist',
      'occupational-therapist',
      'speech-therapist',
      'social-worker',
      'nutritionist',
      'admin',
      'other',
    ],
    {
      errorMap: () => ({ message: '職種を選択してください' }),
    }
  ),
  position: z.string().max(50, '役職は50文字以内で入力してください').optional(),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'temporary'], {
    errorMap: () => ({ message: '雇用形態を選択してください' }),
  }),
  qualifications: z.array(z.string()).optional(),
  hireDate: z
    .string()
    .min(1, '入職日は必須です')
    .refine((val) => !isNaN(Date.parse(val)), '有効な日付を入力してください'),
  status: z
    .enum(['active', 'inactive', 'on-leave', 'terminated'], {
      errorMap: () => ({ message: 'ステータスを選択してください' }),
    })
    .default('active'),
  notes: z.string().max(500, '備考は500文字以内で入力してください').optional(),
});

// 作成用のスキーマ
export const createStaffSchema = staffFormSchema;

// 編集用のスキーマ
export const editStaffSchema = staffFormSchema;

// 型定義
export type StaffFormData = z.infer<typeof staffFormSchema>;
export type CreateStaffData = z.infer<typeof createStaffSchema>;
export type EditStaffData = z.infer<typeof editStaffSchema>;
