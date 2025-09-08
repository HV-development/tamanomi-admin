// 利用者関連の型定義
export interface User {
  id: string;
  name: string;
  nameKana: string;
  birthDate: string;
  age: number;
  gender: Gender;
  phoneNumber?: string;
  emergencyContact: EmergencyContact;
  address: string;
  officeId: string;
  officeName?: string;
  careLevel?: CareLevel;
  insuranceNumber: string;
  medicalHistory?: string;
  allergies?: string[];
  medications?: string[];
  status: UserStatus;
  startDate: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type Gender = 'male' | 'female' | 'other';

export type CareLevel = 'support1' | 'support2' | 'care1' | 'care2' | 'care3' | 'care4' | 'care5';

export type UserStatus = 'active' | 'inactive' | 'discharged' | 'deceased';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  address?: string;
}

// 作成用の型（ID、作成日時、更新日時を除外）
export interface CreateUser {
  name: string;
  nameKana: string;
  birthDate: string;
  gender: Gender;
  phoneNumber?: string;
  emergencyContact: EmergencyContact;
  address: string;
  officeId: string;
  careLevel?: CareLevel;
  insuranceNumber: string;
  medicalHistory?: string;
  allergies?: string[];
  medications?: string[];
  status?: UserStatus;
  startDate: string;
  notes?: string;
}

// 更新用の型（すべてオプショナル）
export interface UpdateUser {
  name?: string;
  nameKana?: string;
  birthDate?: string;
  gender?: Gender;
  phoneNumber?: string;
  emergencyContact?: EmergencyContact;
  address?: string;
  officeId?: string;
  careLevel?: CareLevel;
  insuranceNumber?: string;
  medicalHistory?: string;
  allergies?: string[];
  medications?: string[];
  status?: UserStatus;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

// フィルター用の型
export interface UserFilters {
  search?: string;
  careLevel?: CareLevel | 'all';
  status?: UserStatus | 'all';
  officeId?: string;
  gender?: Gender | 'all';
  ageRange?: {
    min?: number;
    max?: number;
  };
}

// フォーム用の型定義
export interface UserFormData {
  name: string;
  nameKana: string;
  birthDate: string;
  gender: Gender;
  phoneNumber?: string;
  emergencyContact: EmergencyContact;
  address: string;
  careLevel?: CareLevel;
  insuranceNumber: string;
  medicalHistory?: string;
  allergies?: string[];
  medications?: string[];
  startDate: string;
  notes?: string;
}
