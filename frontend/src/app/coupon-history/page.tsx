'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/templates/admin-layout';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import { useAuth } from '@/components/contexts/auth-context';
import { convertCouponUsagesToCSV, downloadCSV, generateFilename, type CouponUsageForCSV } from '@/utils/csvExport';
import { useToast } from '@/hooks/use-toast';
import ToastContainer from '@/components/molecules/toast-container';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

// TODO: 将来的にAPIから取得する際は、この型定義を@hv-development/schemasに追加して共通化
// CouponUsage型はschemasに未定義のため、現在はローカルで定義

interface CouponUsage {
  id: string;
  usageId: string;
  couponId: string;
  couponName: string;
  shopId: string;
  shopName: string;
  nickname?: string;
  email?: string;
  gender?: string;
  birthDate?: string;
  address?: string;
  usedAt: string;
}

export default function CouponHistoryPage() {
  const auth = useAuth();
  const accountType = auth?.user?.accountType;
  const role = auth?.user?.role;
  const isSysAdmin = accountType === 'admin' && role === 'sysadmin';
  const isShopAccount = accountType === 'shop';
  
  const _shopId = isShopAccount ? auth?.user?.shopId : undefined;
  const lastFetchKeyRef = useRef<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const _params = useParams(); // 将来的に使用予定
  
  const [searchForm, setSearchForm] = useState({
    usageId: '',
    couponId: '',
    couponName: '',
    shopName: '',
    nickname: '',
    email: '',
    gender: '',
    birthDate: '',
    address: '',
    usedDateStart: '',
    usedDateEnd: '',
  });
  const [appliedSearchForm, setAppliedSearchForm] = useState({
    usageId: '',
    couponId: '',
    couponName: '',
    shopName: '',
    nickname: '',
    email: '',
    gender: '',
    birthDate: '',
    address: '',
    usedDateStart: '',
    usedDateEnd: '',
  });

  const [showBackButton, setShowBackButton] = useState(false);
  const [backUrl, setBackUrl] = useState('');
  const [pageTitle, setPageTitle] = useState('クーポン利用履歴');
  const [usages, setUsages] = useState<CouponUsage[]>([]);
  const [filteredUsages, setFilteredUsages] = useState<CouponUsage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [_isFromCouponDetail, setIsFromCouponDetail] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isDownloadingCSV, setIsDownloadingCSV] = useState(false);
  const { toasts, removeToast, showSuccess, showError } = useToast();

  // APIからデータを取得
  useEffect(() => {
     // authがロードされるまで待機
     if (auth?.isLoading) {
       return;
     }
 
    const key = JSON.stringify({
      pathname,
      search: appliedSearchForm,
      isSysAdmin,
      user: auth?.user?.id ?? auth?.user?.email ?? 'anonymous',
    });

    if (lastFetchKeyRef.current === key) {
      return;
    }

    lastFetchKeyRef.current = key;

    const fetchUsageHistory = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        
        // 遷移元に応じてクエリパラメータを設定
        if (pathname.includes('/coupons/') && pathname.includes('/history')) {
          const couponId = pathname.split('/')[2];
          queryParams.append('couponId', couponId);
        } else if (pathname.includes('/users/') && pathname.includes('/coupon-history')) {
          const userId = pathname.split('/')[2];
          queryParams.append('userId', userId);
        }

        // 検索条件を追加
        if (appliedSearchForm.usageId) queryParams.append('usageId', appliedSearchForm.usageId);
        if (appliedSearchForm.couponId) queryParams.append('couponId', appliedSearchForm.couponId);
        if (appliedSearchForm.couponName) queryParams.append('couponName', appliedSearchForm.couponName);
        if (appliedSearchForm.shopName) queryParams.append('shopName', appliedSearchForm.shopName);
        if (appliedSearchForm.nickname && isSysAdmin) queryParams.append('nickname', appliedSearchForm.nickname);
        if (appliedSearchForm.email && isSysAdmin) queryParams.append('email', appliedSearchForm.email);
        if (appliedSearchForm.gender && isSysAdmin) queryParams.append('gender', appliedSearchForm.gender);
        if (appliedSearchForm.birthDate && isSysAdmin) queryParams.append('birthDate', appliedSearchForm.birthDate);
        if (appliedSearchForm.address && isSysAdmin) queryParams.append('address', appliedSearchForm.address);
        if (appliedSearchForm.usedDateStart) {
          const startDate = new Date(appliedSearchForm.usedDateStart);
          queryParams.append('usedAtStart', startDate.toISOString());
        }
        if (appliedSearchForm.usedDateEnd) {
          const endDate = new Date(appliedSearchForm.usedDateEnd);
          endDate.setHours(23, 59, 59, 999);
          queryParams.append('usedAtEnd', endDate.toISOString());
        }

        const response = await fetch(`/api/admin/coupon-usage-history?${queryParams.toString()}`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          let errorData: { message?: string; error?: { message?: string } } | null = null;
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            try {
              errorData = await response.json();
            } catch (_e) {
              errorData = { message: 'Failed to parse JSON response' };
            }
          } else {
            const text = await response.text().catch(() => '');
            errorData = { message: text || `HTTP ${response.status} ${response.statusText}` };
          }
          console.error('利用履歴取得エラー:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
          });
          throw new Error(errorData?.message || errorData?.error?.message || `Failed to fetch usage history (${response.status})`);
        }
        
        const data = await response.json() as { history: Array<{
          id: string;
          usageId?: string;
          couponId: string;
          couponName: string;
          shopId: string;
          shopName: string;
          nickname?: string;
          email?: string;
          gender?: string;
          birthDate?: string;
          address?: string;
          usedAt: string;
        }> };
        const formattedHistory = data.history.map((item) => ({
          id: item.id,
          usageId: item.usageId || item.id,
          couponId: item.couponId,
          couponName: item.couponName,
          shopId: item.shopId,
          shopName: item.shopName,
          nickname: item.nickname,
          email: item.email,
          gender: item.gender,
          birthDate: item.birthDate,
          address: item.address,
          usedAt: new Date(item.usedAt).toLocaleString('ja-JP'),
        }));
        
        setUsages(formattedHistory);
        setFilteredUsages(formattedHistory);
      } catch (error) {
        console.error('利用履歴の取得に失敗しました:', error);
        setUsages([]);
        setFilteredUsages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsageHistory();
  }, [pathname, appliedSearchForm, isSysAdmin, auth?.isLoading, auth?.user?.id, auth?.user?.email]);

  useEffect(() => {
    // 遷移元を判定して戻るボタンの表示を制御
    if (pathname.includes('/coupons/') && pathname.includes('/history')) {
      // クーポン詳細からの遷移
      const couponId = pathname.split('/')[2];
      setShowBackButton(true);
      setBackUrl(`/coupons/${couponId}`);
      setPageTitle('クーポン利用履歴');
      setIsFromCouponDetail(true);
    } else if (pathname.includes('/users/') && pathname.includes('/coupon-history')) {
      // ユーザー詳細からの遷移
      const userId = pathname.split('/')[2];
      setShowBackButton(true);
      setBackUrl(`/users/${userId}`);
      setPageTitle('クーポン利用履歴');
      setIsFromCouponDetail(false);
    } else if (pathname === '/coupon-history') {
      // クーポン一覧またはユーザー一覧からの遷移（referrerで判定）
      setShowBackButton(true);
      setBackUrl('/coupons'); // デフォルトはクーポン一覧
      setPageTitle(isShopAccount ? 'クーポン利用履歴' : 'クーポン利用履歴');
      setIsFromCouponDetail(false);
    }
  }, [pathname, isShopAccount]);

  // 検索条件の変更時にフィルタリング（クライアント側の追加フィルタリング）
  useEffect(() => {
    // APIから取得したデータをフィルタリング
    const filtered = usages.filter((usage) => {
      const matchesSearch = 
        (appliedSearchForm.usageId === '' || usage.id.toLowerCase().includes(appliedSearchForm.usageId.toLowerCase())) &&
        (appliedSearchForm.couponId === '' || usage.couponId.toLowerCase().includes(appliedSearchForm.couponId.toLowerCase())) &&
        (appliedSearchForm.couponName === '' || usage.couponName.toLowerCase().includes(appliedSearchForm.couponName.toLowerCase())) &&
        (appliedSearchForm.shopName === '' || usage.shopName.toLowerCase().includes(appliedSearchForm.shopName.toLowerCase())) &&
        (!appliedSearchForm.nickname || !usage.nickname || usage.nickname.toLowerCase().includes(appliedSearchForm.nickname.toLowerCase())) &&
        (!appliedSearchForm.email || !usage.email || usage.email.toLowerCase().includes(appliedSearchForm.email.toLowerCase())) &&
        (!appliedSearchForm.gender || !usage.gender || usage.gender === appliedSearchForm.gender) &&
        (!appliedSearchForm.birthDate || !usage.birthDate || usage.birthDate === appliedSearchForm.birthDate) &&
        (!appliedSearchForm.address || !usage.address || usage.address.toLowerCase().includes(appliedSearchForm.address.toLowerCase()));
      
      return matchesSearch;
    });
    
    setFilteredUsages(filtered);
  }, [usages, appliedSearchForm]);

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
      usageId: '',
      couponId: '',
      couponName: '',
      shopName: '',
      nickname: '',
      email: '',
      gender: '',
      birthDate: '',
      address: '',
      usedDateStart: '',
      usedDateEnd: '',
    });
    setAppliedSearchForm({
      usageId: '',
      couponId: '',
      couponName: '',
      shopName: '',
      nickname: '',
      email: '',
      gender: '',
      birthDate: '',
      address: '',
      usedDateStart: '',
      usedDateEnd: '',
    });
  };

  const _handleBack = () => {
    router.push(backUrl);
  };

  const getGenderLabel = (gender?: string) => {
    if (!gender) return '未回答';
    switch (gender) {
      case 'male':
        return '男性';
      case 'female':
        return '女性';
      case 'other':
        return 'その他';
      default:
    return '未回答';
  }
};

  // 全データ取得関数（ページネーション対応、検索条件適用）
  const fetchAllCouponUsages = async (): Promise<CouponUsage[]> => {
    const allUsages: CouponUsage[] = [];
    let page = 1;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      try {
        const queryParams = new URLSearchParams();
        
        // 遷移元に応じてクエリパラメータを設定
        if (pathname.includes('/coupons/') && pathname.includes('/history')) {
          const couponId = pathname.split('/')[2];
          queryParams.append('couponId', couponId);
        } else if (pathname.includes('/users/') && pathname.includes('/coupon-history')) {
          const userId = pathname.split('/')[2];
          queryParams.append('userId', userId);
        }

        // 検索条件を追加
        if (appliedSearchForm.usageId) queryParams.append('usageId', appliedSearchForm.usageId);
        if (appliedSearchForm.couponId) queryParams.append('couponId', appliedSearchForm.couponId);
        if (appliedSearchForm.couponName) queryParams.append('couponName', appliedSearchForm.couponName);
        if (appliedSearchForm.shopName) queryParams.append('shopName', appliedSearchForm.shopName);
        if (appliedSearchForm.nickname && isSysAdmin) queryParams.append('nickname', appliedSearchForm.nickname);
        if (appliedSearchForm.email && isSysAdmin) queryParams.append('email', appliedSearchForm.email);
        if (appliedSearchForm.gender && isSysAdmin) queryParams.append('gender', appliedSearchForm.gender);
        if (appliedSearchForm.birthDate && isSysAdmin) queryParams.append('birthDate', appliedSearchForm.birthDate);
        if (appliedSearchForm.address && isSysAdmin) queryParams.append('address', appliedSearchForm.address);
        if (appliedSearchForm.usedDateStart) {
          const startDate = new Date(appliedSearchForm.usedDateStart);
          queryParams.append('usedAtStart', startDate.toISOString());
        }
        if (appliedSearchForm.usedDateEnd) {
          const toDate = new Date(appliedSearchForm.usedDateEnd);
          toDate.setHours(23, 59, 59, 999);
          queryParams.append('usedAtEnd', toDate.toISOString());
        }
        
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());

        const response = await fetch(`/api/admin/coupon-usage-history?${queryParams.toString()}`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('クーポン利用履歴の取得に失敗しました');
        }
        
        const data = await response.json() as { history: Array<{
          id: string;
          usageId?: string;
          couponId: string;
          couponName: string;
          shopId: string;
          shopName: string;
          nickname?: string;
          email?: string;
          gender?: string;
          birthDate?: string;
          address?: string;
          usedAt: string;
        }>; pagination?: { totalPages?: number; total?: number } };
        
        const formattedHistory = data.history.map((item) => ({
          id: item.id,
          usageId: item.usageId || item.id,
          couponId: item.couponId,
          couponName: item.couponName,
          shopId: item.shopId,
          shopName: item.shopName,
          nickname: item.nickname,
          email: item.email,
          gender: item.gender,
          birthDate: item.birthDate,
          address: item.address,
          usedAt: new Date(item.usedAt).toLocaleString('ja-JP'),
        }));
        
        allUsages.push(...formattedHistory);

        const pagination = data.pagination || {};
        const totalPages = pagination.totalPages || 1;
        hasMore = page < totalPages;
        page++;

        if (formattedHistory.length === 0) {
          hasMore = false;
        }
      } catch (error) {
        console.error('全データ取得中にエラーが発生しました:', error);
        throw error;
      }
    }

    // フロントエンドのフィルタリングを適用
    return allUsages.filter((usage) => {
      const matchesSearch = 
        (appliedSearchForm.usageId === '' || usage.id.toLowerCase().includes(appliedSearchForm.usageId.toLowerCase())) &&
        (appliedSearchForm.couponId === '' || usage.couponId.toLowerCase().includes(appliedSearchForm.couponId.toLowerCase())) &&
        (appliedSearchForm.couponName === '' || usage.couponName.toLowerCase().includes(appliedSearchForm.couponName.toLowerCase())) &&
        (appliedSearchForm.shopName === '' || usage.shopName.toLowerCase().includes(appliedSearchForm.shopName.toLowerCase())) &&
        (!appliedSearchForm.nickname || !usage.nickname || usage.nickname.toLowerCase().includes(appliedSearchForm.nickname.toLowerCase())) &&
        (!appliedSearchForm.email || !usage.email || usage.email.toLowerCase().includes(appliedSearchForm.email.toLowerCase())) &&
        (!appliedSearchForm.gender || !usage.gender || usage.gender === appliedSearchForm.gender) &&
        (!appliedSearchForm.birthDate || !usage.birthDate || usage.birthDate === appliedSearchForm.birthDate) &&
        (!appliedSearchForm.address || !usage.address || usage.address.toLowerCase().includes(appliedSearchForm.address.toLowerCase()));
      
      return matchesSearch;
    });
  };

  // 全データをCSVダウンロード
  const handleDownloadAllCSV = async () => {
    try {
      setIsDownloadingCSV(true);
      
      const allUsages = await fetchAllCouponUsages();
      
      // クーポン情報を含めるかどうかを判定
      const includeCouponInfo = !(pathname.includes('/coupons/') && pathname.includes('/history')) && !(pathname.includes('/users/') && pathname.includes('/coupon-history'));
      
      const usagesForCSV: CouponUsageForCSV[] = allUsages.map((usage) => ({
        id: usage.id,
        couponId: includeCouponInfo ? usage.couponId : undefined,
        couponName: includeCouponInfo ? usage.couponName : undefined,
        shopName: usage.shopName,
        email: usage.email,
        nickname: usage.nickname,
        gender: usage.gender,
        birthDate: usage.birthDate,
        address: usage.address,
        usedAt: usage.usedAt,
      }));

      const csvContent = convertCouponUsagesToCSV(usagesForCSV, isSysAdmin, includeCouponInfo);
      const filename = generateFilename('coupon_usage_history');
      downloadCSV(csvContent, filename);
      
      showSuccess(`${allUsages.length}件のクーポン利用履歴データをCSVでダウンロードしました`);
    } catch (error: unknown) {
      console.error('CSVダウンロードに失敗しました:', error);
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      showError(`CSVダウンロードに失敗しました: ${errorMessage}`);
    } finally {
      setIsDownloadingCSV(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-gray-600">
              {pathname.includes('/coupons/') && pathname.includes('/history') 
                ? 'このクーポンの利用履歴を表示します' 
                : pathname.includes('/users/') && pathname.includes('/coupon-history')
                ? 'このユーザーが使用したクーポンの利用履歴を表示します'
                : (isShopAccount ? '自身の店舗のクーポン利用履歴を管理します' : 'クーポンの利用履歴を管理します')}
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

        {/* 検索フォーム（クーポン詳細からの遷移時または店舗アカウントの場合は簡略化） */}
        {!(pathname.includes('/coupons/') && pathname.includes('/history')) && !(pathname.includes('/users/') && pathname.includes('/coupon-history')) && !isShopAccount && (
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
            {/* 利用ID */}
            <div>
              <label htmlFor="usageId" className="block text-sm font-medium text-gray-700 mb-2">
                利用ID
              </label>
              <input
                type="text"
                id="usageId"
                placeholder="利用IDを入力"
                value={searchForm.usageId}
                onChange={(e) => handleInputChange('usageId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

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

            {/* 店舗名 */}
            <div>
              <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-2">
                店舗名
              </label>
              <input
                type="text"
                id="shopName"
                placeholder="店舗名を入力"
                value={searchForm.shopName}
                onChange={(e) => handleInputChange('shopName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* ニックネーム（sysadmin権限のみ） */}
            {isSysAdmin && (
              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
                  ニックネーム
                </label>
                <input
                  type="text"
                  id="nickname"
                  placeholder="ニックネームを入力"
                  value={searchForm.nickname}
                  onChange={(e) => handleInputChange('nickname', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            )}

            {/* メールアドレス（sysadmin権限のみ） */}
            {isSysAdmin && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス
                </label>
                <input
                  type="text"
                  id="email"
                  placeholder="メールアドレスを入力"
                  value={searchForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            )}

            {/* 性別（sysadmin権限のみ） */}
            {isSysAdmin && (
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                  性別
                </label>
                <select
                  id="gender"
                  value={searchForm.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">すべて</option>
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                  <option value="other">その他</option>
                </select>
              </div>
            )}

            {/* 生年月日（sysadmin権限のみ） */}
            {isSysAdmin && (
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
                  生年月日
                </label>
                <input
                  type="date"
                  id="birthDate"
                  value={searchForm.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            )}

            {/* 住所（sysadmin権限のみ） */}
            {isSysAdmin && (
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  住所
                </label>
                <input
                  type="text"
                  id="address"
                  placeholder="住所を入力"
                  value={searchForm.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            )}
          </div>

          {/* 利用日範囲指定 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              利用日（範囲指定）
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="usedDateStart" className="block text-xs text-gray-500 mb-1">
                  開始日
                </label>
                <input
                  type="date"
                  id="usedDateStart"
                  value={searchForm.usedDateStart}
                  onChange={(e) => handleInputChange('usedDateStart', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label htmlFor="usedDateEnd" className="block text-xs text-gray-500 mb-1">
                  終了日
                </label>
                <input
                  type="date"
                  id="usedDateEnd"
                  value={searchForm.usedDateEnd}
                  onChange={(e) => handleInputChange('usedDateEnd', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
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

        {/* クーポン利用履歴一覧（クーポン詳細からの遷移時は表示項目を調整） */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              {pathname.includes('/coupons/') && pathname.includes('/history') 
                ? 'クーポン利用履歴' 
                : pathname.includes('/users/') && pathname.includes('/coupon-history')
                ? 'クーポン利用履歴'
                : 'クーポン利用履歴一覧'} ({filteredUsages.length}件)
            </h3>
            <Button
              variant="outline"
              onClick={handleDownloadAllCSV}
              disabled={isDownloadingCSV || filteredUsages.length === 0}
              className="bg-white text-blue-600 border-blue-600 hover:bg-blue-50 cursor-pointer"
            >
              {isDownloadingCSV ? 'ダウンロード中...' : 'CSVダウンロード'}
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    クーポン利用ID
                  </th>
                  {!(pathname.includes('/coupons/') && pathname.includes('/history')) && !(pathname.includes('/users/') && pathname.includes('/coupon-history')) && (
                    <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    クーポンID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    クーポン名
                  </th>
                    </>
                  )}
                  {(pathname.includes('/coupons/') && pathname.includes('/history')) || (pathname.includes('/users/') && pathname.includes('/coupon-history')) ? (
                    <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    クーポンID
                  </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      クーポン名
                    </th>
                    </>
                  ) : null}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    店舗名
                  </th>
                  {isSysAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    メールアドレス
                    </th>
                  )}
                  {isSysAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    ニックネーム
                    </th>
                  )}
                  {isSysAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    性別
                    </th>
                  )}
                  {isSysAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    生年月日
                    </th>
                  )}
                  {isSysAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    住所
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    利用日時
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsages.map((usage) => (
                  <tr key={usage.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{usage.id}</div>
                    </td>
                    {!(pathname.includes('/coupons/') && pathname.includes('/history')) && !(pathname.includes('/users/') && pathname.includes('/coupon-history')) && (
                      <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{usage.couponId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{usage.couponName}</div>
                    </td>
                      </>
                    )}
                    {(pathname.includes('/coupons/') && pathname.includes('/history')) || (pathname.includes('/users/') && pathname.includes('/coupon-history')) ? (
                      <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{usage.couponId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{usage.couponName}</div>
                      </td>
                      </>
                    ) : null}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{usage.shopName}</div>
                    </td>
                    {isSysAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{usage.email || '-'}</div>
                      </td>
                    )}
                    {isSysAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{usage.nickname || '-'}</div>
                      </td>
                    )}
                    {isSysAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getGenderLabel(usage.gender)}</div>
                      </td>
                    )}
                    {isSysAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{usage.birthDate || '-'}</div>
                      </td>
                    )}
                    {isSysAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{usage.address || '-'}</div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{usage.usedAt}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-500">データを読み込み中...</p>
            </div>
          )}

          {!isLoading && filteredUsages.length === 0 && (
            <div className="text-center py-12">
              <Icon name="history" size="lg" className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">利用履歴が見つかりません</h3>
              <p className="text-gray-500">検索条件を変更してお試しください。</p>
            </div>
          )}
        </div>

        {/* 戻るボタン（画面下部） */}
        {showBackButton && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="lg"
              onClick={_handleBack}
              className="px-8"
            >
              戻る
            </Button>
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </AdminLayout>
  );
}
