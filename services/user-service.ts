import type { User, CreateUser, UpdateUser, UserFilters } from '@/types/user';

// モックデータを拡張した利用者データ
const mockUserData: User[] = [
  {
    id: 'u1',
    name: '田中 義男',
    nameKana: 'タナカ ヨシオ',
    birthDate: '1942-03-15',
    age: 82,
    gender: 'male',
    phoneNumber: '03-1234-5678',
    emergencyContact: {
      name: '田中 次郎',
      relationship: '長男',
      phoneNumber: '090-1234-5678',
      address: '東京都世田谷区○○町1-2-3',
    },
    address: '東京都世田谷区○○町1-2-3',
    officeId: '1',
    officeName: 'ケアステーション青空',
    careLevel: 'care2',
    insuranceNumber: '1234567890',
    medicalHistory: '高血圧、糖尿病',
    allergies: ['ペニシリン'],
    medications: ['降圧剤', 'インスリン'],
    status: 'active',
    startDate: '2023-04-01',
    notes: '車椅子使用',
    createdAt: '2023-04-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'u2',
    name: '中村 静子',
    nameKana: 'ナカムラ シズコ',
    birthDate: '1949-08-22',
    age: 75,
    gender: 'female',
    phoneNumber: '03-2345-6789',
    emergencyContact: {
      name: '中村 花子',
      relationship: '娘',
      phoneNumber: '090-2345-6789',
      address: '東京都渋谷区△△町2-3-4',
    },
    address: '東京都渋谷区△△町2-3-4',
    officeId: '1',
    officeName: 'ケアステーション青空',
    careLevel: 'care1',
    insuranceNumber: '2345678901',
    medicalHistory: '認知症初期',
    allergies: [],
    medications: ['認知症治療薬'],
    status: 'active',
    startDate: '2023-06-15',
    notes: '見守りが必要',
    createdAt: '2023-06-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'u3',
    name: '小林 明',
    nameKana: 'コバヤシ アキラ',
    birthDate: '1934-12-05',
    age: 90,
    gender: 'male',
    phoneNumber: '03-3456-7890',
    emergencyContact: {
      name: '小林 太郎',
      relationship: '息子',
      phoneNumber: '090-3456-7890',
      address: '東京都新宿区□□町3-4-5',
    },
    address: '東京都新宿区□□町3-4-5',
    officeId: '2',
    officeName: 'デイサービスひまわり',
    careLevel: 'care3',
    insuranceNumber: '3456789012',
    medicalHistory: '脳梗塞後遺症、高血圧',
    allergies: ['造影剤'],
    medications: ['血栓予防薬', '降圧剤'],
    status: 'active',
    startDate: '2022-10-01',
    notes: '左半身麻痺',
    createdAt: '2022-10-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'u4',
    name: '山田 さくら',
    nameKana: 'ヤマダ サクラ',
    birthDate: '1945-05-10',
    age: 79,
    gender: 'female',
    phoneNumber: '03-4567-8901',
    emergencyContact: {
      name: '山田 健一',
      relationship: '夫',
      phoneNumber: '03-4567-8901',
      address: '東京都品川区◇◇町4-5-6',
    },
    address: '東京都品川区◇◇町4-5-6',
    officeId: '2',
    officeName: 'デイサービスひまわり',
    careLevel: 'support2',
    insuranceNumber: '4567890123',
    medicalHistory: '骨粗しょう症',
    allergies: [],
    medications: ['カルシウム剤'],
    status: 'active',
    startDate: '2023-01-20',
    notes: '転倒リスクあり',
    createdAt: '2023-01-20T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
];

export const userService = {
  async getAll(): Promise<User[]> {
    // 実際のAPIコール
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockUserData;
  },

  async getById(id: string): Promise<User | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockUserData.find((user) => user.id === id) || null;
  },

  async getByOfficeId(officeId: string): Promise<User[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return mockUserData.filter((user) => user.officeId === officeId);
  },

  async create(data: CreateUser): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const birthDate = new Date(data.birthDate);
    const age = new Date().getFullYear() - birthDate.getFullYear();

    const newUser: User = {
      id: `u${Date.now()}`,
      ...data,
      age,
      status: data.status || 'active',
      allergies: data.allergies || [],
      medications: data.medications || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockUserData.push(newUser);
    return newUser;
  },

  async update(id: string, data: UpdateUser): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const index = mockUserData.findIndex((user) => user.id === id);
    if (index === -1) {
      throw new Error('利用者が見つかりません');
    }

    let age = mockUserData[index].age;
    if (data.birthDate) {
      const birthDate = new Date(data.birthDate);
      age = new Date().getFullYear() - birthDate.getFullYear();
    }

    const updatedUser: User = {
      ...mockUserData[index],
      ...data,
      age,
      updatedAt: new Date().toISOString(),
    };

    mockUserData[index] = updatedUser;
    return updatedUser;
  },

  async delete(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const index = mockUserData.findIndex((user) => user.id === id);
    if (index === -1) {
      throw new Error('利用者が見つかりません');
    }

    mockUserData.splice(index, 1);
  },

  async updateStatus(id: string, status: User['status']): Promise<User> {
    return this.update(id, { status });
  },

  async search(filters: UserFilters): Promise<User[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    let filtered = [...mockUserData];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.nameKana.toLowerCase().includes(searchLower) ||
          user.insuranceNumber.includes(filters.search) ||
          user.address.toLowerCase().includes(searchLower)
      );
    }

    if (filters.officeId) {
      filtered = filtered.filter((user) => user.officeId === filters.officeId);
    }

    if (filters.careLevel && filters.careLevel !== 'all') {
      filtered = filtered.filter((user) => user.careLevel === filters.careLevel);
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((user) => user.status === filters.status);
    }

    if (filters.gender && filters.gender !== 'all') {
      filtered = filtered.filter((user) => user.gender === filters.gender);
    }

    if (filters.ageRange) {
      if (filters.ageRange.min !== undefined) {
        filtered = filtered.filter((user) => user.age >= filters.ageRange!.min!);
      }
      if (filters.ageRange.max !== undefined) {
        filtered = filtered.filter((user) => user.age <= filters.ageRange!.max!);
      }
    }

    return filtered;
  },
};
