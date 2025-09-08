import { z } from 'zod';

// 利用者フォームのバリデーション
export const userFormSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(50, '名前は50文字以内で入力してください'),
  nameKana: z
    .string()
    .min(1, 'フリガナは必須です')
    .max(50, 'フリガナは50文字以内で入力してください')
    .regex(/^[ァ-ヶー\s]+$/, 'カタカナで入力してください'),
  birthDate: z
    .string()
    .min(1, '生年月日は必須です')
    .refine((val) => !isNaN(Date.parse(val)), '有効な日付を入力してください')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      return birthDate <= today;
    }, '未来の日付は選択できません'),
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: '性別を選択してください' }),
  }),
  age: z
    .number()
    .min(0, '年齢は0以上で入力してください')
    .max(120, '年齢は120以下で入力してください'),
  phoneNumber: z
    .string()
    .optional()
    .refine((val) => !val || /^[\d-+()]+$/.test(val), '正しい電話番号を入力してください'),
  address: z.string().max(200, '住所は200文字以内で入力してください').optional(),
  careLevel: z
    .enum(['support1', 'support2', 'care1', 'care2', 'care3', 'care4', 'care5'])
    .optional(),
  insuranceNumber: z
    .string()
    .min(1, '保険証番号は必須です')
    .max(20, '保険証番号は20文字以内で入力してください'),
  startDate: z
    .string()
    .min(1, '利用開始日は必須です')
    .refine((val) => !isNaN(Date.parse(val)), '有効な日付を入力してください'),
  status: z
    .enum(['active', 'inactive', 'discharged', 'deceased'], {
      errorMap: () => ({ message: 'ステータスを選択してください' }),
    })
    .default('active'),
  emergencyContact: z.object({
    name: z
      .string()
      .min(1, '緊急連絡先の氏名は必須です')
      .max(50, '氏名は50文字以内で入力してください'),
    relationship: z.string().min(1, '続柄は必須です').max(20, '続柄は20文字以内で入力してください'),
    phoneNumber: z
      .string()
      .min(1, '緊急連絡先の電話番号は必須です')
      .regex(/^[\d-+()]+$/, '正しい電話番号を入力してください'),
    address: z.string().max(200, '住所は200文字以内で入力してください').optional(),
  }),
  medicalHistory: z.string().max(1000, '医療情報は1000文字以内で入力してください').optional(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  notes: z.string().max(500, '備考は500文字以内で入力してください').optional(),
});

// 作成用のスキーマ
export const createUserSchema = userFormSchema;

// 編集用のスキーマ
export const editUserSchema = userFormSchema;

// 型定義
export type UserFormData = z.infer<typeof userFormSchema>;
export type CreateUserData = z.infer<typeof createUserSchema>;
export type EditUserData = z.infer<typeof editUserSchema>;
