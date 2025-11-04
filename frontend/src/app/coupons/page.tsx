'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/templates/admin-layout';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import { apiClient } from '@/lib/api';
import type { CouponWithShop, CouponStatus, CouponListResponse } from '@hv-development/schemas';
import { useAuth } from '@/components/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import ToastContainer from '@/components/molecules/toast-container';
import Checkbox from '@/components/atoms/Checkbox';
import CouponBulkUpdateFooter from '@/components/molecules/coupon-bulk-update-footer';
import { convertCouponsToCSV, downloadCSV, generateFilename, type CouponForCSV } from '@/utils/csvExport';

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
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const isShopAccount = auth?.user?.accountType === 'shop';
  const isMerchantAccount = auth?.user?.accountType === 'merchant';
  const shopId = isShopAccount ? auth?.user?.shopId : undefined; // 店舗アカウントの場合は自身のshopIdを使用
  const merchantId = isMerchantAccount ? auth?.user?.merchantId : undefined; // 事業者アカウントの場合は自身のmerchantIdを使用
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

  // チェックボックス関連の状態
  const [selectedCoupons, setSelectedCoupons] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isIndeterminate, setIsIndeterminate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDownloadingCSV, setIsDownloadingCSV] = useState(false);

  // クーポン一覧の取得
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      
      // 店舗アカウントの場合
      if (shopId) {
        console.log('🔍 CouponsPage: Fetching coupons for shopId:', shopId);
        params.append('shopId', shopId);
      }
      
      // 事業者アカウントの場合
      if (merchantId) {
        console.log('🔍 CouponsPage: Fetching coupons for merchantId:', merchantId);
        params.append('merchantId', merchantId);
      }
      
      if (appliedSearchForm.couponName) {
        params.append('title', appliedSearchForm.couponName);
      }
      
      if (appliedStatusFilter !== 'all') {
        params.append('status', appliedStatusFilter);
      }

      const data: { coupons: CouponWithShop[]; pagination: PaginationData } = await apiClient.getCoupons(params.toString()) as { coupons: CouponWithShop[]; pagination: PaginationData };
      console.log('✅ CouponsPage: Coupons fetched:', data.coupons?.length || 0);
      setCoupons(data.coupons || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error('❌ CouponsPage: Failed to fetch coupons:', error);
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
  }, [shopId, merchantId, pagination.page, appliedSearchForm, appliedStatusFilter]);

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

  const handleStatusChange = async (couponId: string, status: string) => {
    // 元の状態を保存
    const originalCoupon = coupons.find(c => c.id === couponId);
    if (!originalCoupon) return;
    const originalStatus = originalCoupon.status;

    // UIを即座に更新（オプティミスティックアップデート）
    setCoupons(prevCoupons =>
      prevCoupons.map(coupon =>
        coupon.id === couponId ? { ...coupon, status: status as CouponStatus } : coupon
      )
    );

    // 非同期でAPIを呼び出し
    try {
      await apiClient.updateCouponStatus(couponId, { status: status as CouponStatus });
      showSuccess('ステータスを更新しました');
    } catch (error) {
      console.error('ステータスの更新に失敗しました:', error);
      // エラーが発生した場合は元の状態に戻す
      setCoupons(prevCoupons =>
        prevCoupons.map(coupon =>
          coupon.id === couponId ? { ...coupon, status: originalStatus } : coupon
        )
      );
      
      // エラーメッセージを取得
      let errorMessage = 'ステータスの更新に失敗しました';
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      showError(errorMessage);
    }
  };

  const handlePublicStatusChange = async (couponId: string, isPublic: boolean) => {
    // 元の状態を保存
    const originalCoupon = coupons.find(c => c.id === couponId);
    if (!originalCoupon) return;
    const originalIsPublic = originalCoupon.isPublic;

    // UIを即座に更新（オプティミスティックアップデート）
    setCoupons(prevCoupons =>
      prevCoupons.map(coupon =>
        coupon.id === couponId ? { ...coupon, isPublic } : coupon
      )
    );

    // 非同期でAPIを呼び出し
    try {
      await apiClient.updateCouponPublicStatus(couponId, { isPublic });
      showSuccess('公開ステータスを更新しました');
    } catch (error) {
      console.error('公開ステータスの更新に失敗しました:', error);
      // エラーが発生した場合は元の状態に戻す
      setCoupons(prevCoupons =>
        prevCoupons.map(coupon =>
          coupon.id === couponId ? { ...coupon, isPublic: originalIsPublic } : coupon
        )
      );
      
      // エラーメッセージを取得
      let errorMessage = '公開ステータスの更新に失敗しました';
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      showError(errorMessage);
    }
  };

  const _getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '申請中';
      case 'approved':
        return '承認済み';
      case 'suspended':
        return '停止中';
      default:
        return status;
    }
  };

  const _getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const _getStatusSelectColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-700';
      case 'approved':
        return 'text-green-700';
      case 'suspended':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  const _getPublicStatusSelectColor = (isPublic: boolean) => {
    if (isPublic) {
      return 'text-blue-700';
    } else {
      return 'text-red-700';
    }
  };

  // チェックボックス関連の関数
  useEffect(() => {
    const allCount = filteredCoupons.length;
    const selectedCount = selectedCoupons.size;
    setIsAllSelected(allCount > 0 && selectedCount === allCount);
    setIsIndeterminate(selectedCount > 0 && selectedCount < allCount);
  }, [selectedCoupons, filteredCoupons]);

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedCoupons(new Set(filteredCoupons.map(coupon => coupon.id)));
    } else {
      setSelectedCoupons(new Set());
    }
  };

  const handleToggleCoupon = (couponId: string, checked: boolean) => {
    const newSelected = new Set(selectedCoupons);
    if (checked) {
      newSelected.add(couponId);
    } else {
      newSelected.delete(couponId);
    }
    setSelectedCoupons(newSelected);
  };

  // 一括更新関数
  const handleBulkUpdateStatus = async (status: string) => {
    setIsUpdating(true);
    try {
      let successCount = 0;
      let failCount = 0;

      for (const couponId of selectedCoupons) {
        try {
          await apiClient.updateCouponStatus(couponId, { status: status as CouponStatus });
          successCount++;
        } catch (error) {
          console.error(`クーポン ${couponId} の更新に失敗:`, error);
          failCount++;
        }
      }

      if (successCount > 0) {
        showSuccess(`${successCount}件のステータスを更新しました`);
      }
      if (failCount > 0) {
        showError(`${failCount}件の更新に失敗しました`);
      }

      setSelectedCoupons(new Set());
      fetchCoupons();
    } catch (error) {
      console.error('一括更新に失敗しました:', error);
      showError('一括更新に失敗しました');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBulkUpdatePublicStatus = async (isPublic: boolean) => {
    setIsUpdating(true);
    try {
      let successCount = 0;
      let excludedCount = 0;
      let failCount = 0;

      for (const couponId of selectedCoupons) {
        const coupon = filteredCoupons.find(c => c.id === couponId);
        
        // 未承認のクーポンをチェック（全アカウント共通）
        const couponStatus = coupon?.status;
        if (coupon && couponStatus !== 'approved' && isPublic) {
          excludedCount++;
          continue;
        }

        try {
          await apiClient.updateCouponPublicStatus(couponId, { isPublic });
          successCount++;
        } catch (error) {
          console.error(`クーポン ${couponId} の更新に失敗:`, error);
          failCount++;
        }
      }

      if (excludedCount > 0) {
        showError(`${excludedCount}件の未承認クーポンは除外されました`);
      }
      if (successCount > 0) {
        showSuccess(`${successCount}件の公開ステータスを更新しました`);
      }
      if (failCount > 0) {
        showError(`${failCount}件の更新に失敗しました`);
      }

      setSelectedCoupons(new Set());
      fetchCoupons();
    } catch (error) {
      console.error('一括更新に失敗しました:', error);
      showError('一括更新に失敗しました');
    } finally {
      setIsUpdating(false);
    }
  };

  // 全データ取得関数（ページネーション対応、検索条件適用）
  const fetchAllCoupons = async (): Promise<CouponWithShop[]> => {
    const allCoupons: CouponWithShop[] = [];
    let page = 1;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      try {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        
        if (shopId) {
          params.append('shopId', shopId);
        }
        
        if (merchantId) {
          params.append('merchantId', merchantId);
        }
        
        if (appliedSearchForm.couponName) {
          params.append('title', appliedSearchForm.couponName);
        }
        
        if (appliedStatusFilter !== 'all') {
          params.append('status', appliedStatusFilter);
        }

        const data: { coupons: CouponWithShop[]; pagination: PaginationData } = await apiClient.getCoupons(params.toString()) as { coupons: CouponWithShop[]; pagination: PaginationData };
        
        const couponsArray = data.coupons || [];
        const paginationData = data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 };
        
        allCoupons.push(...couponsArray);

        const totalPages = paginationData.totalPages || 1;
        hasMore = page < totalPages;
        page++;

        if (couponsArray.length === 0) {
          hasMore = false;
        }
      } catch (error) {
        console.error('全データ取得中にエラーが発生しました:', error);
        throw error;
      }
    }

    return allCoupons;
  };

  // 全データをCSVダウンロード
  const handleDownloadAllCSV = async () => {
    try {
      setIsDownloadingCSV(true);
      
      const allCoupons = await fetchAllCoupons();
      
      const couponsForCSV: CouponForCSV[] = allCoupons.map((coupon) => ({
        merchantName: coupon.shop?.merchant?.name,
        shopName: coupon.shop?.name,
        title: coupon.title,
        status: coupon.status,
        isPublic: coupon.isPublic,
        createdAt: coupon.createdAt,
        updatedAt: coupon.updatedAt,
      }));

      const csvContent = convertCouponsToCSV(couponsForCSV, !shopId && !merchantId);
      const filename = generateFilename('coupons');
      downloadCSV(csvContent, filename);
      
      showSuccess(`${allCoupons.length}件のクーポンデータをCSVでダウンロードしました`);
    } catch (error: unknown) {
      console.error('CSVダウンロードに失敗しました:', error);
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      showError(`CSVダウンロードに失敗しました: ${errorMessage}`);
    } finally {
      setIsDownloadingCSV(false);
    }
  };

  // 選択レコードをCSVダウンロード
  const handleDownloadSelectedCSV = () => {
    try {
      if (selectedCoupons.size === 0) {
        showError('選択されているクーポンがありません');
        return;
      }

      const selectedCouponsData = filteredCoupons.filter((coupon) =>
        selectedCoupons.has(coupon.id)
      );

      const couponsForCSV: CouponForCSV[] = selectedCouponsData.map((coupon) => ({
        merchantName: coupon.shop?.merchant?.name,
        shopName: coupon.shop?.name,
        title: coupon.title,
        status: coupon.status,
        isPublic: coupon.isPublic,
        createdAt: coupon.createdAt,
        updatedAt: coupon.updatedAt,
      }));

      const csvContent = convertCouponsToCSV(couponsForCSV, !shopId && !merchantId);
      const filename = generateFilename('coupons_selected');
      downloadCSV(csvContent, filename);
      
      showSuccess(`${selectedCouponsData.length}件のクーポンデータをCSVでダウンロードしました`);
    } catch (error: unknown) {
      console.error('CSVダウンロードに失敗しました:', error);
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      showError(`CSVダウンロードに失敗しました: ${errorMessage}`);
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleDownloadAllCSV}
                disabled={isDownloadingCSV || filteredCoupons.length === 0}
                className="bg-white text-blue-600 border-blue-600 hover:bg-blue-50 cursor-pointer"
              >
                {isDownloadingCSV ? 'ダウンロード中...' : 'CSVダウンロード'}
              </Button>
              <Link href={shopId ? `/coupons/new?shopId=${shopId}` : '/coupons/new'}>
                <Button variant="outline" className="bg-white text-green-600 border-green-600 hover:bg-green-50">
                  <span className="mr-2">+</span>
                  新規作成
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isIndeterminate}
                      onChange={handleToggleAll}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    アクション
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  事業者名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    店舗名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                    クーポン名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                    承認ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                    公開ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[160px]">
                    作成日時
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    更新日時
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Checkbox
                        checked={selectedCoupons.has(coupon.id)}
                        onChange={(checked) => handleToggleCoupon(coupon.id, checked)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium min-w-[120px]">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/coupons/${coupon.id}/edit`}>
                          <button className="p-2.5 text-green-600 hover:text-green-800 rounded-lg transition-colors cursor-pointer flex items-center justify-center min-w-[44px] min-h-[44px]">
                            <Image src="/edit.svg" alt="編集" width={24} height={24} className="w-6 h-6 flex-shrink-0" />
                          </button>
                        </Link>
                        <Link href={`/coupons/${coupon.id}/history`}>
                          <button className="p-2.5 text-orange-600 hover:text-orange-800 rounded-lg transition-colors cursor-pointer flex items-center justify-center min-w-[44px] min-h-[44px]">
                            <Image src="/history.png" alt="利用履歴" width={24} height={24} className="w-6 h-6 flex-shrink-0" />
                          </button>
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{coupon.shop?.merchant?.name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{coupon.shop?.name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[200px]">
                      <div className="text-sm text-gray-900">{coupon.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[140px]">
                      {isMerchantAccount ? (
                        <span className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${_getStatusSelectColor(coupon.status)}`}>
                          {coupon.status === 'pending' ? '申請中' : coupon.status === 'approved' ? '承認済み' : '停止中'}
                        </span>
                      ) : (
                        <select
                          value={coupon.status}
                          onChange={(e) => handleStatusChange(coupon.id, e.target.value)}
                          className={`text-sm font-medium rounded-lg px-3 py-2 border border-gray-300 bg-white focus:ring-2 focus:ring-green-500 w-full min-w-[120px] ${_getStatusSelectColor(coupon.status)}`}
                        >
                          <option value="pending">申請中</option>
                          <option value="approved">承認済み</option>
                          <option value="suspended">停止中</option>
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[140px]">
                      <select
                        value={coupon.isPublic ? 'true' : 'false'}
                        onChange={(e) => handlePublicStatusChange(coupon.id, e.target.value === 'true')}
                        disabled={isMerchantAccount && coupon.status !== 'approved'}
                        className={`text-sm font-medium rounded-lg px-3 py-2 border border-gray-300 bg-white focus:ring-2 focus:ring-green-500 w-full min-w-[100px] ${_getPublicStatusSelectColor(coupon.isPublic)} ${isMerchantAccount && coupon.status !== 'approved' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <option value="true">公開中</option>
                        <option value="false">非公開</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[160px]">
                      <div className="text-sm text-gray-900">{new Date(coupon.createdAt).toLocaleString('ja-JP')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(coupon.updatedAt).toLocaleString('ja-JP')}</div>
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
      <CouponBulkUpdateFooter
        selectedCount={selectedCoupons.size}
        isAdminAccount={!isMerchantAccount && !isShopAccount}
        isMerchantAccount={isMerchantAccount}
        onBulkUpdateStatus={handleBulkUpdateStatus}
        onBulkUpdatePublicStatus={handleBulkUpdatePublicStatus}
        isUpdating={isUpdating}
        unapprovedCount={Array.from(selectedCoupons).filter(couponId => {
          const coupon = filteredCoupons.find(c => c.id === couponId);
          return coupon && coupon.status !== 'approved';
        }).length}
        onDownloadCSV={handleDownloadSelectedCSV}
      />
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </AdminLayout>
  );
}
