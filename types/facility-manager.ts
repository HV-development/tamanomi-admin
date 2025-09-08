// 事業所管理者関連の型定義
export interface FacilityManager {
  id: string;
  name: string;
  nameKana: string;
  email: string;
  phoneNumber: string;
  officeId: string;
  officeName?: string;
  position?: string;
  status: FacilityManagerStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type FacilityManagerStatus = 'active' | 'inactive' | 'suspended';

// 作成用の型（ID、作成日時、更新日時を除外）
export interface CreateFacilityManager {
  name: string;
  nameKana: string;
  email: string;
  phoneNumber: string;
  officeId: string;
  position?: string;
  status?: FacilityManagerStatus;
  notes?: string;
}

// 更新用の型（すべてオプショナル）
export interface UpdateFacilityManager {
  name?: string;
  nameKana?: string;
  email?: string;
  phoneNumber?: string;
  officeId?: string;
  position?: string;
  status?: FacilityManagerStatus;
  notes?: string;
}

// フィルター用の型
export interface FacilityManagerFilters {
  search?: string;
  status?: FacilityManagerStatus | 'all';
  officeId?: string;
}

// フォーム用の型定義（バリデーションで使用される型と対応）
export interface FacilityManagerFormData {
  name: string;
  nameKana: string;
  email: string;
  phoneNumber: string;
  position?: string;
  notes?: string;
}

// 事業所登録時の管理者情報
export interface OfficeWithManagerRegistration {
  office: CreateOfficeWithManager;
  manager: FacilityManagerFormData;
}

export interface CreateOfficeWithManager {
  name: string;
  companyId: string;
  address: string;
  phoneNumber: string;
  faxNumber?: string;
  email?: string;
  website?: string;
  serviceType: string;
  establishedDate: string;
  capacity: number;
  description?: string;
  operatingHours: any; // OperatingHours型
  services?: string[];
  notes?: string;
}

// 登録完了レスポンス
export interface OfficeRegistrationResponse {
  office: {
    id: string;
    name: string;
  };
  manager: {
    id: string;
    name: string;
    email: string;
    temporaryPassword: string;
  };
}
