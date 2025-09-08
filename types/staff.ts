// 職員関連の型定義
export interface Staff {
  id: string;
  name: string;
  nameKana: string;
  email: string;
  phoneNumber: string;
  officeId: string;
  officeName?: string;
  role: StaffRole;
  position?: string;
  employmentType: EmploymentType;
  hireDate: string;
  status: StaffStatus;
  qualifications: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type StaffRole =
  | 'nurse'
  | 'care-worker'
  | 'physical-therapist'
  | 'occupational-therapist'
  | 'speech-therapist'
  | 'social-worker'
  | 'nutritionist'
  | 'admin'
  | 'other';

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'temporary';

export type StaffStatus = 'active' | 'inactive' | 'on-leave' | 'terminated';

// 作成用の型（ID、作成日時、更新日時を除外）
export interface CreateStaff {
  name: string;
  nameKana: string;
  email: string;
  phoneNumber: string;
  officeId: string;
  role: StaffRole;
  position?: string;
  employmentType: EmploymentType;
  hireDate: string;
  status?: StaffStatus;
  qualifications?: string[];
  notes?: string;
}

// 更新用の型（すべてオプショナル）
export interface UpdateStaff {
  name?: string;
  nameKana?: string;
  email?: string;
  phoneNumber?: string;
  officeId?: string;
  role?: StaffRole;
  position?: string;
  employmentType?: EmploymentType;
  hireDate?: string;
  status?: StaffStatus;
  qualifications?: string[];
  notes?: string;
}

// フィルター用の型
export interface StaffFilters {
  search?: string;
  role?: StaffRole | 'all';
  status?: StaffStatus | 'all';
  officeId?: string;
  employmentType?: EmploymentType | 'all';
}

// フォーム用の型定義
export interface StaffFormData {
  name: string;
  nameKana: string;
  email: string;
  phoneNumber: string;
  role: StaffRole;
  position?: string;
  employmentType: EmploymentType;
  hireDate: string;
  qualifications?: string[];
  notes?: string;
}
