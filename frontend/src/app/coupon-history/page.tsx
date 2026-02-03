'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/templates/admin-layout';
import Icon from '@/components/atoms/Icon';
import Pagination from '@/components/molecules/Pagination';
import { useAuth } from '@/components/contexts/auth-context';
import CouponHistorySearchForm, { type CouponHistorySearchFormData } from '@/components/organisms/CouponHistorySearchForm';
import CouponHistoryTable from '@/components/organisms/CouponHistoryTable';
import { convertCouponUsagesToCSV, downloadCSV, generateFilename, type CouponUsageForCSV } from '@/utils/csvExport';
import { useToast } from '@/hooks/use-toast';
import ToastContainer from '@/components/molecules/toast-container';
import { apiClient } from '@/lib/api';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

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
  const displayName = auth?.user?.name ?? '—';
  const isSysAdmin = accountType === 'admin' && role === 'sysadmin';
  const isShopAccount = accountType === 'shop';

  const _shopId = isShopAccount ? auth?.user?.shopId : undefined;
  const lastFetchKeyRef = useRef<string | null>(null);
  const pathname = usePathname();
  const _router = useRouter(); // 将来的に使用予定
  const _params = useParams(); // 将来的に使用予定

  const [searchForm, setSearchForm] = useState<CouponHistorySearchFormData>({
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
  const [appliedSearchForm, setAppliedSearchForm] = useState<CouponHistorySearchFormData>({
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

  const [pageTitle, setPageTitle] = useState('クーポン利用履歴');
  const [usages, setUsages] = useState<CouponUsage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [_isFromCouponDetail, setIsFromCouponDetail] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isDownloadingCSV, setIsDownloadingCSV] = useState(false);
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

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
      page: pagination.page,
      limit: pagination.limit,
    });

    if (lastFetchKeyRef.current === key) {
      return;
    }

    lastFetchKeyRef.current = key;

    const fetchUsageHistory = async () => {
      setIsLoading(true);
      try {
        // セキュリティ改善：個人情報をクエリパラメータで送信しないため、POSTメソッドでボディに含めて送信
        const searchBody: Record<string, string | number> = {};

        // 遷移元に応じてパラメータを設定
        if (pathname.includes('/coupons/') && pathname.includes('/history')) {
          const couponId = pathname.split('/')[2];
          searchBody.couponId = couponId;
        } else if (pathname.includes('/users/') && pathname.includes('/coupon-history')) {
          const userId = pathname.split('/')[2];
          searchBody.userId = userId;
        }

        // 検索条件を追加
        if (appliedSearchForm.usageId) searchBody.usageId = appliedSearchForm.usageId;
        if (appliedSearchForm.couponId) searchBody.couponId = appliedSearchForm.couponId;
        if (appliedSearchForm.couponName) searchBody.couponName = appliedSearchForm.couponName;
        if (appliedSearchForm.shopName) searchBody.shopName = appliedSearchForm.shopName;
        if (appliedSearchForm.nickname && isSysAdmin) searchBody.nickname = appliedSearchForm.nickname;
        if (appliedSearchForm.email && isSysAdmin) searchBody.email = appliedSearchForm.email;
        if (appliedSearchForm.gender && isSysAdmin) searchBody.gender = appliedSearchForm.gender;
        if (appliedSearchForm.birthDate && isSysAdmin) searchBody.birthDate = appliedSearchForm.birthDate;
        if (appliedSearchForm.address && isSysAdmin) searchBody.address = appliedSearchForm.address;
        if (appliedSearchForm.usedDateStart) {
          const startDate = new Date(appliedSearchForm.usedDateStart);
          searchBody.usedAtStart = startDate.toISOString();
        }
        if (appliedSearchForm.usedDateEnd) {
          const endDate = new Date(appliedSearchForm.usedDateEnd);
          endDate.setHours(23, 59, 59, 999);
          searchBody.usedAtEnd = endDate.toISOString();
        }

        // ページネーションパラメータを追加
        searchBody.page = pagination.page;
        searchBody.limit = pagination.limit;

        const data = await apiClient.getCouponUsageHistory(searchBody) as {
          history: Array<{
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
          }>;
          pagination?: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
        };
        
        // デバッグログ
        console.log('🔍 API Response:', {
          historyCount: data.history?.length,
          pagination: data.pagination,
          rawData: data,
        });
        
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
          usedAt: item.usedAt,
        }));

        setUsages(formattedHistory);
        
        // ページネーション情報を更新
        console.log('🔍 Pagination update:', {
          hasPagination: !!data.pagination,
          total: data.pagination?.total,
          totalPages: data.pagination?.totalPages,
        });
        
        if (data.pagination) {
          setPagination(prev => {
            const newPagination = {
              ...prev,
              total: data.pagination?.total || 0,
              pages: data.pagination?.totalPages || 0,
            };
            console.log('🔍 New pagination state:', newPagination);
            return newPagination;
          });
        } else {
          console.warn('⚠️ No pagination data in response');
        }
      } catch (error) {
        console.error('利用履歴の取得に失敗しました:', error);
        setUsages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsageHistory();
  }, [pathname, appliedSearchForm, isSysAdmin, auth?.isLoading, auth?.user?.id, auth?.user?.email, pagination.page, pagination.limit]);

  useEffect(() => {
    // 遷移元を判定してページタイトルを設定
    if (pathname.includes('/coupons/') && pathname.includes('/history')) {
      setPageTitle('クーポン利用履歴');
      setIsFromCouponDetail(true);
    } else if (pathname.includes('/users/') && pathname.includes('/coupon-history')) {
      setPageTitle('クーポン利用履歴');
      setIsFromCouponDetail(false);
    } else if (pathname === '/coupon-history') {
      setPageTitle('クーポン利用履歴');
      setIsFromCouponDetail(false);
    }
  }, [pathname]);

  const handleInputChange = useCallback((field: keyof CouponHistorySearchFormData, value: string) => {
    setSearchForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSearch = useCallback(() => {
    // 検索フォームの内容を適用済み検索フォームにコピーして検索実行
    setAppliedSearchForm({ ...searchForm });
    // ページを1にリセット
    setPagination(prev => ({ ...prev, page: 1 }));
    // キャッシュをリセットして強制的に再フェッチ
    lastFetchKeyRef.current = null;
  }, [searchForm]);

  const handleClear = useCallback(() => {
    const emptyForm: CouponHistorySearchFormData = {
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
    };
    setSearchForm(emptyForm);
    setAppliedSearchForm(emptyForm);
    // ページを1にリセット
    setPagination(prev => ({ ...prev, page: 1 }));
    // キャッシュをリセットして強制的に再フェッチ
    lastFetchKeyRef.current = null;
  }, []);

  // ページ変更ハンドラー
  const handlePageChange = useCallback((page: number) => {
    if (isLoading) return;
    setPagination(prev => ({ ...prev, page }));
  }, [isLoading]);

  // 全データ取得関数（ページネーション対応、検索条件適用）
  const fetchAllCouponUsages = async (): Promise<CouponUsage[]> => {
    const allUsages: CouponUsage[] = [];
    let page = 1;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      try {
        // セキュリティ改善：個人情報をクエリパラメータで送信しないため、POSTメソッドでボディに含めて送信
        const searchBody: Record<string, string | number> = {};

        // 遷移元に応じてパラメータを設定
        if (pathname.includes('/coupons/') && pathname.includes('/history')) {
          const couponId = pathname.split('/')[2];
          searchBody.couponId = couponId;
        } else if (pathname.includes('/users/') && pathname.includes('/coupon-history')) {
          const userId = pathname.split('/')[2];
          searchBody.userId = userId;
        }

        // 検索条件を追加
        if (appliedSearchForm.usageId) searchBody.usageId = appliedSearchForm.usageId;
        if (appliedSearchForm.couponId) searchBody.couponId = appliedSearchForm.couponId;
        if (appliedSearchForm.couponName) searchBody.couponName = appliedSearchForm.couponName;
        if (appliedSearchForm.shopName) searchBody.shopName = appliedSearchForm.shopName;
        if (appliedSearchForm.nickname && isSysAdmin) searchBody.nickname = appliedSearchForm.nickname;
        if (appliedSearchForm.email && isSysAdmin) searchBody.email = appliedSearchForm.email;
        if (appliedSearchForm.gender && isSysAdmin) searchBody.gender = appliedSearchForm.gender;
        if (appliedSearchForm.birthDate && isSysAdmin) searchBody.birthDate = appliedSearchForm.birthDate;
        if (appliedSearchForm.address && isSysAdmin) searchBody.address = appliedSearchForm.address;
        if (appliedSearchForm.usedDateStart) {
          const startDate = new Date(appliedSearchForm.usedDateStart);
          searchBody.usedAtStart = startDate.toISOString();
        }
        if (appliedSearchForm.usedDateEnd) {
          const endDate = new Date(appliedSearchForm.usedDateEnd);
          endDate.setHours(23, 59, 59, 999);
          searchBody.usedAtEnd = endDate.toISOString();
        }

        // ページネーションパラメータを追加（数値として送信）
        searchBody.page = page;
        searchBody.limit = limit;

        const data = await apiClient.getCouponUsageHistory(searchBody) as {
          history?: Array<{
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
          }>; pagination?: { totalPages?: number; total?: number }
        };

        if (!data) {
          throw new Error('APIレスポンスが空です');
        }

        if (!data.history) {
          throw new Error('APIレスポンスにhistoryプロパティがありません');
        }

        if (!Array.isArray(data.history)) {
          throw new Error('APIレスポンスのhistoryが配列ではありません');
        }

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
          usedAt: item.usedAt,
        }));

        allUsages.push(...formattedHistory);

        const paginationData = data.pagination || {};
        const totalPages = paginationData.totalPages || 1;
        hasMore = page < totalPages;
        page++;

        if (formattedHistory.length === 0) {
          hasMore = false;
        }
      } catch (err) {
        console.error('全データ取得中にエラーが発生しました:', err);
        // より詳細なエラーメッセージを生成
        let errorMessage = 'データの取得に失敗しました';
        if (err instanceof Error) {
          errorMessage = err.message || errorMessage;
          // レスポンス情報がある場合は追加
          if ((err as Error & { response?: { status: number; data: unknown } }).response) {
            const response = (err as Error & { response?: { status: number; data: unknown } }).response;
            if (response?.status) {
              errorMessage = `${errorMessage} (HTTP ${response.status})`;
            }
            if (response?.data && typeof response.data === 'object' && 'message' in response.data) {
              errorMessage = `${errorMessage}: ${(response.data as { message: string }).message}`;
            }
          }
        }
        throw new Error(errorMessage);
      }
    }

    return allUsages;
  };

  // 全データをCSVダウンロード
  const handleDownloadAllCSV = useCallback(async () => {
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
    } catch (err: unknown) {
      console.error('CSVダウンロードに失敗しました:', err);
      let errorMessage = '不明なエラー';
      if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      showError(`CSVダウンロードに失敗しました: ${errorMessage}`);
    } finally {
      setIsDownloadingCSV(false);
    }
  }, [pathname, appliedSearchForm, isSysAdmin, showSuccess, showError]);

  const shouldShowSearchForm = !(pathname.includes('/coupons/') && pathname.includes('/history')) &&
    !(pathname.includes('/users/') && pathname.includes('/coupon-history')) &&
    !isShopAccount;

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
                <span className="font-medium text-gray-900">{displayName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 検索フォーム（クーポン詳細からの遷移時または店舗アカウントの場合は非表示） */}
        {shouldShowSearchForm && (
          <CouponHistorySearchForm
            searchForm={searchForm}
            isSearchExpanded={isSearchExpanded}
            isSysAdmin={isSysAdmin}
            onInputChange={handleInputChange}
            onSearch={handleSearch}
            onClear={handleClear}
            onToggleExpand={() => setIsSearchExpanded(!isSearchExpanded)}
          />
        )}

        {/* ページネーション */}
        {pagination.pages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={handlePageChange}
            disabled={isLoading}
          />
        )}

        {/* クーポン利用履歴一覧 */}
        <CouponHistoryTable
          usages={usages}
          isLoading={isLoading}
          isSysAdmin={isSysAdmin}
          isDownloadingCSV={isDownloadingCSV}
          pathname={pathname}
          total={pagination.total}
          onDownloadAllCSV={handleDownloadAllCSV}
        />
      </div>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </AdminLayout>
  );
}
