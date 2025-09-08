import type { Admin, AdminRegistrationResponse, CreateAdmin, UpdateAdmin } from '@/types/admin';

// モックデータ（実際のAPIが実装されるまでの仮実装）
const mockAdmins: Admin[] = [
  {
    id: '1',
    name: '田中 太郎',
    nameKana: 'タナカ タロウ',
    email: 'tanaka@example.com',
    phoneNumber: '090-1234-5678',
    status: 'active',
    department: '管理部',
    notes: 'システム管理者',
    lastLoginAt: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: '佐藤 花子',
    nameKana: 'サトウ ハナコ',
    email: 'sato@example.com',
    phoneNumber: '090-2345-6789',
    status: 'active',
    department: '運営部',
    notes: '',
    lastLoginAt: '2024-01-14T15:20:00Z',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-14T15:20:00Z',
  },
  {
    id: '3',
    name: '山田 次郎',
    nameKana: 'ヤマダ ジロウ',
    email: 'yamada@example.com',
    phoneNumber: '090-3456-7890',
    status: 'inactive',
    department: '営業部',
    notes: '休職中',
    lastLoginAt: '2024-01-10T09:15:00Z',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-10T09:15:00Z',
  },
];

let nextId = 4;

export const adminService = {
  /**
   * すべての運営管理者を取得
   */
  async getAll(): Promise<Admin[]> {
    // 実際のAPI実装時は以下のようになる
    // try {
    //   const response = await api.get('/api/admins');
    //   return AdminSchema.array().parse(response.data);
    // } catch (error) {
    //   throw new Error(handleApiError(error));
    // }

    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockAdmins]), 500);
    });
  },

  /**
   * IDで運営管理者を取得
   */
  async getById(id: string): Promise<Admin> {
    // 実際のAPI実装時は以下のようになる
    // try {
    //   const response = await api.get(`/api/admins/${id}`);
    //   return AdminSchema.parse(response.data);
    // } catch (error) {
    //   throw new Error(handleApiError(error));
    // }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const admin = mockAdmins.find((a) => a.id === id);
        if (admin) {
          resolve(admin);
        } else {
          reject(new Error('管理者が見つかりません'));
        }
      }, 300);
    });
  },

  /**
   * 運営管理者を作成
   */
  async create(data: CreateAdmin): Promise<AdminRegistrationResponse> {
    // 実際のAPI実装時は以下のようになる
    // try {
    //   const response = await api.post('/api/admins', data);
    //   return AdminRegistrationResponseSchema.parse(response.data);
    // } catch (error) {
    //   throw new Error(handleApiError(error));
    // }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // メールアドレスの重複チェック
        const existingAdmin = mockAdmins.find((a) => a.email === data.email);
        if (existingAdmin) {
          reject(new Error('このメールアドレスは既に使用されています'));
          return;
        }

        const newAdmin: Admin = {
          ...data,
          id: String(nextId++),
          status: 'active',
          lastLoginAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        mockAdmins.push(newAdmin);

        // 仮パスワードを生成（実際の実装では安全なランダムパスワード生成を使用）
        const temporaryPassword = `CareBase${Math.random().toString(36).substring(2, 8)}!`;

        const registrationResponse: AdminRegistrationResponse = {
          admin: newAdmin,
          temporaryPassword,
        };

        resolve(registrationResponse);
      }, 800);
    });
  },

  /**
   * 運営管理者を更新
   */
  async update(id: string, data: UpdateAdmin): Promise<Admin> {
    // 実際のAPI実装時は以下のようになる
    // try {
    //   const response = await api.put(`/api/admins/${id}`, data);
    //   return AdminSchema.parse(response.data);
    // } catch (error) {
    //   throw new Error(handleApiError(error));
    // }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockAdmins.findIndex((a) => a.id === id);
        if (index === -1) {
          reject(new Error('管理者が見つかりません'));
          return;
        }

        // メールアドレスの重複チェック（自分以外）
        if (data.email) {
          const existingAdmin = mockAdmins.find((a) => a.email === data.email && a.id !== id);
          if (existingAdmin) {
            reject(new Error('このメールアドレスは既に使用されています'));
            return;
          }
        }

        const updatedAdmin: Admin = {
          ...mockAdmins[index],
          ...data,
          updatedAt: new Date().toISOString(),
        };

        mockAdmins[index] = updatedAdmin;
        resolve(updatedAdmin);
      }, 800);
    });
  },

  /**
   * 運営管理者を削除
   */
  async delete(id: string): Promise<void> {
    // 実際のAPI実装時は以下のようになる
    // try {
    //   await api.delete(`/api/admins/${id}`);
    // } catch (error) {
    //   throw new Error(handleApiError(error));
    // }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockAdmins.findIndex((a) => a.id === id);
        if (index === -1) {
          reject(new Error('管理者が見つかりません'));
          return;
        }

        mockAdmins.splice(index, 1);
        resolve();
      }, 500);
    });
  },

  /**
   * 運営管理者のステータスを変更
   */
  async updateStatus(id: string, status: Admin['status']): Promise<Admin> {
    return this.update(id, { status });
  },
};
