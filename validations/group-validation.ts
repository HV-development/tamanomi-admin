import { z } from 'zod';

export const groupFormSchema = z.object({
  name: z
    .string()
    .min(1, 'グループ名は必須です')
    .max(50, 'グループ名は50文字以内で入力してください'),
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
  facilityId: z.string().min(1, '事業所の選択は必須です'),
  status: z.enum(['active', 'inactive'], {
    errorMap: () => ({ message: 'ステータスを選択してください' }),
  }),
  createdBy: z.string().min(1, '作成者の指定は必須です'),
});

export type GroupFormData = z.infer<typeof groupFormSchema>;

// グループ検索用のバリデーション
export const groupSearchSchema = z.object({
  query: z.string().optional(),
  status: z.enum(['all', 'active', 'inactive']).default('all'),
  facilityId: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'memberCount', 'teamCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type GroupSearchParams = z.infer<typeof groupSearchSchema>;

// グループ更新用のバリデーション
export const updateGroupSchema = groupFormSchema.partial().omit({
  facilityId: true,
  createdBy: true,
});

export type UpdateGroupData = z.infer<typeof updateGroupSchema>;
