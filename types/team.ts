import { z } from 'zod';

export const TeamSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'チーム名は必須です'),
  description: z.string().optional(),
  color: z.string().optional(), // カラーコード（例: #FF5733）
  groupId: z.string(), // 所属するグループID
  facilityId: z.string(), // 所属する事業所ID
  memberCount: z.number().default(0), // メンバー数
  status: z.enum(['active', 'inactive']).default('active'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string(), // 作成者のユーザーID
});

export type Team = z.infer<typeof TeamSchema>;

// フォーム用の型（作成時に不要なフィールドを除外）
export const CreateTeamSchema = TeamSchema.omit({
  id: true,
  memberCount: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateTeam = z.infer<typeof CreateTeamSchema>;

// 更新用の型（すべてオプショナル）
export const UpdateTeamSchema = TeamSchema.partial().omit({
  id: true,
  groupId: true,
  facilityId: true,
  memberCount: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

export type UpdateTeam = z.infer<typeof UpdateTeamSchema>;

// チーム一覧表示用の拡張型
export const TeamWithDetailsSchema = TeamSchema.extend({
  groupName: z.string().optional(), // 所属グループ名
  members: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        role: z.string(),
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

export type TeamWithDetails = z.infer<typeof TeamWithDetailsSchema>;
