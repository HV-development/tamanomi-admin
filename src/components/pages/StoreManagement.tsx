'use client';

import { useState } from 'react';
import DashboardLayout from '../templates/DashboardLayout';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  registeredAt: string;
}

// サンプルデータ
const sampleStores: Store[] = [
  {
    id: '1',
    name: 'たまのみ 渋谷店',
    address: '東京都渋谷区渋谷1-1-1',
    phone: '03-1234-5678',
    email: 'shibuya@tamanomi.com',
    status: 'active',
    registeredAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'たまのみ 新宿店',
    address: '東京都新宿区新宿2-2-2',
    phone: '03-2345-6789',
    email: 'shinjuku@tamanomi.com',
    status: 'active',
    registeredAt: '2024-01-20',
  },
  {
    id: '3',
    name: 'たまのみ 池袋店',
    address: '東京都豊島区池袋3-3-3',
    phone: '03-3456-7890',
    email: 'ikebukuro@tamanomi.com',
    status: 'inactive',
    registeredAt: '2024-02-01',
  },
];

export default function StoreManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // フィルタリング処理
  const filteredStores = sampleStores.filter((store) => {
    const matchesSearch = 
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || store.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">店舗管理</h1>
            <p className="mt-2 text-gray-600">
              加盟店舗の管理・編集を行います
            </p>
          </div>
          <Button variant="primary">
            <Icon name="plus" size="sm" className="mr-2" />
            新規店舗追加
          </Button>
        </div>

        {/* 検索・フィルター */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 検索ボックス */}
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                店舗検索
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="店舗名、住所、メールアドレスで検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <Icon name="search" size="sm" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* ステータスフィルター */}
            <div className="md:w-48">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">すべて</option>
                <option value="active">営業中</option>
                <option value="inactive">休業中</option>
              </select>
            </div>
          </div>
        </div>

        {/* 店舗一覧 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              店舗一覧 ({filteredStores.length}件)
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    店舗名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    住所
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    連絡先
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    登録日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStores.map((store) => (
                  <tr key={store.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{store.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{store.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{store.phone}</div>
                      <div className="text-sm text-gray-500">{store.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        store.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {store.status === 'active' ? '営業中' : '休業中'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {store.registeredAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button variant="outline" size="sm">
                        <Icon name="edit" size="sm" className="mr-1" />
                        編集
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Icon name="eye" size="sm" className="mr-1" />
                        詳細
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStores.length === 0 && (
            <div className="text-center py-12">
              <Icon name="store" size="lg" className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">店舗が見つかりません</h3>
              <p className="text-gray-500">検索条件を変更してお試しください。</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}