'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/templates/dashboard-layout';
import Button from '@/components/atoms/button';
import Icon from '@/components/atoms/icon';

interface Coupon {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'expired';
  createdAt: string;
  updatedAt: string;
}

// サンプルデータ
const sampleCoupons: Coupon[] = [
  { id: 'CP001', name: '新規会員限定10%オフクーポン', status: 'active', createdAt: '2024-01-15 10:30:00', updatedAt: '2024-01-20 14:15:00' },
  { id: 'CP002', name: '誕生日特典20%オフクーポン', status: 'active', createdAt: '2024-01-20 09:00:00', updatedAt: '2024-01-25 16:45:00' },
  { id: 'CP003', name: '年末年始限定500円オフクーポン', status: 'expired', createdAt: '2024-12-01 12:00:00', updatedAt: '2024-12-31 23:59:59' },
  { id: 'CP004', name: 'リピーター限定15%オフクーポン', status: 'inactive', createdAt: '2024-02-01 08:30:00', updatedAt: '2024-02-05 11:20:00' },
  { id: 'CP005', name: '平日限定ドリンク半額クーポン', status: 'active', createdAt: '2024-02-10 11:00:00', updatedAt: '2024-02-15 09:30:00' },
  { id: 'CP006', name: '学生限定20%オフクーポン', status: 'active', createdAt: '2024-02-15 14:20:00', updatedAt: '2024-02-20 16:10:00' },
  { id: 'CP007', name: '週末限定フード30%オフクーポン', status: 'inactive', createdAt: '2024-02-20 16:45:00', updatedAt: '2024-02-25 10:15:00' },
  { id: 'CP008', name: 'ハッピーアワー限定クーポン', status: 'active', createdAt: '2024-02-25 13:30:00', updatedAt: '2024-03-01 11:45:00' },
  { id: 'CP009', name: '友達紹介特典クーポン', status: 'active', createdAt: '2024-03-01 09:15:00', updatedAt: '2024-03-05 14:20:00' },
  { id: 'CP010', name: '季節限定メニュークーポン', status: 'expired', createdAt: '2024-03-05 15:40:00', updatedAt: '2024-03-10 12:30:00' },
  { id: 'CP011', name: 'グループ利用特典クーポン', status: 'active', createdAt: '2024-03-10 10:20:00', updatedAt: '2024-03-15 16:50:00' },
  { id: 'CP012', name: 'デザート無料クーポン', status: 'active', createdAt: '2024-03-15 12:10:00', updatedAt: '2024-03-20 09:40:00' },
  { id: 'CP013', name: 'アプリ限定特別クーポン', status: 'inactive', createdAt: '2024-03-20 14:55:00', updatedAt: '2024-03-25 11:25:00' },
  { id: 'CP014', name: '初回来店限定クーポン', status: 'active', createdAt: '2024-03-25 16:30:00', updatedAt: '2024-03-30 13:15:00' },
  { id: 'CP015', name: 'ランチタイム限定クーポン', status: 'active', createdAt: '2024-03-30 11:45:00', updatedAt: '2024-04-01 15:20:00' },
  { id: 'CP016', name: 'カップル限定ペアクーポン', status: 'expired', createdAt: '2024-04-01 13:20:00', updatedAt: '2024-04-05 10:35:00' },
  { id: 'CP017', name: 'シニア限定優待クーポン', status: 'active', createdAt: '2024-04-05 09:50:00', updatedAt: '2024-04-10 14:40:00' },
  { id: 'CP018', name: 'レディースデー特典クーポン', status: 'active', createdAt: '2024-04-10 15:25:00', updatedAt: '2024-04-15 12:10:00' },
  { id: 'CP019', name: 'メンズデー特典クーポン', status: 'inactive', createdAt: '2024-04-15 10:40:00', updatedAt: '2024-04-20 16:55:00' },
  { id: 'CP020', name: '雨の日限定クーポン', status: 'active', createdAt: '2024-04-20 12:15:00', updatedAt: '2024-04-25 09:30:00' },
  { id: 'CP021', name: 'SNS投稿特典クーポン', status: 'active', createdAt: '2024-04-25 14:35:00', updatedAt: '2024-05-01 11:20:00' },
  { id: 'CP022', name: 'アンケート回答特典クーポン', status: 'expired', createdAt: '2024-05-01 16:10:00', updatedAt: '2024-05-05 13:45:00' },
  { id: 'CP023', name: 'VIP会員限定クーポン', status: 'active', createdAt: '2024-05-05 11:55:00', updatedAt: '2024-05-10 15:30:00' },
  { id: 'CP024', name: '早割予約特典クーポン', status: 'active', createdAt: '2024-05-10 13:40:00', updatedAt: '2024-05-15 10:25:00' },
  { id: 'CP025', name: '深夜限定クーポン', status: 'inactive', createdAt: '2024-05-15 15:20:00', updatedAt: '2024-05-20 12:50:00' },
  { id: 'CP026', name: 'テイクアウト限定クーポン', status: 'active', createdAt: '2024-05-20 09:35:00', updatedAt: '2024-05-25 14:15:00' },
  { id: 'CP027', name: 'デリバリー限定クーポン', status: 'active', createdAt: '2024-05-25 11:10:00', updatedAt: '2024-05-30 16:40:00' },
  { id: 'CP028', name: '記念日特典クーポン', status: 'expired', createdAt: '2024-05-30 14:25:00', updatedAt: '2024-06-01 11:55:00' },
  { id: 'CP029', name: '夏季限定冷たいドリンククーポン', status: 'active', createdAt: '2024-06-01 16:45:00', updatedAt: '2024-06-05 13:20:00' },
  { id: 'CP030', name: '月末感謝祭クーポン', status: 'active', createdAt: '2024-06-05 10:30:00', updatedAt: '2024-06-10 15:10:00' },
];

