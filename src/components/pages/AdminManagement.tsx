'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '../templates/DashboardLayout';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: number;
  createdAt: string;
}

// サンプルデータ
const sampleAdmins: Admin[] = [
  {
    id: 'ADM001',
    name: '管理者太郎',
    email: 'admin@tamanomi.com',
    role: 1,
    createdAt: '2024/01/15',
  },
  {
    id: 'ADM002',
    name: '一般花子',
    email: 'general@tamanomi.com',
    role: 2,
    createdAt: '2024/01/20',
  },
  {
    id: 'ADM003',
    name: '管理者次郎',
    email: 'admin2@tamanomi.com',
    role: 1,
    createdAt: '2024/02/01',
  },
  {
    id: 'ADM004',
    name: '一般美咲',
    email: 'general2@tamanomi.com',
    role: 2,
    createdAt: '2024/02/10',
  },
];

export default function AdminManagement() {
  const [searchForm, setSearchForm] = useState({
    accountId: '',
    name: '',
    email: '',
    role: '',
  });
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // フィルタリング処理
  const filteredAdmins = sampleAdmins.filter((admin) => {
    const matchesSearch = 
      (searchForm.accountId === '' || admin.id.toLowerCase().includes(searchForm.accountId.toLowerCase())) &&
      (searchForm.name === '' || admin.name.toLowerCase().includes(searchForm.name.toLowerCase())) &&
      (searchForm.email === '' || admin.email.toLowerCase().includes(searchForm.email.toLowerCase())) &&
      (searchForm.role === '' || admin.role.toString() === searchForm.role);
    
    return matchesSearch;
  });

  const handleInputChange = (field: keyof typeof searchForm, value: string) => {
    setSearchForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    // 検索処理は既にリアルタイムで実行されているため、特別な処理は不要
    console.log('検索実行:', searchForm);
  };

  const handleClear = () => {
    setSearchForm({
      accountId: '',
      name: '',
      email: '',
      role: '',
    });
  };

  const getRoleLabel = (role: number) => {
    switch (role) {
      case 1:
        return '管理者';
      case 2:
        return '一般';
      default:
        return '一般';
    }
  };

  const getRoleColor = (role: number) => {
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
    <DashboardLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">管理者アカウント管理</h1>
          <p className="mt-2 text-gray-600">
            管理者アカウントの管理・編集を行います
          </p>
        </div>

        {/* 検索フォーム */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">検索条件</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="flex items-center"
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
              <Button variant="primary" onClick={handleSearch}>
                検索
              </Button>
              <Button variant="outline" onClick={handleClear}>
                クリア
              </Button>
            </div>
          </div>
          )}
        </div>

        {/* 新規登録ボタン */}
        <div className="flex justify-end">
          <Button variant="primary">
            <Link href="/admins/new">新規登録</Link>
          </Button>
        </div>

        {/* アカウント一覧 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              アカウント一覧 ({filteredAdmins.length}件)
            </h3>
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
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(admin.role)}`}>
                        {getRoleLabel(admin.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link href={`/admins/${admin.id}/edit`}>
                        <Button variant="outline" size="sm">
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
    </DashboardLayout>
  );
}