import type {
  CreateFacilityManager,
  FacilityManager,
  FacilityManagerFilters,
  UpdateFacilityManager,
} from '@/types/facility-manager';

// 一時パスワード生成関数
const generateTemporaryPassword = (): string => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const length = 12;
  let password = '';

  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return password;
};

// モックデータを拡張した事業所管理者データ
const mockFacilityManagerData: FacilityManager[] = [
  {
    id: 'fm1',
    name: '佐々木 健一',
    nameKana: 'ササキ ケンイチ',
    email: 'sasaki.kenichi@carestation-aozora.com',
    phoneNumber: '090-1111-2222',
    officeId: '1',
    officeName: 'ケアステーション青空',
    position: '管理者',
    status: 'active',
    notes: '看護師資格保有',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'fm2',
    name: '田村 美由紀',
    nameKana: 'タムラ ミユキ',
    email: 'tamura.miyuki@dayservice-himawari.com',
    phoneNumber: '090-3333-4444',
    officeId: '2',
    officeName: 'デイサービスひまわり',
    position: '管理者',
    status: 'active',
    notes: '介護福祉士資格保有',
    createdAt: '2023-02-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'fm3',
    name: '井上 太郎',
    nameKana: 'イノウエ タロウ',
    email: 'inoue.taro@homecare-midori.com',
    phoneNumber: '090-5555-6666',
    officeId: '3',
    officeName: 'ホームケアみどり',
    position: '管理者',
    status: 'active',
    notes: 'ケアマネージャー資格保有',
    createdAt: '2023-03-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
];

export const facilityManagerService = {
  async getAll(): Promise<FacilityManager[]> {
    // 実際のAPIコール
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockFacilityManagerData;
  },

  async getById(id: string): Promise<FacilityManager | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockFacilityManagerData.find((manager) => manager.id === id) || null;
  },

  async getByOfficeId(officeId: string): Promise<FacilityManager[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return mockFacilityManagerData.filter((manager) => manager.officeId === officeId);
  },

  async create(data: CreateFacilityManager): Promise<FacilityManager> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newManager: FacilityManager = {
      id: `fm${Date.now()}`,
      ...data,
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockFacilityManagerData.push(newManager);
    return newManager;
  },

  async update(id: string, data: UpdateFacilityManager): Promise<FacilityManager> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const index = mockFacilityManagerData.findIndex((manager) => manager.id === id);
    if (index === -1) {
      throw new Error('事業所管理者が見つかりません');
    }

    const updatedManager: FacilityManager = {
      ...mockFacilityManagerData[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    mockFacilityManagerData[index] = updatedManager;
    return updatedManager;
  },

  async delete(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const index = mockFacilityManagerData.findIndex((manager) => manager.id === id);
    if (index === -1) {
      throw new Error('事業所管理者が見つかりません');
    }

    mockFacilityManagerData.splice(index, 1);
  },

  async updateStatus(id: string, status: FacilityManager['status']): Promise<FacilityManager> {
    return this.update(id, { status });
  },

  async search(filters: FacilityManagerFilters): Promise<FacilityManager[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    let filtered = [...mockFacilityManagerData];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (manager) =>
          manager.name.toLowerCase().includes(searchLower) ||
          manager.nameKana.toLowerCase().includes(searchLower) ||
          manager.email.toLowerCase().includes(searchLower) ||
          manager.position?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.officeId) {
      filtered = filtered.filter((manager) => manager.officeId === filters.officeId);
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((manager) => manager.status === filters.status);
    }

    return filtered;
  },

  async requestPasswordReset(id: string): Promise<{
    success: boolean;
    message: string;
    newPassword: string;
    manager: FacilityManager;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const manager = mockFacilityManagerData.find((m) => m.id === id);
    if (!manager) {
      throw new Error('事業所管理者が見つかりません');
    }

    // 新しい一時パスワードを生成
    const newPassword = generateTemporaryPassword();

    // 実際のAPIではパスワードをハッシュ化してDBに保存
    console.log(`Password reset for manager: ${manager.email}, new password: ${newPassword}`);

    return {
      success: true,
      message: `${manager.name}さんの新しいパスワードを発行しました。`,
      newPassword,
      manager,
    };
  },
};