export default function CouponManagement() {
  const [searchForm, setSearchForm] = useState({
    couponId: '',
    couponName: '',
  });
  const [appliedSearchForm, setAppliedSearchForm] = useState({
    couponId: '',
    couponName: '',
  });
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [appliedStatusFilter, setAppliedStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // フィルタリング処理
  const filteredCoupons = sampleCoupons.filter((coupon) => {
    const matchesSearch = 
      (appliedSearchForm.couponId === '' || coupon.id.toLowerCase().includes(appliedSearchForm.couponId.toLowerCase())) &&
      (appliedSearchForm.couponName === '' || coupon.name.toLowerCase().includes(appliedSearchForm.couponName.toLowerCase()));
    
    const matchesStatus = appliedStatusFilter === 'all' || coupon.status === appliedStatusFilter;
    
    return matchesSearch && matchesStatus;
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
    setAppliedStatusFilter(statusFilter);
    console.log('検索実行:', searchForm);
  };

  const handleClear = () => {
    setSearchForm({
      couponId: '',
      couponName: '',
    });
    setStatusFilter('all');
    setAppliedSearchForm({
      couponId: '',
      couponName: '',
    });
    setAppliedStatusFilter('all');
  };

  const _getStatusLabel = (status: string) => {
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

  const _getStatusColor = (status: string) => {
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">クーポン管理</h1>
            <p className="text-gray-600">
              クーポンの管理・編集を行います
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

        {/* クーポン一覧 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              クーポン一覧 ({filteredCoupons.length}件)
            </h3>
            <Link href="/coupons/new">
              <Button variant="outline" className="bg-white text-green-600 border-green-600 hover:bg-green-50">
                <span className="mr-2">+</span>
                新規作成
              </Button>
            </Link>
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
                      <div className="text-sm text-gray-900">{_getStatusLabel(coupon.status)}</div>
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
                        <Button variant="outline" size="sm" className="text-green-600 border-green-300 hover:bg-green-50">
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