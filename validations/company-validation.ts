import { z } from 'zod';

export const companyFormSchema = z.object({
  name: z.string().min(1, '会社名は必須です').max(100, '会社名は100文字以内で入力してください'),
  nameKana: z
    .string()
    .min(1, '会社名（カナ）は必須です')
    .max(100, '会社名（カナ）は100文字以内で入力してください')
    .regex(/^[ァ-ヶー\s]+$/, 'カタカナで入力してください'),
  corporateNumber: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{13}$/.test(val), '法人番号は13桁の数字で入力してください'),
  address: z.string().min(1, '住所は必須です').max(200, '住所は200文字以内で入力してください'),
  phoneNumber: z
    .string()
    .min(1, '電話番号は必須です')
    .regex(/^[\d-+()]+$/, '正しい電話番号を入力してください'),
  email: z
    .string()
    .min(1, 'メールアドレスは必須です')
    .email('有効なメールアドレスを入力してください'),
  representativeName: z
    .string()
    .min(1, '代表者名は必須です')
    .max(50, '代表者名は50文字以内で入力してください'),
  representativePosition: z.string().max(50, '役職は50文字以内で入力してください').optional(),
  businessType: z
    .string()
    .min(1, '事業種別は必須です')
    .max(100, '事業種別は100文字以内で入力してください'),
  establishedDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), '有効な日付を入力してください'),
  capital: z.string().max(50, '資本金は50文字以内で入力してください').optional(),
  employeeCount: z
    .number()
    .optional()
    .refine((val) => !val || val > 0, '従業員数は1以上で入力してください'),
  notes: z.string().max(1000, '備考は1000文字以内で入力してください').optional(),
});

// 作成用のスキーマ（ID、作成日時、更新日時を除外）
export const createCompanySchema = companyFormSchema;

// 更新用のスキーマ（すべてオプショナル）
export const updateCompanySchema = companyFormSchema.partial();

// 編集用のスキーマ（必須項目は保持）
export const editCompanySchema = z.object({
  name: z.string().min(1, '会社名は必須です').max(100, '会社名は100文字以内で入力してください'),
  nameKana: z
    .string()
    .min(1, '会社名（カナ）は必須です')
    .max(100, '会社名（カナ）は100文字以内で入力してください')
    .regex(/^[ァ-ヶー\s]+$/, 'カタカナで入力してください'),
  corporateNumber: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{13}$/.test(val), '法人番号は13桁の数字で入力してください'),
  address: z.string().min(1, '住所は必須です').max(200, '住所は200文字以内で入力してください'),
  phoneNumber: z
    .string()
    .min(1, '電話番号は必須です')
    .regex(/^[\d-+()]+$/, '正しい電話番号を入力してください'),
  email: z
    .string()
    .min(1, 'メールアドレスは必須です')
    .email('有効なメールアドレスを入力してください'),
  representativeName: z
    .string()
    .min(1, '代表者名は必須です')
    .max(50, '代表者名は50文字以内で入力してください'),
  representativePosition: z.string().max(50, '役職は50文字以内で入力してください').optional(),
  businessType: z
    .string()
    .min(1, '事業種別は必須です')
    .max(100, '事業種別は100文字以内で入力してください'),
  establishedDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), '有効な日付を入力してください'),
  capital: z.string().max(50, '資本金は50文字以内で入力してください').optional(),
  employeeCount: z
    .number()
    .optional()
    .refine((val) => !val || val > 0, '従業員数は1以上で入力してください'),
  notes: z.string().max(1000, '備考は1000文字以内で入力してください').optional(),
});
