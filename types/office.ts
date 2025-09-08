export interface Office {
  id: string;
  name: string;
  companyId: string;
  companyName: string;
  address: string;
  phoneNumber: string;
  faxNumber?: string;
  email?: string;
  website?: string;
  serviceType: ServiceType;
  establishedDate: string;
  capacity: number;
  currentUsers: number;
  staffCount: number;
  description?: string;
  status: OfficeStatus;
  managerId?: string;
  managerName?: string;
  operatingHours: OperatingHours;
  certifications: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OperatingHours {
  monday: TimeSlot;
  tuesday: TimeSlot;
  wednesday: TimeSlot;
  thursday: TimeSlot;
  friday: TimeSlot;
  saturday: TimeSlot;
  sunday: TimeSlot;
}

export interface TimeSlot {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

export type ServiceType =
  | 'visiting-nursing'
  | 'day-service'
  | 'home-help'
  | 'care-management'
  | 'group-home'
  | 'rehabilitation';

export type OfficeStatus = 'active' | 'disabled';

export interface OfficeStats {
  totalOffices: number;
  activeOffices: number;
  totalStaff: number;
  totalUsers: number;
  newThisMonth: number;
  needsAttention: number;
  averageCapacityRate: number;
}

export interface OfficeFilters {
  search: string;
  serviceType: ServiceType | '' | 'all';
  isDisabled?: boolean;
  companyId: string;
  city: string;
  hasVacancy: boolean;
}

export interface CreateOfficeRequest {
  name: string;
  companyId: string;
  address: string;
  phoneNumber: string;
  faxNumber?: string;
  email?: string;
  website?: string;
  serviceType: ServiceType;
  establishedDate: string;
  capacity: number;
  description?: string;
  managerId?: string;
  operatingHours: OperatingHours;
  certifications: string[];
}

export interface UpdateOfficeRequest extends Partial<CreateOfficeRequest> {
  id: string;
}

// フォーム用の型定義（バリデーションで使用される型と対応）
export interface OfficeFormData {
  name: string;
  companyId: string;
  address: string;
  phoneNumber: string;
  faxNumber?: string;
  email?: string;
  website?: string;
  serviceType: ServiceType;
  establishedDate: string;
  capacity: number;
  description?: string;
  managerId?: string;
  operatingHours: OperatingHours;
  services?: string[];
  status?: OfficeStatus;
  notes?: string;
}

export interface CreateOfficeFormData
  extends Omit<OfficeFormData, 'id' | 'createdAt' | 'updatedAt'> {}

export interface UpdateOfficeFormData
  extends Partial<Omit<OfficeFormData, 'id' | 'createdAt' | 'updatedAt'>> {}

export interface EditOfficeFormData {
  name: string;
  companyId: string;
  address: string;
  phoneNumber: string;
  faxNumber?: string;
  email?: string;
  website?: string;
  serviceType: ServiceType;
  establishedDate: string;
  capacity: number;
  description?: string;
  managerId?: string;
  operatingHours: OperatingHours;
  services?: string[];
  status?: OfficeStatus;
  notes?: string;
}
