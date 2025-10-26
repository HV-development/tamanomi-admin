'use client';

import { useState, useEffect } from 'react';
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

export default function ShopsPage() {
  const auth = useAuth();
  const isMerchantAccount = auth?.user?.accountType === 'merchant';
  const isShopAccount = auth?.user?.accountType === 'shop';
  const [merchantId, setMerchantId] = useState<string | undefined>(undefined);
  const [shops, setShops] = useState<Shop[]>([]);
  const [merchantName, setMerchantName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toasts, removeToast, showSuccess, showError } = useToast();
  
  // 検索フォームの状態（拡張版）
  const [searchForm, setSearchForm] = useState({
    keyword: '',
    name: '',
    nameKana: '',
    phone: '',
    accountEmail: '',
    postalCode: '',
    prefecture: '',
    city: '',
    status: 'all' as 'all' | 'registering' | 'collection_requested' | 'approval_pending' | 'promotional_materials_preparing' | 'promotional_materials_shipping' | 'operating' | 'suspended' | 'terminated',
    appName: 'all' as 'all' | 'tamanomi' | 'nomoca_kagawa',
  });
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // チェックボックス関連の状態を追加
  const [selectedShops, setSelectedShops] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isIndeterminate, setIsIndeterminate] = useState(false);

  // 会社アカウントの場合、自分の会社IDを取得
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
          console.error('会社情報の取得に失敗しました:', error);
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
      if (searchForm.name) queryParams.append('name', searchForm.name);
      if (searchForm.nameKana) queryParams.append('nameKana', searchForm.nameKana);
      if (searchForm.phone) queryParams.append('phone', searchForm.phone);
      if (searchForm.accountEmail) queryParams.append('accountEmail', searchForm.accountEmail);
      if (searchForm.postalCode) queryParams.append('postalCode', searchForm.postalCode);
      if (searchForm.prefecture) queryParams.append('prefecture', searchForm.prefecture);
      if (searchForm.city) queryParams.append('city', searchForm.city);
      if (searchForm.status && searchForm.status !== 'all') {
        queryParams.append('status', searchForm.status);
      }
      if (searchForm.appName && searchForm.appName !== 'all') {
        queryParams.append('appName', searchForm.appName);
      }
      
      const data = await apiClient.getShops(queryParams.toString());
        
      console.log('🔍 ShopManagement: API Response received', { 
        data, 
        dataType: typeof data, 
        isArray: Array.isArray(data),
        hasShops: data && typeof data === 'object' && 'shops' in data,
        hasDataShops: data && typeof data === 'object' && 'data' in data && data.data && typeof data.data === 'object' && 'shops' in data.data
      });
      
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
      
      console.log('🔍 ShopManagement: Processed shops array', { 
        shopsArray, 
        length: shopsArray.length,
        firstShop: shopsArray[0] || 'no shops'
      });
      
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
  // 会社アカウントの場合はmerchantIdが設定されるまで待機
  useEffect(() => {
    // 認証情報がロード中の場合は待機
    if (auth?.isLoading) {
      return;
    }
    
    // 店舗アカウントの場合は、別のuseEffectで店舗情報を取得するためスキップ
    if (isShopAccount) {
      return;
    }
    
    // 会社アカウントの場合、merchantIdが設定されるまで待機
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
    console.log('検索実行:', searchForm);
    fetchShops();
  };

  // クリアハンドラー
  const handleClear = () => {
    setSearchForm({
      keyword: '',
      name: '',
      nameKana: '',
      phone: '',
      accountEmail: '',
      postalCode: '',
      prefecture: '',
      city: '',
      status: 'all',
      appName: 'all',
    });
    // クリア後にデータを再取得
    setTimeout(() => fetchShops(), 100);
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
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(shops.map(shop => shop.id));
      setSelectedShops(allIds);
      setIsAllSelected(true);
      setIsIndeterminate(false);
    } else {
      setSelectedShops(new Set());
      setIsAllSelected(false);
      setIsIndeterminate(false);
    }
  };

  const handleSelectShop = (shopId: string, checked: boolean) => {
    const newSelected = new Set(selectedShops);
    if (checked) {
      newSelected.add(shopId);
    } else {
      newSelected.delete(shopId);
    }
    setSelectedShops(newSelected);

    // 全選択状態の更新
    const totalCount = shops.length;
    const selectedCount = newSelected.size;
    
    if (selectedCount === 0) {
      setIsAllSelected(false);
      setIsIndeterminate(false);
    } else if (selectedCount === totalCount) {
      setIsAllSelected(true);
      setIsIndeterminate(false);
    } else {
      setIsAllSelected(false);
      setIsIndeterminate(true);
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
          
          {/* 親会社名の表示 */}
          {merchantName && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-2">会社名:</span>
                <span className="text-sm font-bold text-gray-900">{merchantName}</span>
              </div>
            </div>
          )}
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <img 
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
          <div className="p-6">
            {/* フリーワード検索 */}
            <div className="mb-4">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 店舗名 */}
            <div>
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

            {/* 店舗名（カナ） */}
            <div>
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

            {/* メールアドレス */}
            <div>
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

            {/* 郵便番号 */}
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                郵便番号
              </label>
              <input
                type="text"
                id="postalCode"
                placeholder="郵便番号を入力"
                value={searchForm.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
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

            {/* ステータス */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <select
                id="status"
                value={searchForm.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">すべて</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* 掲載サイト */}
            <div>
              <label htmlFor="appName" className="block text-sm font-medium text-gray-700 mb-2">
                掲載サイト
              </label>
              <select
                id="appName"
                value={searchForm.appName}
                onChange={(e) => handleInputChange('appName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">すべて</option>
                <option value="tamanomi">たまのみ</option>
                <option value="nomoca_kagawa">のもかかがわ</option>
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
                      <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 w-1/3">会社名</td>
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
                        {shops[0].smokingType === 'no_smoking' ? '禁煙' : 
                         shops[0].smokingType === 'smoking_allowed' ? '喫煙可' : 
                         shops[0].smokingType === 'separate_smoking' ? '分煙' : '-'}
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

        {/* 店舗一覧（管理者・会社アカウント用） */}
        {!isShopAccount && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              店舗一覧 ({shops.length}件)
            </h3>
            <Link href={merchantId ? `/merchants/${merchantId}/shops/new` : '/shops/new'}>
              <Button variant="outline" className="bg-white text-green-600 border-green-600 hover:bg-green-50 cursor-pointer">
                <span className="mr-2">+</span>
                新規登録
              </Button>
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 whitespace-nowrap">
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isIndeterminate}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 whitespace-nowrap">
                    アクション
                  </th>
                  {!merchantId && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                      会社名
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
                    ステータス
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {shops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap w-32">
                      <Checkbox
                        checked={selectedShops.has(shop.id)}
                        onChange={(checked) => handleSelectShop(shop.id, checked)}
                      />
                    </td>
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
                    {!merchantId && (
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
                      <select
                        value={shop.status}
                        onChange={(e) => handleIndividualStatusChange(shop.id, e.target.value)}
                        className={`text-sm font-medium rounded-lg px-3 py-2 border border-gray-300 bg-white focus:ring-2 focus:ring-green-500 w-full min-w-[180px] ${getStatusColor(shop.status)}`}
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>

          {shops.length === 0 && (
            <div className="text-center py-12">
              <img 
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

      <FloatingFooter
        selectedCount={selectedShops.size}
        onIssueAccount={() => {}} // 店舗では使用しない
        isIssuingAccount={false}
      />
      
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </AdminLayout>
  );
}
