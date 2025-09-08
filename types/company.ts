// 会社関連の型定義
export interface Company {
  id: string;
  name: string;
  nameKana: string;
  corporateNumber?: string;
  address: string;
  phoneNumber: string;
  email: string;
  representativeName: string;
  representativePosition?: string;
  businessType: string;
  establishedDate?: string;
  capital?: string;
  employeeCount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 作成用の型（ID、作成日時、更新日時を除外）
export interface CreateCompany {
  name: string;
  nameKana: string;
  corporateNumber?: string;
  address: string;
  phoneNumber: string;
  email: string;
  representativeName: string;
  representativePosition?: string;
  businessType: string;
  establishedDate?: string;
  capital?: string;
  employeeCount?: number;
  notes?: string;
}

// 更新用の型（すべてオプショナル）
export interface UpdateCompany {
  name?: string;
  nameKana?: string;
  corporateNumber?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  representativeName?: string;
  representativePosition?: string;
  businessType?: string;
  establishedDate?: string;
  capital?: string;
  employeeCount?: number;
  notes?: string;
}

// フィルター用の型
export interface CompanyFilters {
  search?: string;
  businessType?: string;
  city?: string;
}

// フォーム用の型定義（バリデーションで使用される型と対応）
export interface CompanyFormData {
  name: string;
  nameKana: string;
  corporateNumber?: string;
  address: string;
  phoneNumber: string;
  email: string;
  representativeName: string;
  representativePosition?: string;
  businessType: string;
  establishedDate?: string;
  capital?: string;
  employeeCount?: number;
  notes?: string;
}

export type CreateCompanyFormData = Omit<CompanyFormData, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateCompanyFormData = Partial<
  Omit<CompanyFormData, 'id' | 'createdAt' | 'updatedAt'>
>;

export interface EditCompanyFormData {
  name: string;
  nameKana: string;
  corporateNumber?: string;
  address: string;
  phoneNumber: string;
  email: string;
  representativeName: string;
  representativePosition?: string;
  businessType: string;
  establishedDate?: string;
  capital?: string;
  employeeCount?: number;
  notes?: string;
}
