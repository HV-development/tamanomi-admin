import { z } from 'zod';

export const GroupSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'グループ名は必須です'),
  description: z.string().optional(),
  color: z.string().optional(), // カラーコード（例: #FF5733）
  facilityId: z.string(), // 所属する事業所ID
  memberCount: z.number().default(0), // メンバー数
  teamCount: z.number().default(0), // 所属チーム数
  status: z.enum(['active', 'inactive']).default('active'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string(), // 作成者のユーザーID
});

export type Group = z.infer<typeof GroupSchema>;

// フォーム用の型（作成時に不要なフィールドを除外）
export const CreateGroupSchema = GroupSchema.omit({
  id: true,
  memberCount: true,
  teamCount: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateGroup = z.infer<typeof CreateGroupSchema>;

// 更新用の型（すべてオプショナル）
export const UpdateGroupSchema = GroupSchema.partial().omit({
  id: true,
  facilityId: true,
  memberCount: true,
  teamCount: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

export type UpdateGroup = z.infer<typeof UpdateGroupSchema>;

// グループ一覧表示用の拡張型
export const GroupWithDetailsSchema = GroupSchema.extend({
  teams: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        memberCount: z.number(),
      })
    )
    .optional(),
  recentActivity: z
    .object({
      lastUpdated: z.string().datetime(),
      updatedBy: z.string(),
    })
    .optional(),
});

export type GroupWithDetails = z.infer<typeof GroupWithDetailsSchema>;
