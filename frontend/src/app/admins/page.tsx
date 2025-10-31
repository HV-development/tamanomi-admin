'use client';

import { useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/templates/admin-layout';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import { type Admin, type AdminSearchForm } from '@hv-development/schemas';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

// サンプルデータ
const sampleAdmins: Admin[] = [
  { id: 'ADM001', name: '管理者太郎', email: 'admin@tamanomi.com', role: 1, createdAt: '2024/01/15' },
  { id: 'ADM002', name: '一般花子', email: 'general@tamanomi.com', role: 2, createdAt: '2024/01/20' },
  { id: 'ADM003', name: '管理者次郎', email: 'admin2@tamanomi.com', role: 1, createdAt: '2024/02/01' },
  { id: 'ADM004', name: '一般美咲', email: 'general2@tamanomi.com', role: 2, createdAt: '2024/02/10' },
  { id: 'ADM005', name: '管理者三郎', email: 'admin3@tamanomi.com', role: 1, createdAt: '2024/02/15' },
  { id: 'ADM006', name: '一般由美', email: 'general3@tamanomi.com', role: 2, createdAt: '2024/02/20' },
  { id: 'ADM007', name: '管理者四郎', email: 'admin4@tamanomi.com', role: 1, createdAt: '2024/02/25' },
  { id: 'ADM008', name: '一般恵子', email: 'general4@tamanomi.com', role: 2, createdAt: '2024/03/01' },
  { id: 'ADM009', name: '管理者五郎', email: 'admin5@tamanomi.com', role: 1, createdAt: '2024/03/05' },
  { id: 'ADM010', name: '一般真理', email: 'general5@tamanomi.com', role: 2, createdAt: '2024/03/10' },
  { id: 'ADM011', name: '管理者六郎', email: 'admin6@tamanomi.com', role: 1, createdAt: '2024/03/15' },
  { id: 'ADM012', name: '一般智子', email: 'general6@tamanomi.com', role: 2, createdAt: '2024/03/20' },
  { id: 'ADM013', name: '管理者七郎', email: 'admin7@tamanomi.com', role: 1, createdAt: '2024/03/25' },
  { id: 'ADM014', name: '一般裕子', email: 'general7@tamanomi.com', role: 2, createdAt: '2024/03/30' },
  { id: 'ADM015', name: '管理者八郎', email: 'admin8@tamanomi.com', role: 1, createdAt: '2024/04/01' },
  { id: 'ADM016', name: '一般明美', email: 'general8@tamanomi.com', role: 2, createdAt: '2024/04/05' },
  { id: 'ADM017', name: '管理者九郎', email: 'admin9@tamanomi.com', role: 1, createdAt: '2024/04/10' },
  { id: 'ADM018', name: '一般直子', email: 'general9@tamanomi.com', role: 2, createdAt: '2024/04/15' },
  { id: 'ADM019', name: '管理者十郎', email: 'admin10@tamanomi.com', role: 1, createdAt: '2024/04/20' },
  { id: 'ADM020', name: '一般和子', email: 'general10@tamanomi.com', role: 2, createdAt: '2024/04/25' },
  { id: 'ADM021', name: '管理者十一郎', email: 'admin11@tamanomi.com', role: 1, createdAt: '2024/05/01' },
  { id: 'ADM022', name: '一般京子', email: 'general11@tamanomi.com', role: 2, createdAt: '2024/05/05' },
  { id: 'ADM023', name: '管理者十二郎', email: 'admin12@tamanomi.com', role: 1, createdAt: '2024/05/10' },
  { id: 'ADM024', name: '一般雅子', email: 'general12@tamanomi.com', role: 2, createdAt: '2024/05/15' },
  { id: 'ADM025', name: '管理者十三郎', email: 'admin13@tamanomi.com', role: 1, createdAt: '2024/05/20' },
  { id: 'ADM026', name: '一般典子', email: 'general13@tamanomi.com', role: 2, createdAt: '2024/05/25' },
  { id: 'ADM027', name: '管理者十四郎', email: 'admin14@tamanomi.com', role: 1, createdAt: '2024/05/30' },
  { id: 'ADM028', name: '一般文子', email: 'general14@tamanomi.com', role: 2, createdAt: '2024/06/01' },
  { id: 'ADM029', name: '管理者十五郎', email: 'admin15@tamanomi.com', role: 1, createdAt: '2024/06/05' },
  { id: 'ADM030', name: '一般節子', email: 'general15@tamanomi.com', role: 2, createdAt: '2024/06/10' },
];

export default function AdminsPage() {
  const [searchForm, setSearchForm] = useState<AdminSearchForm>({
    accountId: '',
    name: '',
    email: '',
    role: '',
  });
  const [appliedSearchForm, setAppliedSearchForm] = useState<AdminSearchForm>({
    accountId: '',
    name: '',
    email: '',
    role: '',
  });
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // フィルタリング処理
  const filteredAdmins = sampleAdmins.filter((admin) => {
    const matchesSearch = 
      (!appliedSearchForm.accountId || appliedSearchForm.accountId === '' || admin.id.toLowerCase().includes(appliedSearchForm.accountId.toLowerCase())) &&
      (!appliedSearchForm.name || appliedSearchForm.name === '' || admin.name.toLowerCase().includes(appliedSearchForm.name.toLowerCase())) &&
      (!appliedSearchForm.email || appliedSearchForm.email === '' || admin.email.toLowerCase().includes(appliedSearchForm.email.toLowerCase())) &&
      (!appliedSearchForm.role || appliedSearchForm.role === '' || admin.role.toString() === appliedSearchForm.role);
    
    return matchesSearch;
  });

  const handleInputChange = (field: keyof typeof searchForm, value: string) => {
    setSearchForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    // 検索フォームの内容を適用済み検索フォームにコピーして検索実行
    setAppliedSearchForm({ ...searchForm });
    console.log('検索実行:', searchForm);
  };

  const handleClear = () => {
    setSearchForm({
      accountId: '',
      name: '',
      email: '',
      role: '',
    });
    setAppliedSearchForm({
      accountId: '',
      name: '',
      email: '',
      role: '',
    });
  };

  const _getRoleLabel = (role: number) => {
    switch (role) {
      case 1:
        return '管理者';
      case 2:
        return '一般';
      default:
        return '一般';
    }
  };

  const _getRoleColor = (role: number) => {
    switch (role) {
      case 1:
        return 'bg-blue-100 text-blue-800';
      case 2:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = (adminId: string, adminName: string) => {
    if (confirm(`${adminName}のアカウントを削除しますか？`)) {
      // 実際の削除処理（APIコール等）
      console.log('管理者アカウント削除:', adminId);
      alert('管理者アカウントを削除しました');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">管理者アカウント</h1>
            <p className="text-gray-600">
              管理者アカウントの管理・編集を行います
            </p>
            </div>
            <div className="text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Icon name="admin" size="sm" className="text-gray-600" />
                <span className="font-medium text-gray-900">管理者太郎</span>
              </div>
            </div>
          </div>
        </div>

        {/* 検索フォーム */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="pb-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">検索条件</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="flex items-center focus:outline-none"
            >
              <Icon name={isSearchExpanded ? 'chevronUp' : 'chevronDown'} size="sm" />
            </Button>
          </div>
          
          {isSearchExpanded && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* アカウントID */}
            <div>
              <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-2">
                アカウントID
              </label>
              <input
                type="text"
                id="accountId"
                placeholder="アカウントIDを入力"
                value={searchForm.accountId}
                onChange={(e) => handleInputChange('accountId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* 氏名 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                氏名
              </label>
              <input
                type="text"
                id="name"
                placeholder="氏名を入力"
                value={searchForm.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* メールアドレス */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                placeholder="メールアドレスを入力"
                value={searchForm.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* 権限 */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                権限
              </label>
              <select
                id="role"
                value={searchForm.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">すべて</option>
                <option value="1">管理者</option>
                <option value="2">一般</option>
              </select>
            </div>
            </div>

            {/* 検索・クリアボタン */}
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={handleClear}>
                クリア
              </Button>
              <Button variant="primary" onClick={handleSearch}>
                検索
              </Button>
            </div>
          </div>
          )}
        </div>

        {/* アカウント一覧 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              アカウント一覧 ({filteredAdmins.length}件)
            </h3>
            <Link href="/admins/new">
              <Button variant="outline" className="bg-white text-green-600 border-green-600 hover:bg-green-50">
                <span className="mr-2">+</span>
                新規登録
              </Button>
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アカウントID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    氏名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    メールアドレス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    権限
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{admin.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{admin.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{admin.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{_getRoleLabel(admin.role)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link href={`/admins/${admin.email}/edit`}>
                        <Button variant="outline" size="sm" className="text-green-600 border-green-300 hover:bg-green-50">
                          編集
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() => handleDelete(admin.id, admin.name)}
                      >
                        削除
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAdmins.length === 0 && (
            <div className="text-center py-12">
              <Icon name="admin" size="lg" className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">管理者アカウントが見つかりません</h3>
              <p className="text-gray-500">検索条件を変更してお試しください。</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
