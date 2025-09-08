// ケアマネージャー関連の型定義
export interface CareManager {
  id: string;
  name: string;
  nameKana: string;
  email: string;
  phoneNumber: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  officeId?: string;
  officeName?: string;
  specializations?: string[];
  experience?: number;
  status: CareManagerStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CareManagerStatus = 'active' | 'inactive' | 'suspended';

// 作成用の型（ID、作成日時、更新日時を除外）
export interface CreateCareManager {
  name: string;
  nameKana: string;
  email: string;
  phoneNumber: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  officeId?: string;
  specializations?: string[];
  experience?: number;
  status?: CareManagerStatus;
  notes?: string;
}

// 更新用の型（すべてオプショナル）
export interface UpdateCareManager {
  name?: string;
  nameKana?: string;
  email?: string;
  phoneNumber?: string;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  officeId?: string;
  specializations?: string[];
  experience?: number;
  status?: CareManagerStatus;
  notes?: string;
}

// フィルター用の型
export interface CareManagerFilters {
  search?: string;
  status?: CareManagerStatus | 'all';
  officeId?: string;
  specialization?: string;
  experienceMin?: number;
  experienceMax?: number;
}

// 専門分野の定数
export const CARE_MANAGER_SPECIALIZATIONS = [
  'dementia',
  'rehabilitation',
  'medical',
  'mental_health',
  'disability',
  'elderly_care',
] as const;

export type CareManagerSpecialization = (typeof CARE_MANAGER_SPECIALIZATIONS)[number];

// フォーム用の型定義（バリデーションで使用される型と対応）
export interface CareManagerFormData {
  name: string;
  nameKana: string;
  email: string;
  phoneNumber: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  officeId?: string;
  specializations?: string[];
  experience?: number;
  status?: CareManagerStatus;
  notes?: string;
}
