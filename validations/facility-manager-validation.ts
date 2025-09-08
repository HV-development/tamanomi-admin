import { z } from 'zod';

// 事業所管理者フォームのバリデーション
export const facilityManagerFormSchema = z.object({
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
  position: z.string().max(50, '役職は50文字以内で入力してください').optional(),
  status: z
    .enum(['active', 'inactive', 'suspended'], {
      errorMap: () => ({ message: 'ステータスを選択してください' }),
    })
    .default('active'),
  notes: z.string().max(500, '備考は500文字以内で入力してください').optional(),
});

// 事業所と管理者の同時登録用スキーマ
export const officeWithManagerSchema = z.object({
  // 事業所情報
  office: z.object({
    name: z
      .string()
      .min(1, '事業所名は必須です')
      .max(100, '事業所名は100文字以内で入力してください'),
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
    description: z.string().max(1000, '説明は1000文字以内で入力してください').optional(),
    operatingHours: z.object({
      monday: z.object({
        isOpen: z.boolean(),
        openTime: z.string().optional(),
        closeTime: z.string().optional(),
      }),
      tuesday: z.object({
        isOpen: z.boolean(),
        openTime: z.string().optional(),
        closeTime: z.string().optional(),
      }),
      wednesday: z.object({
        isOpen: z.boolean(),
        openTime: z.string().optional(),
        closeTime: z.string().optional(),
      }),
      thursday: z.object({
        isOpen: z.boolean(),
        openTime: z.string().optional(),
        closeTime: z.string().optional(),
      }),
      friday: z.object({
        isOpen: z.boolean(),
        openTime: z.string().optional(),
        closeTime: z.string().optional(),
      }),
      saturday: z.object({
        isOpen: z.boolean(),
        openTime: z.string().optional(),
        closeTime: z.string().optional(),
      }),
      sunday: z.object({
        isOpen: z.boolean(),
        openTime: z.string().optional(),
        closeTime: z.string().optional(),
      }),
    }),
    services: z.array(z.string()).optional(),
    notes: z.string().max(1000, '備考は1000文字以内で入力してください').optional(),
  }),
  // 管理者情報
  manager: facilityManagerFormSchema,
});

// 作成用のスキーマ
export const createFacilityManagerSchema = facilityManagerFormSchema;

// 編集用のスキーマ
export const editFacilityManagerSchema = facilityManagerFormSchema;

// 型定義
export type FacilityManagerFormData = z.infer<typeof facilityManagerFormSchema>;
export type OfficeWithManagerFormData = z.infer<typeof officeWithManagerSchema>;
export type CreateFacilityManagerData = z.infer<typeof createFacilityManagerSchema>;
export type EditFacilityManagerData = z.infer<typeof editFacilityManagerSchema>;
