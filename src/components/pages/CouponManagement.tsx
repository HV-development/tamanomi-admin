'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '../templates/DashboardLayout';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

interface Coupon {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'expired';
  createdAt: string;
  updatedAt: string;
}

// サンプルデータ
const sampleCoupons: Coupon[] = [
  {
    id: 'CP001',
    name: '新規会員限定10%オフクーポン',
    status: 'active',
    createdAt: '2024-01-15 10:30:00',
    updatedAt: '2024-01-20 14:15:00',
  },
  {
    id: 'CP002',
    name: '誕生日特典20%オフクーポン',
    status: 'active',
    createdAt: '2024-01-20 09:00:00',
    updatedAt: '2024-01-25 16:45:00',
  },
  {
    id: 'CP003',
    name: '年末年始限定500円オフクーポン',
    status: 'expired',
    createdAt: '2024-12-01 12:00:00',
    updatedAt: '2024-12-31 23:59:59',
  },
  {
    id: 'CP004',
    name: 'リピーター限定15%オフクーポン',
    status: 'inactive',
    createdAt: '2024-02-01 08:30:00',
    updatedAt: '2024-02-05 11:20:00',
  },
];

export default function CouponManagement() {
  const [searchForm, setSearchForm] = useState({
    couponId: '',
    couponName: '',
  });
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // フィルタリング処理
  const filteredCoupons = sampleCoupons.filter((coupon) => {
    const matchesSearch = 
      (searchForm.couponId === '' || coupon.id.toLowerCase().includes(searchForm.couponId.toLowerCase())) &&
      (searchForm.couponName === '' || coupon.name.toLowerCase().includes(searchForm.couponName.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || coupon.status === statusFilter;
    
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
      couponId: '',
      couponName: '',
    });
    setStatusFilter('all');
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return '有効';
      case 'inactive':
        return '無効';
      case 'expired':
        return '期限切れ';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">クーポン管理</h1>
          <p className="mt-2 text-gray-600">
            クーポンの管理・編集を行います
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
              className="flex items-center space-x-2"
            >
              <span>{isSearchExpanded ? '折りたたむ' : '展開する'}</span>
              <Icon name={isSearchExpanded ? 'chevronUp' : 'chevronDown'} size="sm" />
            </Button>
          </div>
          
          {isSearchExpanded && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* クーポンID */}
            <div>
              <label htmlFor="couponId" className="block text-sm font-medium text-gray-700 mb-2">
                クーポンID
              </label>
              <input
                type="text"
                id="couponId"
                placeholder="クーポンIDを入力"
                value={searchForm.couponId}
                onChange={(e) => handleInputChange('couponId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* クーポン名 */}
            <div>
              <label htmlFor="couponName" className="block text-sm font-medium text-gray-700 mb-2">
                クーポン名
              </label>
              <input
                type="text"
                id="couponName"
                placeholder="クーポン名を入力"
                value={searchForm.couponName}
                onChange={(e) => handleInputChange('couponName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* ステータス */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'expired')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">すべて</option>
                <option value="active">有効</option>
                <option value="inactive">無効</option>
                <option value="expired">期限切れ</option>
              </select>
            </div>
            </div>

            {/* 検索・クリアボタン */}
            <div className="flex gap-2 mt-4">
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

        {/* 新規作成ボタン */}
        <div className="flex justify-end">
          <Button variant="primary">
            <Link href="/coupons/new">新規作成</Link>
          </Button>
        </div>

        {/* クーポン一覧 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              クーポン一覧 ({filteredCoupons.length}件)
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    クーポンID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    クーポン名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    作成日時
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    更新日時
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{coupon.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{coupon.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(coupon.status)}`}>
                        {getStatusLabel(coupon.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{coupon.createdAt}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{coupon.updatedAt}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link href={`/coupons/${coupon.id}`}>
                        <Button variant="outline" size="sm">
                          詳細
                        </Button>
                      </Link>
                      <Link href={`/coupons/${coupon.id}/edit`}>
                        <Button variant="outline" size="sm">
                          編集
                        </Button>
                      </Link>
                      <Link href={`/coupons/${coupon.id}/history`}>
                        <Button variant="outline" size="sm">
                          利用履歴
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCoupons.length === 0 && (
            <div className="text-center py-12">
              <Icon name="coupon" size="lg" className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">クーポンが見つかりません</h3>
              <p className="text-gray-500">検索条件を変更してお試しください。</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}