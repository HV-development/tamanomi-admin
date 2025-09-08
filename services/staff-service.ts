import type { CreateStaff, Staff, StaffFilters, UpdateStaff } from '@/types/staff';

// モックデータを拡張した職員データ
const mockStaffData: Staff[] = [
  {
    id: 's1',
    name: '山田 花子',
    nameKana: 'ヤマダ ハナコ',
    email: 'yamada.hanako@example.com',
    phoneNumber: '090-1234-5678',
    officeId: '1',
    officeName: 'ケアステーション青空',
    role: 'nurse',
    position: '主任看護師',
    employmentType: 'full-time',
    hireDate: '2020-04-01',
    status: 'active',
    qualifications: ['正看護師', '認定看護師'],
    notes: '夜勤対応可能',
    createdAt: '2020-04-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 's2',
    name: '佐藤 太郎',
    nameKana: 'サトウ タロウ',
    email: 'sato.taro@example.com',
    phoneNumber: '090-2345-6789',
    officeId: '1',
    officeName: 'ケアステーション青空',
    role: 'physical-therapist',
    position: '理学療法士',
    employmentType: 'full-time',
    hireDate: '2021-01-15',
    status: 'active',
    qualifications: ['理学療法士'],
    createdAt: '2021-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 's3',
    name: '鈴木 一郎',
    nameKana: 'スズキ イチロウ',
    email: 'suzuki.ichiro@example.com',
    phoneNumber: '090-3456-7890',
    officeId: '1',
    officeName: 'ケアステーション青空',
    role: 'care-worker',
    position: '介護福祉士',
    employmentType: 'full-time',
    hireDate: '2019-10-01',
    status: 'active',
    qualifications: ['介護福祉士', 'ヘルパー2級'],
    createdAt: '2019-10-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 's4',
    name: '高橋 美咲',
    nameKana: 'タカハシ ミサキ',
    email: 'takahashi.misaki@example.com',
    phoneNumber: '090-4567-8901',
    officeId: '2',
    officeName: 'デイサービスひまわり',
    role: 'nurse',
    position: '看護師',
    employmentType: 'part-time',
    hireDate: '2022-03-01',
    status: 'active',
    qualifications: ['正看護師'],
    createdAt: '2022-03-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 's5',
    name: '田中 健太',
    nameKana: 'タナカ ケンタ',
    email: 'tanaka.kenta@example.com',
    phoneNumber: '090-5678-9012',
    officeId: '2',
    officeName: 'デイサービスひまわり',
    role: 'occupational-therapist',
    position: '作業療法士',
    employmentType: 'full-time',
    hireDate: '2021-06-01',
    status: 'active',
    qualifications: ['作業療法士'],
    createdAt: '2021-06-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
];

export const staffService = {
  async getAll(): Promise<Staff[]> {
    // 実際のAPIコール
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockStaffData;
  },

  async getById(id: string): Promise<Staff | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockStaffData.find((staff) => staff.id === id) || null;
  },

  async getByOfficeId(officeId: string): Promise<Staff[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return mockStaffData.filter((staff) => staff.officeId === officeId);
  },

  async create(data: CreateStaff): Promise<Staff> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newStaff: Staff = {
      id: `s${Date.now()}`,
      ...data,
      status: data.status || 'active',
      qualifications: data.qualifications || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockStaffData.push(newStaff);
    return newStaff;
  },

  async update(id: string, data: UpdateStaff): Promise<Staff> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const index = mockStaffData.findIndex((staff) => staff.id === id);
    if (index === -1) {
      throw new Error('職員が見つかりません');
    }

    const updatedStaff: Staff = {
      ...mockStaffData[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    mockStaffData[index] = updatedStaff;
    return updatedStaff;
  },

  async delete(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const index = mockStaffData.findIndex((staff) => staff.id === id);
    if (index === -1) {
      throw new Error('職員が見つかりません');
    }

    mockStaffData.splice(index, 1);
  },

  async updateStatus(id: string, status: Staff['status']): Promise<Staff> {
    return this.update(id, { status });
  },

  async search(filters: StaffFilters): Promise<Staff[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    let filtered = [...mockStaffData];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (staff) =>
          staff.name.toLowerCase().includes(searchLower) ||
          staff.nameKana.toLowerCase().includes(searchLower) ||
          staff.email.toLowerCase().includes(searchLower) ||
          staff.position?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.officeId) {
      filtered = filtered.filter((staff) => staff.officeId === filters.officeId);
    }

    if (filters.role && filters.role !== 'all') {
      filtered = filtered.filter((staff) => staff.role === filters.role);
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((staff) => staff.status === filters.status);
    }

    if (filters.employmentType && filters.employmentType !== 'all') {
      filtered = filtered.filter((staff) => staff.employmentType === filters.employmentType);
    }

    return filtered;
  },

  async getStaffStats(): Promise<{
    totalStaff: number;
    activeStaff: number;
    onLeaveStaff: number;
    newThisMonth: number;
    byRole: Record<string, number>;
    byEmploymentType: Record<string, number>;
    averageExperience: number;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const totalStaff = mockStaffData.length;
    const activeStaff = mockStaffData.filter((s) => s.status === 'active').length;
    const onLeaveStaff = mockStaffData.filter((s) => s.status === 'on-leave').length;

    const now = new Date();
    const newThisMonth = mockStaffData.filter((s) => {
      const hired = new Date(s.hireDate);
      return hired.getMonth() === now.getMonth() && hired.getFullYear() === now.getFullYear();
    }).length;

    const byRole = mockStaffData.reduce(
      (acc, staff) => {
        acc[staff.role] = (acc[staff.role] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const byEmploymentType = mockStaffData.reduce(
      (acc, staff) => {
        acc[staff.employmentType] = (acc[staff.employmentType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // 平均勤続年数の計算
    const totalExperience = mockStaffData.reduce((acc, staff) => {
      const hireDate = new Date(staff.hireDate);
      const experience = (now.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return acc + experience;
    }, 0);
    const averageExperience =
      totalStaff > 0 ? Math.round((totalExperience / totalStaff) * 10) / 10 : 0;

    return {
      totalStaff,
      activeStaff,
      onLeaveStaff,
      newThisMonth,
      byRole,
      byEmploymentType,
      averageExperience,
    };
  },
};
