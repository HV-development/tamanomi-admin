'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import AdminLayout from '@/components/templates/admin-layout';
import Button from '@/components/atoms/Button';
import ToastContainer from '@/components/molecules/toast-container';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { statusLabels, statusOptions } from '@/lib/constants/shop';
import type { Shop } from '@hv-development/schemas';
import { useAuth } from '@/components/contexts/auth-context';
import Checkbox from '@/components/atoms/Checkbox';
import FloatingFooter from '@/components/molecules/floating-footer';
import { convertShopsToCSV, downloadCSV, generateFilename, type ShopForCSV } from '@/utils/csvExport';

function ShopsPageContent() {
  const auth = useAuth();
  const searchParams = useSearchParams();
  const isMerchantAccount = auth?.user?.accountType === 'merchant';
  const isShopAccount = auth?.user?.accountType === 'shop';
  const [merchantId, setMerchantId] = useState<string | undefined>(undefined);
  const [merchantName, setMerchantName] = useState<string>('');
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toasts, removeToast, showSuccess, showError } = useToast();
  
  // URLパラメータからmerchantIdを取得
  useEffect(() => {
    const urlMerchantId = searchParams?.get('merchantId');
    if (urlMerchantId) {
      setMerchantId(urlMerchantId);
    }
  }, [searchParams]);
  
  // 検索フォームの状態（拡張版）
  const [searchForm, setSearchForm] = useState({
    keyword: '',
    merchantName: '',
    merchantNameKana: '',
    name: '',
    nameKana: '',
    phone: '',
    accountEmail: '',
    postalCode: '',
    prefecture: '',
    address: '',
    status: 'all' as 'all' | 'registering' | 'collection_requested' | 'approval_pending' | 'promotional_materials_preparing' | 'promotional_materials_shipping' | 'operating' | 'suspended' | 'terminated',
    createdAtFrom: '',
    createdAtTo: '',
    updatedAtFrom: '',
    updatedAtTo: '',
  });
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  
  // URLパラメータから検索条件を読み込んで検索フォームに反映
  useEffect(() => {
    if (!searchParams) return;
    
    const newSearchForm = {
      keyword: searchParams.get('keyword') || '',
      merchantName: searchParams.get('merchantName') || '',
      merchantNameKana: searchParams.get('merchantNameKana') || '',
      name: searchParams.get('name') || '',
      nameKana: searchParams.get('nameKana') || '',
      phone: searchParams.get('phone') || '',
      accountEmail: searchParams.get('accountEmail') || '',
      postalCode: searchParams.get('postalCode') || '',
      prefecture: searchParams.get('prefecture') || '',
      address: searchParams.get('address') || '',
      status: (searchParams.get('status') || 'all') as 'all' | 'registering' | 'collection_requested' | 'approval_pending' | 'promotional_materials_preparing' | 'promotional_materials_shipping' | 'operating' | 'suspended' | 'terminated',
      createdAtFrom: searchParams.get('createdAtFrom') || '',
      createdAtTo: searchParams.get('createdAtTo') || '',
      updatedAtFrom: searchParams.get('updatedAtFrom') || '',
      updatedAtTo: searchParams.get('updatedAtTo') || '',
    };
    
    setSearchForm(newSearchForm);
    
    // 検索条件がある場合、検索フォームを展開して表示
    const hasSearchParams = Object.values(newSearchForm).some(value => value && value !== 'all');
    if (hasSearchParams) {
      setIsSearchExpanded(true);
    }
  }, [searchParams]);
  const [searchErrors, setSearchErrors] = useState({
    createdAtFrom: '',
    createdAtTo: '',
    updatedAtFrom: '',
    updatedAtTo: '',
  });

  // チェックボックス関連の状態を追加
  const [selectedShops, setSelectedShops] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isIndeterminate, setIsIndeterminate] = useState(false);
  const [isDownloadingCSV, setIsDownloadingCSV] = useState(false);

  // 事業者アカウントの場合、自分の事業者IDを取得
  useEffect(() => {
    const fetchMyMerchant = async () => {
      // 認証情報がロード中の場合は待機
      if (auth?.isLoading) {
        return;
      }
      
      if (isMerchantAccount) {
        try {
          const data = await apiClient.getMyMerchant();
          if (data && typeof data === 'object' && 'data' in data && data.data) {
            const merchantData = data.data as { id: string; name: string };
            setMerchantId(merchantData.id);
            setMerchantName(merchantData.name);
          }
        } catch (error) {
          console.error('事業者情報の取得に失敗しました:', error);
        }
      }
    };

    fetchMyMerchant();
  }, [isMerchantAccount, auth?.isLoading]);

  // 店舗アカウントの場合、自身の店舗情報のみを取得
  useEffect(() => {
    const fetchMyShop = async () => {
      // 認証情報がロード中の場合は待機
      if (auth?.isLoading) {
        console.log('🔄 ShopsPage: Auth is loading, waiting...');
        return;
      }
      
      console.log('🔍 ShopsPage: Checking shop account', { 
        isShopAccount, 
        hasUser: !!auth?.user 
      });
      
      if (isShopAccount) {
        try {
          setIsLoading(true);
          const shopData = await apiClient.getMyShop() as Shop;
          setShops([shopData]);
          setIsLoading(false);
        } catch (error) {
          console.error('店舗情報の取得に失敗しました:', error);
          setError('店舗情報の取得に失敗しました');
          setIsLoading(false);
        }
      }
    };

    fetchMyShop();
  }, [isShopAccount, auth?.isLoading]);

  // shops state の変更を監視
  useEffect(() => {
    console.log('🔄 ShopsPage: shops state updated:', { 
      shopsLength: shops.length, 
      shops,
      isShopAccount 
    });
  }, [shops, isShopAccount]);

  // データ取得（検索条件を含む）
  const fetchShops = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 検索パラメータの構築
      const queryParams = new URLSearchParams();
      
      // merchantIdがあれば追加
      if (merchantId) {
        queryParams.append('merchantId', merchantId);
      }
      
      // 検索フォームの各項目を追加
      if (searchForm.keyword) queryParams.append('keyword', searchForm.keyword);
      if (searchForm.merchantName) queryParams.append('merchantName', searchForm.merchantName);
      if (searchForm.merchantNameKana) queryParams.append('merchantNameKana', searchForm.merchantNameKana);
      if (searchForm.name) queryParams.append('name', searchForm.name);
      if (searchForm.nameKana) queryParams.append('nameKana', searchForm.nameKana);
      if (searchForm.phone) queryParams.append('phone', searchForm.phone);
      if (searchForm.accountEmail) queryParams.append('accountEmail', searchForm.accountEmail);
      if (searchForm.postalCode) queryParams.append('postalCode', searchForm.postalCode);
      if (searchForm.prefecture) queryParams.append('prefecture', searchForm.prefecture);
      if (searchForm.address) queryParams.append('address', searchForm.address);
      if (searchForm.status && searchForm.status !== 'all') {
        queryParams.append('status', searchForm.status);
      }
      if (searchForm.createdAtFrom) queryParams.append('createdAtFrom', searchForm.createdAtFrom);
      if (searchForm.createdAtTo) queryParams.append('createdAtTo', searchForm.createdAtTo);
      if (searchForm.updatedAtFrom) queryParams.append('updatedAtFrom', searchForm.updatedAtFrom);
      if (searchForm.updatedAtTo) queryParams.append('updatedAtTo', searchForm.updatedAtTo);
      
      const data = await apiClient.getShops(queryParams.toString());
      
      // APIレスポンスの処理
      let shopsArray: Shop[] = [];
      let merchantInfo = null;
      
      if (Array.isArray(data)) {
        shopsArray = data as Shop[];
      } else if (data && typeof data === 'object') {
        // 新しいAPIレスポンス形式: {success: true, data: {shops: [...], pagination: {...}}}
        if ('data' in data && data.data && typeof data.data === 'object' && 'shops' in data.data) {
          shopsArray = ((data.data as { shops: Shop[] }).shops || []) as Shop[];
        }
        // 古いAPIレスポンス形式: {shops: [...], pagination: {...}}
        else if ('shops' in data) {
          shopsArray = ((data as { shops: Shop[] }).shops || []) as Shop[];
        }
      }
      
      // 最初の店舗からmerchant情報を取得
      if (shopsArray.length > 0 && shopsArray[0].merchant) {
        merchantInfo = shopsArray[0].merchant;
      }
      
      setShops(shopsArray);
      
      // merchantIdがある場合のみmerchant情報を取得
      if (merchantId) {
        if (!merchantInfo) {
          try {
            const merchantData = await apiClient.getMerchant(merchantId);
            if (merchantData && typeof merchantData === 'object' && 'name' in merchantData) {
              setMerchantName((merchantData as { name: string }).name);
            }
          } catch (err) {
            console.error('Failed to fetch merchant info:', err);
          }
        } else {
          setMerchantName(merchantInfo.name);
        }
      }
    } catch (err: unknown) {
      console.error('店舗データの取得に失敗しました:', err);
      setError('店舗データの取得に失敗しました');
      setShops([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 初回マウント時とmerchantId変更時にデータ取得
  // 事業者アカウントの場合はmerchantIdが設定されるまで待機
  useEffect(() => {
    // 認証情報がロード中の場合は待機
    if (auth?.isLoading) {
      return;
    }
    
    // 店舗アカウントの場合は、別のuseEffectで店舗情報を取得するためスキップ
    if (isShopAccount) {
      return;
    }
    
    // 事業者アカウントの場合、merchantIdが設定されるまで待機
    if (isMerchantAccount && !merchantId) {
      return;
    }
    
    fetchShops();
  }, [merchantId, auth?.isLoading, isMerchantAccount, isShopAccount]);

  // 検索フォームの入力ハンドラー
  const handleInputChange = (field: keyof typeof searchForm, value: string) => {
    setSearchForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 検索実行ハンドラー
  const handleSearch = () => {
    if (!validateSearchForm()) {
      return;
    }
    // URLパラメータを更新（ブラウザの戻る/進むボタンで検索条件を維持）
    const params = new URLSearchParams();
    Object.entries(searchForm).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.append(key, value);
      }
    });
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.pushState({}, '', newUrl);
    fetchShops();
  };

  // 日付バリデーション関数
  const validateSearchForm = (): boolean => {
    const errors: {createdAtFrom?: string; createdAtTo?: string; updatedAtFrom?: string; updatedAtTo?: string} = {};
    
    // 登録日開始日のバリデーション
    if (searchForm.createdAtFrom) {
      const fromDate = new Date(searchForm.createdAtFrom);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (fromDate > today) {
        errors.createdAtFrom = '開始日は今日以前の日付を指定してください';
      }
    }
    
    // 登録日終了日のバリデーション
    if (searchForm.createdAtTo) {
      const toDate = new Date(searchForm.createdAtTo);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (toDate > today) {
        errors.createdAtTo = '終了日は今日以前の日付を指定してください';
      }
    }
    
    // 登録日の範囲バリデーション
    if (searchForm.createdAtFrom && searchForm.createdAtTo) {
      const fromDate = new Date(searchForm.createdAtFrom);
      const toDate = new Date(searchForm.createdAtTo);
      
      if (fromDate > toDate) {
        errors.createdAtFrom = '開始日は終了日より前の日付を指定してください';
        errors.createdAtTo = '終了日は開始日より後の日付を指定してください';
      }
    }
    
    // 更新日開始日のバリデーション
    if (searchForm.updatedAtFrom) {
      const fromDate = new Date(searchForm.updatedAtFrom);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (fromDate > today) {
        errors.updatedAtFrom = '開始日は今日以前の日付を指定してください';
      }
    }
    
    // 更新日終了日のバリデーション
    if (searchForm.updatedAtTo) {
      const toDate = new Date(searchForm.updatedAtTo);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (toDate > today) {
        errors.updatedAtTo = '終了日は今日以前の日付を指定してください';
      }
    }
    
    // 更新日の範囲バリデーション
    if (searchForm.updatedAtFrom && searchForm.updatedAtTo) {
      const fromDate = new Date(searchForm.updatedAtFrom);
      const toDate = new Date(searchForm.updatedAtTo);
      
      if (fromDate > toDate) {
        errors.updatedAtFrom = '開始日は終了日より前の日付を指定してください';
        errors.updatedAtTo = '終了日は開始日より後の日付を指定してください';
      }
    }
    
    setSearchErrors({
      createdAtFrom: errors.createdAtFrom || '',
      createdAtTo: errors.createdAtTo || '',
      updatedAtFrom: errors.updatedAtFrom || '',
      updatedAtTo: errors.updatedAtTo || '',
    });
    return Object.keys(errors).length === 0;
  };

  // クリアハンドラー
  const handleClear = () => {
    setSearchForm({
      keyword: '',
      merchantName: '',
      merchantNameKana: '',
      name: '',
      nameKana: '',
      phone: '',
      accountEmail: '',
      postalCode: '',
      prefecture: '',
      address: '',
      status: 'all',
      createdAtFrom: '',
      createdAtTo: '',
      updatedAtFrom: '',
      updatedAtTo: '',
    });
    setSearchErrors({
      createdAtFrom: '',
      createdAtTo: '',
      updatedAtFrom: '',
      updatedAtTo: '',
    });
    // クリア後にデータを再取得
    setTimeout(() => fetchShops(), 100);
  };

  // チェックボックス関連の関数
  useEffect(() => {
    const allCount = shops.length;
    const selectedCount = selectedShops.size;
    setIsAllSelected(allCount > 0 && selectedCount === allCount);
    setIsIndeterminate(selectedCount > 0 && selectedCount < allCount);
  }, [selectedShops, shops]);

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedShops(new Set(shops.map(shop => shop.id)));
    } else {
      setSelectedShops(new Set());
    }
  };

  const handleToggleShop = (shopId: string, checked: boolean) => {
    const newSelected = new Set(selectedShops);
    if (checked) {
      newSelected.add(shopId);
    } else {
      newSelected.delete(shopId);
    }
    setSelectedShops(newSelected);
  };

  // 一括更新処理
  const handleBulkUpdateStatus = async (status: string) => {
    if (selectedShops.size === 0) return;

    try {
      let successCount = 0;
      let failCount = 0;

      for (const shopId of selectedShops) {
        try {
          await apiClient.updateShopStatus(shopId, { status });
          successCount++;
        } catch (error) {
          console.error(`店舗 ${shopId} の更新に失敗:`, error);
          failCount++;
        }
      }

      if (successCount > 0) {
        showSuccess(`${successCount}件のステータスを更新しました`);
      }
      if (failCount > 0) {
        showError(`${failCount}件の更新に失敗しました`);
      }

      setSelectedShops(new Set());
      fetchShops();
    } catch (error) {
      console.error('一括更新に失敗しました:', error);
      showError('一括更新に失敗しました');
    }
  };

  const handleIndividualStatusChange = async (shopId: string, newStatus: string) => {
    const originalShop = shops.find(s => s.id === shopId);
    if (!originalShop) return;

    const originalStatus = originalShop.status;

    // 楽観的更新: まずUIを更新
    setShops(prev => 
      prev.map(shop => 
        shop.id === shopId 
          ? { ...shop, status: newStatus as Shop['status'] }
          : shop
      )
    );

    try {
      await apiClient.updateShopStatus(shopId, { status: newStatus });
      showSuccess(`店舗のステータスを「${statusLabels[newStatus]}」に更新しました`);
    } catch (error: unknown) {
      // エラー時は元のステータスに戻す
      setShops(prev => 
        prev.map(shop => 
          shop.id === shopId 
            ? { ...shop, status: originalStatus }
            : shop
        )
      );
      showError(`ステータスの更新に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  };

  // チェックボックス関連の関数を追加

  // 全データ取得関数（ページネーション対応、検索条件適用）
  const fetchAllShops = async (): Promise<Shop[]> => {
    const allShops: Shop[] = [];
    let page = 1;
    const limit = 100; // 最大値を設定してページ数を減らす
    let hasMore = true;

    while (hasMore) {
      try {
        // 検索パラメータの構築
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());
        
        // merchantIdがあれば追加
        if (merchantId) {
          queryParams.append('merchantId', merchantId);
        }
        
        // 検索フォームの各項目を追加
        if (searchForm.keyword) queryParams.append('keyword', searchForm.keyword);
        if (searchForm.merchantName) queryParams.append('merchantName', searchForm.merchantName);
        if (searchForm.merchantNameKana) queryParams.append('merchantNameKana', searchForm.merchantNameKana);
        if (searchForm.name) queryParams.append('name', searchForm.name);
        if (searchForm.nameKana) queryParams.append('nameKana', searchForm.nameKana);
        if (searchForm.phone) queryParams.append('phone', searchForm.phone);
        if (searchForm.accountEmail) queryParams.append('accountEmail', searchForm.accountEmail);
        if (searchForm.postalCode) queryParams.append('postalCode', searchForm.postalCode);
        if (searchForm.prefecture) queryParams.append('prefecture', searchForm.prefecture);
        if (searchForm.address) queryParams.append('address', searchForm.address);
        if (searchForm.status && searchForm.status !== 'all') {
          queryParams.append('status', searchForm.status);
        }
        if (searchForm.createdAtFrom) queryParams.append('createdAtFrom', searchForm.createdAtFrom);
        if (searchForm.createdAtTo) queryParams.append('createdAtTo', searchForm.createdAtTo);
        if (searchForm.updatedAtFrom) queryParams.append('updatedAtFrom', searchForm.updatedAtFrom);
        if (searchForm.updatedAtTo) queryParams.append('updatedAtTo', searchForm.updatedAtTo);

        const data = await apiClient.getShops(queryParams.toString());
        
        // APIレスポンスの処理
        let shopsArray: Shop[] = [];
        let pagination: { totalPages?: number; total?: number } = {};
        
        if (Array.isArray(data)) {
          shopsArray = data as Shop[];
          hasMore = false;
        } else if (data && typeof data === 'object') {
          if ('data' in data && data.data && typeof data.data === 'object' && 'shops' in data.data) {
            shopsArray = ((data.data as { shops: Shop[]; pagination?: unknown }).shops || []) as Shop[];
            pagination = (data.data as { pagination?: { totalPages?: number; total?: number } }).pagination || {};
          } else if ('shops' in data) {
            shopsArray = ((data as { shops: Shop[] }).shops || []) as Shop[];
            pagination = (data as { pagination?: { totalPages?: number; total?: number } }).pagination || {};
          }
        }

        allShops.push(...shopsArray);

        // ページネーション情報を確認
        const totalPages = pagination.totalPages || 1;
        hasMore = page < totalPages;
        page++;

        // 取得したデータが0件の場合は終了
        if (shopsArray.length === 0) {
          hasMore = false;
        }
      } catch (error) {
        console.error('全データ取得中にエラーが発生しました:', error);
        throw error;
      }
    }

    return allShops;
  };

  // 全データをCSVダウンロード
  const handleDownloadAllCSV = async () => {
    try {
      setIsDownloadingCSV(true);
      
      // 全データを取得
      const allShops = await fetchAllShops();
      
      // Shop型をShopForCSV型に変換
      const shopsForCSV: ShopForCSV[] = allShops.map((shop) => ({
        merchantName: shop.merchant?.name,
        name: shop.name,
        nameKana: shop.nameKana || '',
        postalCode: shop.postalCode || '',
        address: shop.address || '',
        accountEmail: shop.accountEmail || '',
        phone: shop.phone || '',
        status: shop.status,
        createdAt: shop.createdAt,
        updatedAt: shop.updatedAt,
      }));

      // CSVを生成（事業者名を表示するかどうかはmerchantIdがない場合のみ）
      const csvContent = convertShopsToCSV(shopsForCSV, !merchantId && !isMerchantAccount);
      
      // ファイル名を生成
      const filename = generateFilename('shops');
      
      // CSVをダウンロード
      downloadCSV(csvContent, filename);
      
      showSuccess(`${allShops.length}件の店舗データをCSVでダウンロードしました`);
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
      if (selectedShops.size === 0) {
        showError('選択されている店舗がありません');
        return;
      }

      // 選択されたレコードを取得
      const selectedShopsData = shops.filter((shop) =>
        selectedShops.has(shop.id)
      );

      // Shop型をShopForCSV型に変換
      const shopsForCSV: ShopForCSV[] = selectedShopsData.map((shop) => ({
        merchantName: shop.merchant?.name,
        name: shop.name,
        nameKana: shop.nameKana || '',
        postalCode: shop.postalCode || '',
        address: shop.address || '',
        accountEmail: shop.accountEmail || '',
        phone: shop.phone || '',
        status: shop.status,
        createdAt: shop.createdAt,
        updatedAt: shop.updatedAt,
      }));

      // CSVを生成（事業者名を表示するかどうかはmerchantIdがない場合のみ）
      const csvContent = convertShopsToCSV(shopsForCSV, !merchantId && !isMerchantAccount);
      
      // ファイル名を生成
      const filename = generateFilename('shops_selected');
      
      // CSVをダウンロード
      downloadCSV(csvContent, filename);
      
      showSuccess(`${selectedShopsData.length}件の店舗データをCSVでダウンロードしました`);
    } catch (error: unknown) {
      console.error('CSVダウンロードに失敗しました:', error);
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      showError(`CSVダウンロードに失敗しました: ${errorMessage}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registering': return 'text-blue-600';
      case 'collection_requested': return 'text-purple-600';
      case 'approval_pending': return 'text-yellow-600';
      case 'promotional_materials_preparing': return 'text-orange-600';
      case 'promotional_materials_shipping': return 'text-indigo-600';
      case 'operating': return 'text-green-600';
      case 'suspended': return 'text-red-600';
      case 'terminated': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">店舗データを読み込み中...</p>
          </div>
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
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {isShopAccount ? '店舗管理' : '店舗一覧'}
              </h1>
              <p className="text-gray-600">
                {isShopAccount ? '自身の店舗情報を確認できます' : '店舗の管理・編集を行います'}
              </p>
            </div>
          </div>
          
          {/* 検索条件の表示 */}
          {!isShopAccount && (() => {
            const conditions: string[] = [];
            
            // merchantIdがある場合
            if (merchantId && merchantName) {
              conditions.push(`事業者: ${merchantName}`);
            }
            
            // 検索フォームの条件
            if (searchForm.keyword) conditions.push(`キーワード: ${searchForm.keyword}`);
            if (searchForm.merchantName) conditions.push(`事業者名: ${searchForm.merchantName}`);
            if (searchForm.merchantNameKana) conditions.push(`事業者名（カナ）: ${searchForm.merchantNameKana}`);
            if (searchForm.name) conditions.push(`店舗名: ${searchForm.name}`);
            if (searchForm.nameKana) conditions.push(`店舗名（カナ）: ${searchForm.nameKana}`);
            if (searchForm.phone) conditions.push(`電話番号: ${searchForm.phone}`);
            if (searchForm.accountEmail) conditions.push(`メールアドレス: ${searchForm.accountEmail}`);
            if (searchForm.postalCode) conditions.push(`郵便番号: ${searchForm.postalCode}`);
            if (searchForm.prefecture) conditions.push(`都道府県: ${searchForm.prefecture}`);
            if (searchForm.address) conditions.push(`住所: ${searchForm.address}`);
            if (searchForm.status && searchForm.status !== 'all') {
              const statusLabel = statusOptions?.find(opt => opt.value === searchForm.status)?.label || searchForm.status;
              conditions.push(`ステータス: ${statusLabel}`);
            }
            if (searchForm.createdAtFrom && searchForm.createdAtTo) {
              conditions.push(`登録日: ${searchForm.createdAtFrom} 〜 ${searchForm.createdAtTo}`);
            } else if (searchForm.createdAtFrom) {
              conditions.push(`登録日（開始）: ${searchForm.createdAtFrom}`);
            } else if (searchForm.createdAtTo) {
              conditions.push(`登録日（終了）: ${searchForm.createdAtTo}`);
            }
            if (searchForm.updatedAtFrom && searchForm.updatedAtTo) {
              conditions.push(`更新日: ${searchForm.updatedAtFrom} 〜 ${searchForm.updatedAtTo}`);
            } else if (searchForm.updatedAtFrom) {
              conditions.push(`更新日（開始）: ${searchForm.updatedAtFrom}`);
            } else if (searchForm.updatedAtTo) {
              conditions.push(`更新日（終了）: ${searchForm.updatedAtTo}`);
            }
            
            if (conditions.length === 0) return null;
            
            return (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 mr-2">検索条件:</span>
                  <span className="text-sm text-gray-900">{conditions.join(' / ')}</span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <Image 
                src="/alert.svg" 
                alt="警告" 
                width={16} 
                height={16}
                className="w-4 h-4 text-red-500 mr-2"
              />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* 検索フォーム（店舗アカウントの場合は非表示） */}
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
              <div className="w-4 h-4 flex items-center justify-center">
                <span className={`text-gray-600 text-sm transition-transform duration-200 ${isSearchExpanded ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </div>
            </Button>
          </div>
          
          {isSearchExpanded && (
          <div className="p-6 space-y-4">
            {/* フリーワード検索 */}
            <div>
              <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-2">
                フリーワード検索
              </label>
              <input
                type="text"
                id="keyword"
                placeholder="店舗名、住所、電話番号などで検索（2文字以上）"
                value={searchForm.keyword}
                onChange={(e) => handleInputChange('keyword', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            {/* 事業者名と事業者名（カナ） */}
            {!merchantId && (
              <div className="flex gap-4" style={{ marginTop: '16px' }}>
                <div className="flex-1">
                  <label htmlFor="merchantName" className="block text-sm font-medium text-gray-700 mb-2">
                    事業者名
                  </label>
                  <input
                    type="text"
                    id="merchantName"
                    placeholder="事業者名を入力"
                    value={searchForm.merchantName}
                    onChange={(e) => handleInputChange('merchantName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="merchantNameKana" className="block text-sm font-medium text-gray-700 mb-2">
                    事業者名（カナ）
                  </label>
                  <input
                    type="text"
                    id="merchantNameKana"
                    placeholder="事業者名（カナ）を入力"
                    value={searchForm.merchantNameKana}
                    onChange={(e) => handleInputChange('merchantNameKana', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            )}

            {/* 店舗名と店舗名（カナ） */}
            <div className="flex gap-4" style={{ marginTop: '16px' }}>
              <div className="flex-1">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  店舗名
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="店舗名を入力"
                  value={searchForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="nameKana" className="block text-sm font-medium text-gray-700 mb-2">
                  店舗名（カナ）
                </label>
                <input
                  type="text"
                  id="nameKana"
                  placeholder="店舗名（カナ）を入力"
                  value={searchForm.nameKana}
                  onChange={(e) => handleInputChange('nameKana', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {/* 電話番号とメールアドレス */}
            <div className="flex gap-4" style={{ marginTop: '16px' }}>
              <div className="flex-shrink-0">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  電話番号
                </label>
                <input
                  type="text"
                  id="phone"
                  placeholder="電話番号を入力"
                  value={searchForm.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="accountEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス
                </label>
                <input
                  type="text"
                  id="accountEmail"
                  placeholder="メールアドレスを入力"
                  value={searchForm.accountEmail}
                  onChange={(e) => handleInputChange('accountEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {/* 郵便番号、都道府県、住所 */}
            <div className="flex gap-4" style={{ marginTop: '16px' }}>
              <div className="flex-shrink-0">
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                  郵便番号
                </label>
                <input
                  type="text"
                  id="postalCode"
                  placeholder="郵便番号を入力"
                  value={searchForm.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  className="w-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="flex-shrink-0">
                <label htmlFor="prefecture" className="block text-sm font-medium text-gray-700 mb-2">
                  都道府県
                </label>
                <input
                  type="text"
                  id="prefecture"
                  placeholder="都道府県を入力"
                  value={searchForm.prefecture}
                  onChange={(e) => handleInputChange('prefecture', e.target.value)}
                  className="w-[150px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="flex-1">
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
            </div>

            {/* 承認ステータス */}
            <div className="max-w-[200px]" style={{ marginTop: '16px' }}>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                承認ステータス
              </label>
              <select
                id="status"
                value={searchForm.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">すべて</option>
                {statusOptions?.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* 登録日・更新日の範囲 */}
            <div className="flex gap-4" style={{ marginTop: '16px' }}>
              <div>
                <label htmlFor="createdAtFrom" className="block text-sm font-medium text-gray-700 mb-2">
                  登録日（開始）
                </label>
                <input
                  type="date"
                  id="createdAtFrom"
                  value={searchForm.createdAtFrom}
                  onChange={(e) => handleInputChange('createdAtFrom', e.target.value)}
                  className="w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                {searchErrors.createdAtFrom && (
                  <p className="text-red-600 text-sm mt-1">{searchErrors.createdAtFrom}</p>
                )}
              </div>
              <div>
                <label htmlFor="createdAtTo" className="block text-sm font-medium text-gray-700 mb-2">
                  登録日（終了）
                </label>
                <input
                  type="date"
                  id="createdAtTo"
                  value={searchForm.createdAtTo}
                  onChange={(e) => handleInputChange('createdAtTo', e.target.value)}
                  className="w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                {searchErrors.createdAtTo && (
                  <p className="text-red-600 text-sm mt-1">{searchErrors.createdAtTo}</p>
                )}
              </div>
              <div>
                <label htmlFor="updatedAtFrom" className="block text-sm font-medium text-gray-700 mb-2">
                  更新日（開始）
                </label>
                <input
                  type="date"
                  id="updatedAtFrom"
                  value={searchForm.updatedAtFrom}
                  onChange={(e) => handleInputChange('updatedAtFrom', e.target.value)}
                  className="w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                {searchErrors.updatedAtFrom && (
                  <p className="text-red-600 text-sm mt-1">{searchErrors.updatedAtFrom}</p>
                )}
              </div>
              <div>
                <label htmlFor="updatedAtTo" className="block text-sm font-medium text-gray-700 mb-2">
                  更新日（終了）
                </label>
                <input
                  type="date"
                  id="updatedAtTo"
                  value={searchForm.updatedAtTo}
                  onChange={(e) => handleInputChange('updatedAtTo', e.target.value)}
                  className="w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                {searchErrors.updatedAtTo && (
                  <p className="text-red-600 text-sm mt-1">{searchErrors.updatedAtTo}</p>
                )}
              </div>
            </div>

            {/* 検索・クリアボタン */}
            <div className="flex justify-center gap-2 mt-6">
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

        {/* 店舗アカウント用の詳細ビュー */}
        {isShopAccount && shops.length > 0 && shops[0] ? (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 space-y-6">
              {/* 基本情報 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h3>
                <table className="w-full border-collapse border border-gray-300">
                  <tbody>
                    <tr className="border-b border-gray-300">
                      <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 w-1/3">店舗名</td>
                      <td className="py-3 px-4 text-gray-900">{shops[0].name}</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 w-1/3">店舗名（カナ）</td>
                      <td className="py-3 px-4 text-gray-900">{shops[0].nameKana}</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 w-1/3">電話番号</td>
                      <td className="py-3 px-4 text-gray-900">{shops[0].phone}</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 w-1/3">事業者名</td>
                      <td className="py-3 px-4 text-gray-900">{shops[0].merchant?.name || '-'}</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 w-1/3">ジャンル</td>
                      <td className="py-3 px-4 text-gray-900">{shops[0].genre?.name || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 住所情報 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">住所情報</h3>
                <table className="w-full border-collapse border border-gray-300">
                  <tbody>
                    <tr className="border-b border-gray-300">
                      <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 w-1/3">郵便番号</td>
                      <td className="py-3 px-4 text-gray-900">{shops[0].postalCode ? `〒${shops[0].postalCode}` : '-'}</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 w-1/3">住所</td>
                      <td className="py-3 px-4 text-gray-900">{shops[0].address || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 店舗詳細情報 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">店舗詳細</h3>
                <table className="w-full border-collapse border border-gray-300">
                  <tbody>
                    <tr className="border-b border-gray-300">
                      <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 w-1/3">定休日</td>
                      <td className="py-3 px-4 text-gray-900">{shops[0].holidays || '-'}</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 w-1/3">喫煙可否</td>
                      <td className="py-3 px-4 text-gray-900">
                        {shops[0].smokingType === 'non_smoking' ? '禁煙' : 
                         shops[0].smokingType === 'smoking_allowed' ? '喫煙可' : 
                         shops[0].smokingType === 'separated' ? '分煙' : 
                         shops[0].smokingType === 'electronic_only' ? '電子のみ' : '-'}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 w-1/3">ホームページURL</td>
                      <td className="py-3 px-4 text-gray-900">
                        {('homepageUrl' in shops[0] && shops[0].homepageUrl) ? (
                          <a href={shops[0].homepageUrl as string} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">{shops[0].homepageUrl as string}</a>
                        ) : '-'}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 w-1/3">クーポン利用時間</td>
                      <td className="py-3 px-4 text-gray-900">
                        {('couponUsageStart' in shops[0] && 'couponUsageEnd' in shops[0] && shops[0].couponUsageStart && shops[0].couponUsageEnd) ? `${shops[0].couponUsageStart as string}〜${shops[0].couponUsageEnd as string}` : '-'}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 w-1/3">ステータス</td>
                      <td className={`py-3 px-4 text-sm font-medium ${getStatusColor(shops[0].status)}`}>
                        {statusOptions.find(opt => opt.value === shops[0].status)?.label || shops[0].status}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* アカウント情報 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">アカウント情報</h3>
                <table className="w-full border-collapse border border-gray-300">
                  <tbody>
                    <tr className="border-b border-gray-300">
                      <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 w-1/3">メールアドレス</td>
                      <td className="py-3 px-4 text-gray-900">{shops[0].accountEmail || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 決済情報 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">決済情報</h3>
                <table className="w-full border-collapse border border-gray-300">
                  <tbody>
                    <tr className="border-b border-gray-300">
                      <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 w-1/3">さいこいん決済</td>
                      <td className="py-3 px-4 text-gray-900">{shops[0].paymentSaicoin ? '利用可能' : '利用不可'}</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 w-1/3">たまぽん決済</td>
                      <td className="py-3 px-4 text-gray-900">{shops[0].paymentTamapon ? '利用可能' : '利用不可'}</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 w-1/3">現金決済</td>
                      <td className="py-3 px-4 text-gray-900">{shops[0].paymentCash ? '利用可能' : '利用不可'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* フッターボタン */}
              <div className="flex justify-center gap-4 pt-6 border-t border-gray-200">
                <Link href="/coupons">
                  <Button variant="outline" className="cursor-pointer border-green-600 text-green-600 hover:bg-green-50">
                    クーポン一覧
                  </Button>
                </Link>
                <Link href={`/merchants/${shops[0].merchantId}/shops/${shops[0].id}/edit`}>
                  <Button variant="primary" className="cursor-pointer bg-green-600 hover:bg-green-700 text-white">
                    編集
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        {/* 店舗一覧（管理者・事業者アカウント用） */}
        {!isShopAccount && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              店舗一覧 ({shops.length}件)
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleDownloadAllCSV}
                disabled={isDownloadingCSV || shops.length === 0}
                className="bg-white text-blue-600 border-blue-600 hover:bg-blue-50 cursor-pointer"
              >
                {isDownloadingCSV ? 'ダウンロード中...' : 'CSVダウンロード'}
              </Button>
              <Link href={merchantId ? `/merchants/${merchantId}/shops/new` : '/shops/new'}>
                <Button variant="outline" className="bg-white text-green-600 border-green-600 hover:bg-green-50 cursor-pointer">
                  <span className="mr-2">+</span>
                  新規登録
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-gray-50">
                <tr>
                  {!isMerchantAccount && !isShopAccount && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 whitespace-nowrap">
                      <Checkbox
                        checked={isAllSelected}
                        indeterminate={isIndeterminate}
                        onChange={handleToggleAll}
                      />
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 whitespace-nowrap">
                    アクション
                  </th>
                  {!merchantId && !isMerchantAccount && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                      事業者名
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                    店舗名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[250px]">
                    住所
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                    メールアドレス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    電話番号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    承認ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    登録日時
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    更新日時
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {shops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-gray-50">
                    {!isMerchantAccount && !isShopAccount && (
                      <td className="px-6 py-4 whitespace-nowrap w-32">
                        <Checkbox
                          checked={selectedShops.has(shop.id)}
                          onChange={(checked) => handleToggleShop(shop.id, checked)}
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap w-32">
                      <div className="flex justify-center gap-2">
                        <Link href={`/merchants/${merchantId || shop.merchantId}/shops/${shop.id}/edit`}>
                          <button 
                            className="p-2.5 text-green-600 hover:text-green-800 rounded-lg transition-colors cursor-pointer flex items-center justify-center min-w-[44px] min-h-[44px]"
                            title="編集"
                          >
                            <Image 
                              src="/edit.svg" 
                              alt="編集" 
                              width={32}
                              height={32}
                              className="w-8 h-8"
                            />
                          </button>
                        </Link>
                        <Link href={`/shops/${shop.id}/coupons`}>
                          <button 
                            className="p-2 text-orange-600 hover:text-orange-800 rounded-lg transition-colors cursor-pointer flex items-center justify-center min-w-[48px] min-h-[48px]"
                            title="クーポン管理"
                          >
                            <Image 
                              src="/coupon.svg" 
                              alt="クーポン" 
                              width={48}
                              height={48}
                              className="w-10 h-10"
                            />
                          </button>
                        </Link>
                      </div>
                    </td>
                    {!merchantId && !isMerchantAccount && (
                      <td className="px-6 py-4 whitespace-nowrap min-w-[200px]">
                        <div className="text-sm font-medium text-gray-900">
                          {shop.merchant?.name || '-'}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap min-w-[200px]">
                      <div className="text-sm font-medium text-gray-900">{shop.name}</div>
                      {shop.nameKana && (
                        <div className="text-sm text-gray-500">{shop.nameKana}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 min-w-[250px]">
                      <div className="text-sm text-gray-900">
                        {shop.postalCode ? `〒${shop.postalCode}` : '-'}
                      </div>
                      <div className="text-sm text-gray-900 mt-1">
                        {shop.address || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[200px]">
                      <div className="text-sm text-gray-900">{shop.accountEmail || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{shop.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[200px]">
                      {isMerchantAccount ? (
                        <div className={`text-sm font-medium rounded-lg px-3 py-2 ${getStatusColor(shop.status)}`}>
                          {statusLabels[shop.status] || shop.status}
                        </div>
                      ) : (
                        <select
                          value={shop.status}
                          onChange={(e) => handleIndividualStatusChange(shop.id, e.target.value)}
                          className={`text-sm font-medium rounded-lg px-3 py-2 border border-gray-300 bg-white focus:ring-2 focus:ring-green-500 w-full min-w-[180px] ${getStatusColor(shop.status)}`}
                        >
                          {statusOptions?.map((option) => (
                            <option key={option.value} value={option.value} className={getStatusColor(option.value)}>
                              {option.label}
                            </option>
                          )) || (
                            <option value={shop.status} className={getStatusColor(shop.status)}>
                              {statusLabels[shop.status] || shop.status}
                            </option>
                          )}
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[150px]">
                      <div className="text-sm text-gray-900">
                        {new Date(shop.createdAt).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[150px]">
                      <div className="text-sm text-gray-900">
                        {new Date(shop.updatedAt).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>

          {shops.length === 0 && (
            <div className="text-center py-12">
              <Image 
                src="/storefront-icon.svg" 
                alt="店舗" 
                width={48} 
                height={48}
                className="mx-auto text-gray-400 mb-4"
              />
              <h3 className="text-lg font-medium text-gray-900 mb-2">店舗が見つかりません</h3>
              <p className="text-gray-500">検索条件を変更してお試しください。</p>
            </div>
          )}
        </div>
        )}
      </div>

      {!isMerchantAccount && !isShopAccount && (
        <FloatingFooter
          selectedCount={selectedShops.size}
          onBulkUpdateStatus={handleBulkUpdateStatus}
          onDownloadCSV={handleDownloadSelectedCSV}
        />
      )}
      
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </AdminLayout>
  );
}

export default function ShopsPage() {
  return (
    <Suspense fallback={
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </AdminLayout>
    }>
      <ShopsPageContent />
    </Suspense>
  );
}
