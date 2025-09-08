import { z } from 'zod';

export const operatingHoursSchema = z.object({
  isOpen: z.boolean(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
});

export const officeFormSchema = z.object({
  name: z.string().min(1, '事業所名は必須です').max(100, '事業所名は100文字以内で入力してください'),
  companyId: z.string().min(1, '法人を選択してください'),
  address: z.string().min(1, '住所は必須です').max(200, '住所は200文字以内で入力してください'),
  phoneNumber: z
    .string()
    .min(1, '電話番号は必須です')
    .regex(/^[\d-+()]+$/, '正しい電話番号を入力してください'),
  email: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      '正しいメールアドレスを入力してください'
    ),
  establishedDate: z
    .string()
    .min(1, '開設日は必須です')
    .refine((val) => !isNaN(Date.parse(val)), '有効な日付を入力してください'),
  capacity: z
    .number()
    .min(1, '定員は1以上で入力してください')
    .max(9999, '定員は9999以下で入力してください'),
  managerId: z.string().optional(),
  operatingHours: z.object({
    monday: operatingHoursSchema,
    tuesday: operatingHoursSchema,
    wednesday: operatingHoursSchema,
    thursday: operatingHoursSchema,
    friday: operatingHoursSchema,
    saturday: operatingHoursSchema,
    sunday: operatingHoursSchema,
  }),
  services: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  notes: z.string().max(1000, '備考は1000文字以内で入力してください').optional(),
});

// 作成用のスキーマ
export const createOfficeSchema = officeFormSchema;

// 更新用のスキーマ（すべてオプショナル）
export const updateOfficeSchema = officeFormSchema.partial();

// 編集用のスキーマ（必須項目は保持）
export const editOfficeSchema = z.object({
  name: z.string().min(1, '事業所名は必須です').max(100, '事業所名は100文字以内で入力してください'),
  companyId: z.string().min(1, '法人を選択してください'),
  address: z.string().min(1, '住所は必須です').max(200, '住所は200文字以内で入力してください'),
  phoneNumber: z
    .string()
    .min(1, '電話番号は必須です')
    .regex(/^[\d-+()]+$/, '正しい電話番号を入力してください'),
  faxNumber: z.string().optional(),
  email: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      '正しいメールアドレスを入力してください'
    ),
  website: z.string().optional(),
  serviceType: z.enum([
    'visiting-nursing',
    'day-service',
    'home-help',
    'care-management',
    'group-home',
    'rehabilitation',
  ]),
  establishedDate: z
    .string()
    .min(1, '開設日は必須です')
    .refine((val) => !isNaN(Date.parse(val)), '有効な日付を入力してください'),
  capacity: z
    .number()
    .min(1, '定員は1以上で入力してください')
    .max(9999, '定員は9999以下で入力してください'),
  operatingHours: z.object({
    monday: operatingHoursSchema,
    tuesday: operatingHoursSchema,
    wednesday: operatingHoursSchema,
    thursday: operatingHoursSchema,
    friday: operatingHoursSchema,
    saturday: operatingHoursSchema,
    sunday: operatingHoursSchema,
  }),
  description: z.string().max(1000, '説明は1000文字以内で入力してください').optional(),
  managerId: z.string().optional(),
});
