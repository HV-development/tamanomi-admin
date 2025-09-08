import { offices } from '@/mocks/offices';
import type {
  CreateOfficeRequest,
  Office,
  OfficeFilters,
  OfficeStats,
  UpdateOfficeRequest,
} from '@/types/office';

// モックデータの拡張
const mockOfficesExtended: Office[] = offices.map((office, index) => ({
  ...office,
  faxNumber: `03-1234-567${index}`,
  email: `info@${office.name.toLowerCase().replace(/\s+/g, '')}.com`,
  website: `https://www.${office.name.toLowerCase().replace(/\s+/g, '')}.com`,
  serviceType: 'visiting-nursing' as const,
  establishedDate: new Date(2020 + index, index % 12, 15).toISOString().split('T')[0],
  capacity: 50 + index * 10,
  currentUsers: 30 + index * 5,
  staffCount: 10 + index * 2,
  status: index % 5 === 0 ? 'disabled' : ('active' as const),
  managerId: `manager_${index + 1}`,
  managerName: `管理者 ${index + 1}`,
  operatingHours: {
    monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    saturday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    sunday: { isOpen: false },
  },
  certifications: ['介護保険指定事業者', '医療保険指定事業者'],
  createdAt: new Date(2024, index, 15).toISOString(),
  updatedAt: new Date().toISOString(),
}));

class OfficeService {
  private offices: Office[] = mockOfficesExtended;

  async getOffices(filters?: Partial<OfficeFilters>): Promise<Office[]> {
    // シミュレートされた遅延
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filteredOffices = [...this.offices];

    if (filters) {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredOffices = filteredOffices.filter(
          (office) =>
            office.name.toLowerCase().includes(searchLower) ||
            office.companyName.toLowerCase().includes(searchLower) ||
            office.address.toLowerCase().includes(searchLower)
        );
      }

      if (filters.serviceType) {
        filteredOffices = filteredOffices.filter(
          (office) => office.serviceType === filters.serviceType
        );
      }

      // 利用停止フィルター
      if (filters.isDisabled !== undefined) {
        if (filters.isDisabled) {
          // 利用停止のみ表示
          filteredOffices = filteredOffices.filter((office) => office.status === 'disabled');
        } else {
          // 稼働中のみ表示
          filteredOffices = filteredOffices.filter((office) => office.status === 'active');
        }
      } else {
        // デフォルトでは稼働中のみ表示
        filteredOffices = filteredOffices.filter((office) => office.status === 'active');
      }

      if (filters.companyId) {
        filteredOffices = filteredOffices.filter(
          (office) => office.companyId === filters.companyId
        );
      }

      if (filters.city) {
        filteredOffices = filteredOffices.filter((office) =>
          office.address.includes(filters.city!)
        );
      }

      if (filters.hasVacancy) {
        filteredOffices = filteredOffices.filter((office) => office.currentUsers < office.capacity);
      }
    }

