import { z } from 'zod';

export const teamFormSchema = z.object({
  name: z.string().min(1, 'チーム名は必須です').max(50, 'チーム名は50文字以内で入力してください'),
  description: z
    .string()
    .max(200, '説明は200文字以内で入力してください')
    .optional()
    .or(z.literal('')),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, '有効なカラーコードを入力してください（例: #FF5733）')
    .optional()
    .or(z.literal('')),
  groupId: z.string().min(1, 'グループの選択は必須です'),
  facilityId: z.string().min(1, '事業所の選択は必須です'),
  status: z.enum(['active', 'inactive'], {
    errorMap: () => ({ message: 'ステータスを選択してください' }),
  }),
  createdBy: z.string().min(1, '作成者の指定は必須です'),
});

export type TeamFormData = z.infer<typeof teamFormSchema>;

// チーム検索用のバリデーション
export const teamSearchSchema = z.object({
  query: z.string().optional(),
  status: z.enum(['all', 'active', 'inactive']).default('all'),
  groupId: z.string().optional(),
  facilityId: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'memberCount', 'groupName']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type TeamSearchParams = z.infer<typeof teamSearchSchema>;

// チーム更新用のバリデーション
export const updateTeamSchema = teamFormSchema.partial().omit({
  groupId: true,
  facilityId: true,
  createdBy: true,
});

export type UpdateTeamData = z.infer<typeof updateTeamSchema>;
