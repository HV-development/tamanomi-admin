// 管理者関連の型定義
export interface Admin {
  id: string;
  name: string;
  nameKana: string;
  email: string;
  department?: string;
  phoneNumber: string;
  status: AdminStatus;
  notes?: string;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AdminStatus = 'active' | 'inactive' | 'suspended';

// 作成用の型（ID、作成日時、更新日時を除外）
export interface CreateAdmin {
  name: string;
  nameKana: string;
  email: string;
  department?: string;
  phoneNumber: string;
  status?: AdminStatus;
  notes?: string;
}

// 更新用の型（すべてオプショナル）
export interface UpdateAdmin {
  name?: string;
  nameKana?: string;
  email?: string;
  department?: string;
  phoneNumber?: string;
  status?: AdminStatus;
  notes?: string;
}

// フィルター用の型
export interface AdminFilters {
  search?: string;
  status?: AdminStatus | 'all';
  department?: string;
}

// フォーム用の型定義（バリデーションで使用される型と対応）
export interface AdminFormData {
  name: string;
  nameKana: string;
  email: string;
  department?: string;
  phoneNumber: string;
  status?: AdminStatus;
  notes?: string;
}

// 運営管理者登録レスポンス用の型
export interface AdminRegistrationResponse {
  admin: Admin;
  temporaryPassword: string;
}