    return filteredOffices;
  }

  async getOfficeById(id: string): Promise<Office | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return this.offices.find((office) => office.id === id) || null;
  }

  async createOffice(data: CreateOfficeRequest): Promise<Office> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newOffice: Office = {
      ...data,
      id: `office_${Date.now()}`,
      companyName: 'サンプル法人', // 実際の実装では companyId から取得
      currentUsers: 0,
      staffCount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.offices.push(newOffice);
    return newOffice;
  }

  async updateOffice(data: UpdateOfficeRequest): Promise<Office> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = this.offices.findIndex((office) => office.id === data.id);
    if (index === -1) {
      throw new Error('事業所が見つかりません');
    }

    const updatedOffice: Office = {
      ...this.offices[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.offices[index] = updatedOffice;
    return updatedOffice;
  }

  async deleteOffice(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const index = this.offices.findIndex((office) => office.id === id);
    if (index === -1) {
      throw new Error('事業所が見つかりません');
    }

    // 削除前の制限チェック
    const deleteCheck = await this.canDeleteOffice(id);
    if (!deleteCheck.canDelete) {
      throw new Error(deleteCheck.reason || '事業所を削除できません');
    }

    this.offices.splice(index, 1);
  }

  async hasUsers(officeId: string): Promise<boolean> {
    // userServiceをインポートして利用者をチェック
    const { userService } = await import('./user-service');
    const users = await userService.getUsers({ officeId });
    // アクティブな利用者のみをチェック
    return users.some((user) => user.status === 'active');
  }

  async hasStaff(officeId: string): Promise<boolean> {
    // staffServiceをインポートして職員をチェック
    const { staffService } = await import('./staff-service');
    const staff = await staffService.getStaff({ officeId });
    // アクティブな職員のみをチェック
    return staff.some((s) => s.status === 'active');
  }

  async canDeleteOffice(id: string): Promise<{ canDelete: boolean; reason?: string }> {
    const office = this.offices.find((o) => o.id === id);
    if (!office) {
      return { canDelete: false, reason: '事業所が見つかりません' };
    }

    // 利用停止中でない場合は削除不可
    if (office.status !== 'disabled') {
      return {
        canDelete: false,
        reason: '事業所を削除するには、まず利用停止にしてください',
      };
    }

    // 利用者がいる場合は削除不可
    const hasUsers = await this.hasUsers(id);
    if (hasUsers) {
      return {
        canDelete: false,
        reason: '紐付く利用者がいるため削除できません',
      };
    }

    // 職員がいる場合は削除不可
    const hasStaff = await this.hasStaff(id);
    if (hasStaff) {
      return {
        canDelete: false,
        reason: '紐付く職員がいるため削除できません',
      };
    }

    return { canDelete: true };
  }

  async disableOffice(id: string, reason?: string): Promise<Office> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const index = this.offices.findIndex((office) => office.id === id);
    if (index === -1) {
      throw new Error('事業所が見つかりません');
    }

    const updatedOffice: Office = {
      ...this.offices[index],
      status: 'disabled',
      updatedAt: new Date().toISOString(),
    };

    this.offices[index] = updatedOffice;
    console.log(`Office ${id} disabled. Reason: ${reason || '理由未指定'}`);

    return updatedOffice;
  }

  async enableOffice(id: string): Promise<Office> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const index = this.offices.findIndex((office) => office.id === id);
    if (index === -1) {
      throw new Error('事業所が見つかりません');
    }

    const updatedOffice: Office = {
      ...this.offices[index],
      status: 'active',
      updatedAt: new Date().toISOString(),
    };

    this.offices[index] = updatedOffice;
    console.log(`Office ${id} enabled.`);

    return updatedOffice;
  }

  async getOfficeStats(): Promise<OfficeStats> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const totalOffices = this.offices.length;
    const activeOffices = this.offices.filter((o) => o.status === 'active').length;
    const totalStaff = this.offices.reduce((sum, o) => sum + o.staffCount, 0);
    const totalUsers = this.offices.reduce((sum, o) => sum + o.currentUsers, 0);
    const totalCapacity = this.offices.reduce((sum, o) => sum + o.capacity, 0);

    const now = new Date();
    const newThisMonth = this.offices.filter((o) => {
      const created = new Date(o.createdAt);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;

    const needsAttention = this.offices.filter((o) => o.status === 'disabled').length;

    return {
      totalOffices,
      activeOffices,
      totalStaff,
      totalUsers,
      newThisMonth,
      needsAttention,
      averageCapacityRate: totalCapacity > 0 ? Math.round((totalUsers / totalCapacity) * 100) : 0,
    };
  }

  async exportOffices(): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const headers = [
      'ID',
      '事業所名',
      '法人名',
      '住所',
      '電話番号',
      'サービス種別',
      '定員',
      '利用者数',
      '職員数',
      'ステータス',
      '登録日',
    ];

    const rows = this.offices.map((office) => [
      office.id,
      office.name,
      office.companyName,
      office.address,
      office.phoneNumber,
      this.getServiceTypeLabel(office.serviceType),
      office.capacity.toString(),
      office.currentUsers.toString(),
      office.staffCount.toString(),
      this.getStatusLabel(office.status),
      new Date(office.createdAt).toLocaleDateString('ja-JP'),
    ]);

    return [headers, ...rows].map((row) => row.join(',')).join('\n');
  }

  private getServiceTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'visiting-nursing': '訪問看護',
      'day-service': 'デイサービス',
      'home-help': '訪問介護',
      'care-management': '居宅介護支援',
      'group-home': 'グループホーム',
      rehabilitation: 'リハビリテーション',
    };
    return labels[type] || type;
  }

  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: '稼働中',
      disabled: '利用停止',
    };
    return labels[status] || status;
  }
}

export const officeService = new OfficeService();
