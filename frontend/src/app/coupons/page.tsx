'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/templates/admin-layout';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import { apiClient } from '@/lib/api';
import type { CouponWithShop, CouponStatus, CouponListResponse } from '@hv-development/schemas';
import { useAuth } from '@/components/contexts/auth-context';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

interface Shop {
  id: string;
  name: string;
  merchantId: string;
  merchant?: {
    name: string;
  };
}

type PaginationData = CouponListResponse['pagination'];

export default function CouponsPage() {
  const auth = useAuth();
  const isShopAccount = auth?.user?.accountType === 'shop';
  const shopId = isShopAccount ? auth?.user?.shopId : undefined; // 店舗アカウントの場合は自身のshopIdを使用
  const router = useRouter();
  const [shop, setShop] = useState<Shop | null>(null);
  const [coupons, setCoupons] = useState<CouponWithShop[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchForm, setSearchForm] = useState({
    couponId: '',
    couponName: '',
  });
  const [appliedSearchForm, setAppliedSearchForm] = useState({
    couponId: '',
    couponName: '',
  });
  const [statusFilter, setStatusFilter] = useState<'all' | CouponStatus>('all');
  const [appliedStatusFilter, setAppliedStatusFilter] = useState<'all' | CouponStatus>('all');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // クーポン一覧の取得
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      
      if (shopId) {
        params.append('shopId', shopId);
      }
      
      if (appliedSearchForm.couponName) {
        params.append('title', appliedSearchForm.couponName);
      }
      
      if (appliedStatusFilter !== 'all') {
        params.append('status', appliedStatusFilter);
      }

      const data: any = await apiClient.getCoupons(params.toString());
      setCoupons(data.coupons || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error('クーポン一覧の取得に失敗しました:', error);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  // 店舗情報の取得
  useEffect(() => {
    if (shopId) {
      const fetchShop = async () => {
        try {
          const data = await apiClient.getShop(shopId);
          setShop(data as Shop);
        } catch (error) {
          console.error('店舗情報の取得に失敗しました:', error);
        }
      };
      fetchShop();
    }
  }, [shopId]);

  // クーポン一覧を取得
  useEffect(() => {
    fetchCoupons();
  }, [shopId, pagination.page, appliedSearchForm, appliedStatusFilter]);

  const filteredCoupons = coupons;

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

  const _getStatusLabel = (status: CouponStatus) => {
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

  const _getStatusColor = (status: CouponStatus) => {
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-gray-600">読み込み中...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {shopId && shop && (
                <div className="mb-4">
                  <button
                    onClick={() => router.back()}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
                  >
                    <Icon name="chevronLeft" size="sm" />
                    <span className="ml-1">店舗一覧に戻る</span>
                  </button>
                  <div className="text-sm text-gray-600">
                    {shop.merchant?.name && (
                      <span className="font-medium">{shop.merchant.name}</span>
                    )}
                    {shop.merchant?.name && shop.name && ' / '}
                    {shop.name && <span className="font-medium">{shop.name}</span>}
                  </div>
                </div>
              )}
              <h1 className="text-2xl font-bold text-gray-900">
                {isShopAccount ? 'クーポン管理' : (shopId ? '店舗クーポン管理' : 'クーポン管理')}
              </h1>
              <p className="text-gray-600">
                {isShopAccount 
                  ? '自身の店舗のクーポンを管理します'
                  : (shopId 
                    ? 'この店舗のクーポンを管理します' 
                    : 'クーポンの管理・編集を行います')
                }
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

        {/* 検索フォーム（店舗アカウントの場合は簡略表示） */}
        {!isShopAccount && (
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
                onChange={(e) => setStatusFilter(e.target.value as 'all' | CouponStatus)}
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
        )}

        {/* クーポン一覧 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              クーポン一覧 ({filteredCoupons.length}件)
            </h3>
            <Link href={shopId ? `/coupons/new?shopId=${shopId}` : '/coupons/new'}>
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
                      <div className="text-sm font-medium text-gray-900">{coupon.id.substring(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{coupon.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{_getStatusLabel(coupon.status)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(coupon.createdAt).toLocaleString('ja-JP')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(coupon.updatedAt).toLocaleString('ja-JP')}</div>
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
    </AdminLayout>
  );
}
