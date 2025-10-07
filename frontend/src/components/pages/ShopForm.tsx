'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/atoms/button';
import ToastContainer from '@/components/molecules/toast-container';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
// import { StoreCreateRequest, StoreUpdateRequest } from '@hv-development/schemas';

// 一時的な型定義
type StoreCreateRequest = {
  name: string;
  merchantId: string;
  [key: string]: any;
};

type StoreUpdateRequest = {
  name?: string;
  [key: string]: any;
};

interface Merchant {
  id: string;
  name: string;
  account: {
    email: string;
    displayName: string;
  };
}

export default function ShopForm() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;
  const isEdit = !!shopId;
  
  const [formData, setFormData] = useState<StoreCreateRequest>({
    merchantId: '',
    name: '',
    nameKana: '',
    email: '',
    phone: '',
    postalCode: '',
    address: '',
    latitude: '',
    longitude: '',
    businessHours: '',
    holidays: '',
    budgetLunch: 0,
    budgetDinner: 0,
    smokingType: '',
    paymentSaicoin: false,
    paymentTamapon: false,
    paymentCash: true,
    paymentCredit: '',
    paymentCode: '',
    scenes: '',
    status: 'active',
  });
  
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toasts, removeToast, showSuccess, showError } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 加盟店一覧を取得
        const merchantsData = await apiClient.getMerchants();
        const merchantsArray = Array.isArray(merchantsData) ? merchantsData : (merchantsData as { merchants: unknown[] }).merchants || [];
        setMerchants(merchantsArray);
        
        // 編集モードの場合は店舗データを取得
        if (isEdit) {
          const shopData = await apiClient.getShop(shopId);
          setFormData(shopData as StoreCreateRequest);
        }
      } catch (err: unknown) {
        console.error('Failed to fetch data:', err);
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
        showError('データの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [shopId, isEdit]);

  const handleInputChange = (field: keyof StoreCreateRequest, value: string | number | boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      if (isEdit) {
        await apiClient.updateShop(shopId, formData);
        showSuccess('店舗を更新しました');
      } else {
        await apiClient.createShop(formData);
        showSuccess('店舗を作成しました');
      }
      
      router.push('/shops');
    } catch (err: unknown) {
      console.error('Failed to save shop:', err);
      showError(isEdit ? '店舗更新に失敗しました' : '店舗作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/shops');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-red-600">{error}</div>
          <Button variant="secondary" onClick={handleCancel} className="mt-4">
            店舗一覧に戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? '店舗編集' : '新規店舗登録'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                加盟店 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.merchantId}
                onChange={(e) => handleInputChange('merchantId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">選択してください</option>
                {merchants.map((merchant) => (
                  <option key={merchant.id} value={merchant.id}>
                    {merchant.name} ({merchant.account.displayName})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                店舗名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                店舗名（カナ）
              </label>
              <input
                type="text"
                value={formData.nameKana}
                onChange={(e) => handleInputChange('nameKana', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                郵便番号
              </label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 100-0001"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                住所
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 東京都千代田区丸の内1-1-1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                緯度
              </label>
              <input
                type="text"
                value={formData.latitude}
                onChange={(e) => handleInputChange('latitude', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 35.681236"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                経度
              </label>
              <input
                type="text"
                value={formData.longitude}
                onChange={(e) => handleInputChange('longitude', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 139.767125"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ステータス
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">営業中</option>
                <option value="inactive">休業中</option>
                <option value="suspended">停止中</option>
              </select>
            </div>
          </div>
        </div>

        {/* 営業情報 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">営業情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                営業時間
              </label>
              <input
                type="text"
                value={formData.businessHours}
                onChange={(e) => handleInputChange('businessHours', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 11:00-22:00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                定休日
              </label>
              <input
                type="text"
                value={formData.holidays}
                onChange={(e) => handleInputChange('holidays', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 月曜日"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ランチ予算
              </label>
              <input
                type="number"
                value={formData.budgetLunch}
                onChange={(e) => handleInputChange('budgetLunch', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 1000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ディナー予算
              </label>
              <input
                type="number"
                value={formData.budgetDinner}
                onChange={(e) => handleInputChange('budgetDinner', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 3000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                喫煙タイプ
              </label>
              <select
                value={formData.smokingType}
                onChange={(e) => handleInputChange('smokingType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                <option value="禁煙">禁煙</option>
                <option value="分煙">分煙</option>
                <option value="喫煙可">喫煙可</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                シーン
              </label>
              <input
                type="text"
                value={formData.scenes}
                onChange={(e) => handleInputChange('scenes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 接待,デート,宴会"
              />
            </div>
          </div>
        </div>

        {/* 決済情報 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">決済情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="paymentSaicoin"
                checked={formData.paymentSaicoin}
                onChange={(e) => handleInputChange('paymentSaicoin', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="paymentSaicoin" className="ml-2 block text-sm text-gray-900">
                サイコイン決済
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="paymentTamapon"
                checked={formData.paymentTamapon}
                onChange={(e) => handleInputChange('paymentTamapon', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="paymentTamapon" className="ml-2 block text-sm text-gray-900">
                たまぽん決済
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="paymentCash"
                checked={formData.paymentCash}
                onChange={(e) => handleInputChange('paymentCash', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="paymentCash" className="ml-2 block text-sm text-gray-900">
                現金決済
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                クレジット決済
              </label>
              <input
                type="text"
                value={formData.paymentCredit}
                onChange={(e) => handleInputChange('paymentCredit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: VISA,MasterCard"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                QRコード決済
              </label>
              <input
                type="text"
                value={formData.paymentCode}
                onChange={(e) => handleInputChange('paymentCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: PayPay,LINE Pay"
              />
            </div>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            キャンセル
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? '保存中...' : (isEdit ? '更新' : '作成')}
          </Button>
        </div>
      </form>
    </div>
  );
}
