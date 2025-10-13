'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import DashboardLayout from '@/components/templates/dashboard-layout';
import Button from '@/components/atoms/Button';
import ToastContainer from '@/components/molecules/toast-container';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { statusLabels, statusOptions } from '@/lib/constants/shop';

// APIレスポンス用の型
type Shop = {
  id: string;
  merchantId: string;
  name: string;
  nameKana: string | null;
  email: string;
  phone: string;
  postalCode: string | null;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  businessHours: string | null;
  holidays: string | null;
  budgetLunch: number | null;
  budgetDinner: number | null;
  smokingType: string | null;
  paymentSaicoin: boolean | null;
  paymentTamapon: boolean | null;
  paymentCash: boolean | null;
  paymentCredit: string | null;
  paymentCode: string | null;
  scenes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  merchant?: {
    id: string;
    name: string;
    account?: {
      email: string;
      displayName: string | null;
    };
  };
};

type ShopManagementProps = {
  merchantId?: string;
};

export default function ShopManagement({ merchantId }: ShopManagementProps) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [merchantName, setMerchantName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toasts, removeToast, showSuccess, showError } = useToast();
  
  const [searchForm, setSearchForm] = useState({
    shopId: '',
    name: '',
    nameKana: '',
    email: '',
    phone: '',
    postalCode: '',
    address: '',
  });
  const [appliedSearchForm, setAppliedSearchForm] = useState({
    shopId: '',
    name: '',
    nameKana: '',
    email: '',
    phone: '',
    postalCode: '',
    address: '',
  });
  const [statusFilter, setStatusFilter] = useState<'all' | 'registering' | 'collection_requested' | 'approval_pending' | 'promotional_materials_preparing' | 'promotional_materials_shipping' | 'operating' | 'suspended' | 'terminated'>('all');
  const [appliedStatusFilter, setAppliedStatusFilter] = useState<'all' | 'registering' | 'collection_requested' | 'approval_pending' | 'promotional_materials_preparing' | 'promotional_materials_shipping' | 'operating' | 'suspended' | 'terminated'>('all');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // データ取得
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchShops = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 店舗一覧を取得（merchantIdがあればフィルタ）
        const queryParams = merchantId ? new URLSearchParams({ merchantId }) : undefined;
        const data = await apiClient.getShops(queryParams?.toString());
        
        // コンポーネントがアンマウントされている場合は処理を中断
        if (!isMounted) return;
        
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
        
        if (isMounted) {
          setShops(shopsArray);
        }
        
        // merchantIdがある場合のみmerchant情報を取得
        if (merchantId && isMounted) {
          if (!merchantInfo) {
            try {
              const merchantData = await apiClient.getMerchant(merchantId);
              if (isMounted && merchantData && typeof merchantData === 'object' && 'name' in merchantData) {
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
        // アボート時のエラーは無視
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        
        if (isMounted) {
          console.error('店舗データの取得に失敗しました:', err);
          setError('店舗データの取得に失敗しました');
          setShops([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchShops();

    // クリーンアップ: コンポーネントのアンマウント時または再実行時にリクエストをキャンセル
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [merchantId]);

  // フィルタリング処理
  const filteredShops = shops.filter((shop) => {
    const matchesSearch = 
      (appliedSearchForm.shopId === '' || shop.id.includes(appliedSearchForm.shopId)) &&
      (appliedSearchForm.name === '' || shop.name.toLowerCase().includes(appliedSearchForm.name.toLowerCase())) &&
      (appliedSearchForm.nameKana === '' || (shop.nameKana?.toLowerCase() || '').includes(appliedSearchForm.nameKana.toLowerCase())) &&
      (appliedSearchForm.email === '' || shop.email.toLowerCase().includes(appliedSearchForm.email.toLowerCase())) &&
      (appliedSearchForm.phone === '' || shop.phone.includes(appliedSearchForm.phone)) &&
      (appliedSearchForm.postalCode === '' || (shop.postalCode || '').includes(appliedSearchForm.postalCode)) &&
      (appliedSearchForm.address === '' || (shop.address?.toLowerCase() || '').includes(appliedSearchForm.address.toLowerCase()));
    
    const matchesStatus = appliedStatusFilter === 'all' || shop.status === appliedStatusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleInputChange = (field: keyof typeof searchForm, value: string) => {
    setSearchForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    setAppliedSearchForm({ ...searchForm });
    setAppliedStatusFilter(statusFilter);
    console.log('検索実行:', searchForm);
  };

  const handleClear = () => {
    setSearchForm({
      shopId: '',
      name: '',
      nameKana: '',
      email: '',
      phone: '',
      postalCode: '',
      address: '',
    });
    setStatusFilter('all');
    setAppliedSearchForm({
      shopId: '',
      name: '',
      nameKana: '',
      email: '',
      phone: '',
      postalCode: '',
      address: '',
    });
    setAppliedStatusFilter('all');
  };

  const handleIndividualStatusChange = async (shopId: string, newStatus: string) => {
    const originalShop = shops.find(s => s.id === shopId);
    if (!originalShop) return;

    const originalStatus = originalShop.status;

    // 楽観的更新: まずUIを更新
    setShops(prev => 
      prev.map(shop => 
        shop.id === shopId 
          ? { ...shop, status: newStatus }
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
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">店舗データを読み込み中...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">店舗一覧</h1>
              <p className="text-gray-600">
                店舗の管理・編集を行います
              </p>
            </div>
            <div className="text-sm text-gray-600">
              <div className="flex items-center">
                <span className="font-medium text-gray-900">管理者太郎</span>
              </div>
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
              <div className="w-4 h-4 flex items-center justify-center">
                <span className={`text-gray-600 text-sm transition-transform duration-200 ${isSearchExpanded ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </div>
            </Button>
          </div>
          
          {isSearchExpanded && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 店舗ID */}
            <div>
              <label htmlFor="shopId" className="block text-sm font-medium text-gray-700 mb-2">
                店舗ID
              </label>
              <input
                type="text"
                id="shopId"
                placeholder="店舗IDを入力"
                value={searchForm.shopId}
                onChange={(e) => handleInputChange('shopId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

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

            {/* 住所 */}
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

            {/* ステータス */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'registering' | 'collection_requested' | 'approval_pending' | 'promotional_materials_preparing' | 'promotional_materials_shipping' | 'operating' | 'suspended' | 'terminated')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">すべて</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
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
              店舗一覧 ({filteredShops.length}件)
            </h3>
            {merchantId && (
              <Link href={`/merchants/${merchantId}/shops/new`}>
                <Button variant="outline" className="bg-white text-green-600 border-green-600 hover:bg-green-50 cursor-pointer">
                  <span className="mr-2">+</span>
                  新規登録
                </Button>
              </Link>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 whitespace-nowrap">
                    アクション
                  </th>
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
              {filteredShops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap w-24">
                      <div className="flex justify-center">
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
                      </div>
                    </td>
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
                      <div className="text-sm text-gray-900">{shop.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[150px]">
                      <div className="text-sm text-gray-900">{shop.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[150px]">
                      <select
                        value={shop.status}
                        onChange={(e) => handleIndividualStatusChange(shop.id, e.target.value)}
                        className={`text-sm font-medium rounded-lg px-3 py-2 border border-gray-300 bg-white focus:ring-2 focus:ring-green-500 w-full ${getStatusColor(shop.status)}`}
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

          {filteredShops.length === 0 && (
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
      </div>
      
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </DashboardLayout>
  );
}
