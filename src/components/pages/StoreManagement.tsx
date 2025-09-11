'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '../templates/DashboardLayout';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

interface Store {
  id: string;
  name: string;
  postalCode: string;
  address: string;
  homepage: string;
  phone: string;
  genre: string;
  status: 'active' | 'inactive';
  registeredAt: string;
}

// サンプルデータ
const sampleStores: Store[] = [
  {
    id: '1',
    name: 'たまのみ 渋谷店',
    postalCode: '150-0002',
    address: '東京都渋谷区渋谷1-1-1 たまのみビル1F',
    homepage: 'https://tamanomi-shibuya.com',
    phone: '03-1234-5678',
    genre: '居酒屋',
    status: 'active',
    registeredAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'たまのみ 新宿店',
    postalCode: '160-0022',
    address: '東京都新宿区新宿2-2-2 新宿センタービル2F',
    homepage: 'https://tamanomi-shinjuku.com',
    phone: '03-2345-6789',
    genre: 'カフェ',
    status: 'active',
    registeredAt: '2024-01-20',
  },
  {
    id: '3',
    name: 'たまのみ 池袋店',
    postalCode: '171-0022',
    address: '東京都豊島区池袋3-3-3',
    homepage: 'https://tamanomi-ikebukuro.com',
    phone: '03-3456-7890',
    genre: 'レストラン',
    status: 'inactive',
    registeredAt: '2024-02-01',
  },
];

export default function StoreManagement() {
  const [searchForm, setSearchForm] = useState({
    storeId: '',
    storeName: '',
    prefecture: '',
    city: '',
    address: '',
    building: '',
    phone: '',
    genre: '',
  });
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // フィルタリング処理
  const filteredStores = sampleStores.filter((store) => {
    const matchesSearch = 
      (searchForm.storeId === '' || store.id.includes(searchForm.storeId)) &&
      (searchForm.storeName === '' || store.name.toLowerCase().includes(searchForm.storeName.toLowerCase())) &&
      (searchForm.prefecture === '' || store.prefecture.toLowerCase().includes(searchForm.prefecture.toLowerCase())) &&
      (searchForm.city === '' || store.city.toLowerCase().includes(searchForm.city.toLowerCase())) &&
      (searchForm.address === '' || store.address.toLowerCase().includes(searchForm.address.toLowerCase())) &&
      (searchForm.building === '' || store.building.toLowerCase().includes(searchForm.building.toLowerCase())) &&
      (searchForm.phone === '' || store.phone.includes(searchForm.phone)) &&
      (searchForm.genre === '' || store.genre.toLowerCase().includes(searchForm.genre.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || store.status === statusFilter;
    
    return matchesSearch && matchesStatus;
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
      storeId: '',
      storeName: '',
      prefecture: '',
      city: '',
      address: '',
      building: '',
      phone: '',
      genre: '',
    });
    setStatusFilter('all');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">店舗管理</h1>
            <p className="text-gray-600">
              加盟店舗の管理・編集を行います
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
            {/* 店舗ID */}
            <div>
              <label htmlFor="storeId" className="block text-sm font-medium text-gray-700 mb-2">
                店舗ID
              </label>
              <input
                type="text"
                id="storeId"
                placeholder="店舗IDを入力"
                value={searchForm.storeId}
                onChange={(e) => handleInputChange('storeId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* 店舗名 */}
            <div>
              <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-2">
                店舗名
              </label>
              <input
                type="text"
                id="storeName"
                placeholder="店舗名を入力"
                value={searchForm.storeName}
                onChange={(e) => handleInputChange('storeName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* 都道府県 */}
            <div>
              <label htmlFor="prefecture" className="block text-sm font-medium text-gray-700 mb-2">
                都道府県
              </label>
              <input
                type="text"
                id="prefecture"
                placeholder="都道府県を入力"
                value={searchForm.prefecture}
                onChange={(e) => handleInputChange('prefecture', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* 市区町村 */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                市区町村
              </label>
              <input
                type="text"
                id="city"
                placeholder="市区町村を入力"
                value={searchForm.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* 番地以降 */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                番地以降
              </label>
              <input
                type="text"
                id="address"
                placeholder="番地以降を入力"
                value={searchForm.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* 建物名 */}
            <div>
              <label htmlFor="building" className="block text-sm font-medium text-gray-700 mb-2">
                建物名
              </label>
              <input
                type="text"
                id="building"
                placeholder="建物名を入力"
                value={searchForm.building}
                onChange={(e) => handleInputChange('building', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* 電話番号 */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                電話番号
              </label>
              <input
                type="text"
                id="phone"
                placeholder="電話番号を入力"
                value={searchForm.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* ジャンル */}
            <div>
              <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
                ジャンル
              </label>
              <input
                type="text"
                id="genre"
                placeholder="ジャンルを入力"
                value={searchForm.genre}
                onChange={(e) => handleInputChange('genre', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            </div>

            {/* ステータスフィルター */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
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

        {/* 店舗一覧 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              店舗一覧 ({filteredStores.length}件)
            </h3>
            <Link href="/stores/new">
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
                    店舗名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    郵便番号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    住所
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    電話番号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ホームページ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ジャンル
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
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
                      <div className="text-sm text-gray-900">{store.postalCode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{store.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{store.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a 
                        href={store.homepage} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        {store.homepage}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{store.genre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {store.status === 'active' ? '営業中' : '休業中'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link href={`/stores/${store.id}/edit`}>
                        <Button variant="outline" size="sm" className="text-blue-600 border-blue-300 hover:bg-blue-50">
                          編集
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                        削除
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