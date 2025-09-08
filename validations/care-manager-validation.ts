import { z } from 'zod';

// ケアマネージャーフォームのバリデーション
export const careManagerFormSchema = z.object({
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
  licenseNumber: z
    .string()
    .min(1, '介護支援専門員証番号は必須です')
    .max(20, '介護支援専門員証番号は20文字以内で入力してください'),
  licenseExpiryDate: z
    .string()
    .min(1, '資格有効期限は必須です')
    .refine((val) => !isNaN(Date.parse(val)), '有効な日付を入力してください'),
  officeId: z.string().optional(),
  specializations: z.array(z.string()).optional(),
  experience: z
    .number()
    .optional()
    .refine((val) => !val || val >= 0, '経験年数は0以上で入力してください'),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  notes: z.string().optional().max(1000, '備考は1000文字以内で入力してください'),
});

// 作成用のスキーマ
export const createCareManagerSchema = careManagerFormSchema;

// 編集用のスキーマ
export const editCareManagerSchema = careManagerFormSchema;
