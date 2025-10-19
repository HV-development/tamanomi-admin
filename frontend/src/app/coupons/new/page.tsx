'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/templates/admin-layout';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import { apiClient } from '@/lib/api';
import type { CouponCreateRequest, CouponStatus, Shop } from '@hv-development/schemas';
import { 
  validateRequired, 
  validateMaxLength, 
  validateFileSize
} from '@/utils/validation';
import { useAuth } from '@/components/contexts/auth-context';
import MerchantSelectModal from '@/components/molecules/MerchantSelectModal';
import ShopSelectModal from '@/components/molecules/ShopSelectModal';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface Merchant {
  id: string;
  name: string;
  account: {
    email: string;
  };
}

interface CouponFormData {
  shopId: string;
  couponName: string;
  couponContent: string;
  couponConditions: string;
  couponImage: File | null;
  imagePreview: string;
  imageUrl: string;
  publishStatus: string;
}

type CouponFormErrors = Partial<Record<keyof CouponFormData, string>>;

function CouponNewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  
  // アカウントタイプの判定
  const isAdminAccount = auth?.user?.accountType === 'admin';
  const isMerchantAccount = auth?.user?.accountType === 'merchant';
  const isShopAccount = auth?.user?.accountType === 'shop';
  
  const [formData, setFormData] = useState<CouponFormData>({
    shopId: '',
    couponName: '',
    couponContent: '',
    couponConditions: '',
    couponImage: null,
    imagePreview: '',
    imageUrl: '',
    publishStatus: 'active',
  });

  const [errors, setErrors] = useState<CouponFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_isUploading, setIsUploading] = useState(false);
  
  // 会社・店舗選択用の状態
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isMerchantModalOpen, setIsMerchantModalOpen] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);

  useEffect(() => {
    // URLパラメータから値を取得してフォームに設定
    if (searchParams) {
      const urlData = {
        couponName: searchParams.get('couponName') || '',
        couponContent: searchParams.get('couponContent') || '',
        publishStatus: searchParams.get('publishStatus') || '',
        imagePreview: searchParams.get('imagePreview') || '',
      };
      
      // いずれかの値が存在する場合のみフォームデータを更新
      if (Object.values(urlData).some(value => value !== '')) {
        setFormData(prev => ({
          ...prev,
          ...urlData,
          couponImage: null, // ファイルはURLパラメータでは復元できない
        }));
      }
    }
    
    // sessionStorageから画像データを復元
    const savedImagePreview = sessionStorage.getItem('couponImagePreview');
    if (savedImagePreview) {
      setFormData(prev => ({
        ...prev,
        imagePreview: savedImagePreview
      }));
      // 使用後は削除
      sessionStorage.removeItem('couponImagePreview');
    }
  }, [searchParams]);
  
  // アカウントタイプに応じた初期化
  useEffect(() => {
    const initializeAccountData = async () => {
      // 店舗アカウントの場合: 会社と店舗情報を自動設定
      if (isShopAccount && auth?.user?.shopId) {
        try {
          const shopData = await apiClient.getShop(auth.user.shopId) as Shop;
          setSelectedShop(shopData);
          setFormData(prev => ({ ...prev, shopId: shopData.id }));
          
          if (shopData.merchant) {
            setSelectedMerchant({
              id: shopData.merchant.id,
              name: shopData.merchant.name,
              account: { email: '' }
            });
          }
        } catch (error) {
          console.error('店舗情報の取得に失敗しました:', error);
        }
      }
      
      // 会社アカウントの場合: 会社情報を自動設定
      if (isMerchantAccount && auth?.user?.merchantId) {
        try {
          const merchantData = await apiClient.getMerchant(auth.user.merchantId) as Merchant;
          setSelectedMerchant(merchantData);
        } catch (error) {
          console.error('会社情報の取得に失敗しました:', error);
        }
      }
    };
    
    initializeAccountData();
  }, [isShopAccount, isMerchantAccount, auth?.user?.shopId, auth?.user?.merchantId]);

  const handleInputChange = (field: keyof CouponFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // リアルタイムバリデーション
    validateField(field, value);
  };

  const validateField = (field: keyof CouponFormData, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'couponName':
        const couponNameError = validateRequired(value, 'クーポン名') || validateMaxLength(value, 15, 'クーポン名');
        if (couponNameError) {
          newErrors.couponName = couponNameError;
        } else {
          delete newErrors.couponName;
        }
        break;

      case 'couponContent':
        const couponContentError = validateRequired(value, 'クーポン内容') || validateMaxLength(value, 100, 'クーポン内容');
        if (couponContentError) {
          newErrors.couponContent = couponContentError;
        } else {
          delete newErrors.couponContent;
        }
        break;

      case 'publishStatus':
        const publishStatusError = validateRequired(value, '公開 / 非公開');
        if (publishStatusError) {
          newErrors.publishStatus = publishStatusError;
        } else {
          delete newErrors.publishStatus;
        }
        break;
    }

    setErrors(newErrors);
  };
  
  // 会社選択ハンドラー
  const handleMerchantSelect = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    // 会社を変更した場合、店舗選択をリセット
    setSelectedShop(null);
    setFormData(prev => ({ ...prev, shopId: '' }));
  };
  
  // 店舗選択ハンドラー
  const handleShopSelect = (shop: Shop) => {
    setSelectedShop(shop);
    setFormData(prev => ({ ...prev, shopId: shop.id }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const newErrors = { ...errors };

    if (file) {
      // 画像形式チェック
      if (!file.type.startsWith('image/')) {
        newErrors.couponImage = '画像ファイルのみアップロード可能です';
        setErrors(newErrors);
        return;
      }
      
      const fileSizeError = validateFileSize(file, 10);
      
      if (fileSizeError) {
        newErrors.couponImage = fileSizeError;
        setErrors(newErrors);
        return;
      }

      // プレビュー表示
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          couponImage: file,
          imagePreview: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);

      // 画像をアップロード
      try {
        setIsUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('type', 'coupon');
        uploadFormData.append('shopId', formData.shopId || 'temp');
        uploadFormData.append('merchantId', 'temp');
        uploadFormData.append('couponId', 'new');
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('画像のアップロードに失敗しました');
        }
        
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          imageUrl: data.url
        }));
      } catch (error) {
        console.error('画像アップロードエラー:', error);
        newErrors.couponImage = '画像のアップロードに失敗しました';
        setErrors(newErrors);
      } finally {
        setIsUploading(false);
      }

      delete newErrors.couponImage;
      setErrors(newErrors);
    }
  };

  const validateAllFields = (): boolean => {
    const newErrors: CouponFormErrors = {};

    // 必須チェック
    const couponNameError = validateRequired(formData.couponName, 'クーポン名') || validateMaxLength(formData.couponName, 15, 'クーポン名');
    if (couponNameError) newErrors.couponName = couponNameError;

    const couponContentError = validateRequired(formData.couponContent, 'クーポン内容') || validateMaxLength(formData.couponContent, 100, 'クーポン内容');
    if (couponContentError) newErrors.couponContent = couponContentError;

    const publishStatusError = validateRequired(formData.publishStatus, '公開 / 非公開');
    if (publishStatusError) newErrors.publishStatus = publishStatusError;
    
    // 店舗選択チェック
    if (!formData.shopId) {
      newErrors.shopId = '店舗を選択してください';
    } else {
      // UUID形式チェック（簡易版）
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(formData.shopId)) {
        newErrors.shopId = '選択された店舗のIDが無効です。別の店舗を選択してください。';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    if (validateAllFields()) {
      try {
        // クーポンを作成
        const couponData: CouponCreateRequest = {
          shopId: formData.shopId,
          title: formData.couponName,
          description: formData.couponContent || null,
          conditions: formData.couponConditions || null,
          imageUrl: formData.imageUrl && formData.imageUrl.trim() !== '' ? formData.imageUrl : null,
          status: (formData.publishStatus === '1' ? 'active' : 'inactive') as CouponStatus
        };
        
        await apiClient.createCoupon(couponData);
        
        // 作成成功後、一覧画面に遷移
        router.push('/coupons');
      } catch (error: unknown) {
        console.error('クーポンの作成に失敗しました:', error);
        
        // エラーメッセージを取得
        let errorMessage = 'クーポンの作成に失敗しました。もう一度お試しください。';
        if (error && typeof error === 'object' && 'response' in error) {
          const apiError = error as { response?: { data?: { message?: string } } };
          if (apiError.response?.data?.message) {
            errorMessage = apiError.response.data.message;
          }
        } else if (error && typeof error === 'object' && 'message' in error) {
          errorMessage = (error as { message: string }).message;
        }
        
        // 店舗IDのバリデーションエラーの場合
        if (errorMessage.includes('shopId') || errorMessage.includes('uuid')) {
          errorMessage = '選択された店舗のIDが無効です。別の店舗を選択してください。';
        }
        
        // imageUrlのバリデーションエラーの場合
        if (errorMessage.includes('imageUrl') || errorMessage.includes('uri')) {
          errorMessage = '画像URLが無効です。画像を再度アップロードしてください。';
        }
        
        alert(errorMessage);
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/coupons');
  };

  return (
    <AdminLayout>
      {/* モーダル */}
      <MerchantSelectModal
        isOpen={isMerchantModalOpen}
        onClose={() => setIsMerchantModalOpen(false)}
        onSelect={handleMerchantSelect}
        selectedMerchantId={selectedMerchant?.id}
      />
      
      <ShopSelectModal
        isOpen={isShopModalOpen}
        onClose={() => setIsShopModalOpen(false)}
        onSelect={handleShopSelect}
        selectedShopId={selectedShop?.id}
        merchantId={selectedMerchant?.id}
      />
      
      <div className="space-y-6">
        {/* ページタイトル */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">クーポン新規登録</h1>
            <p className="text-gray-600">
              新しいクーポンを登録します
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

        {/* 登録フォーム */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-6">
            {/* 会社・店舗選択 */}
            {isAdminAccount && (
              <>
                {/* 管理者：会社選択 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    会社 <span className="text-red-500">*</span>
                  </label>
                  {selectedMerchant && (
                    <div className="mb-2 text-sm text-gray-900">
                      {selectedMerchant.name}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsMerchantModalOpen(true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
                  >
                    会社を選択
                  </button>
                </div>
                
                {/* 管理者：店舗選択 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    店舗 <span className="text-red-500">*</span>
                  </label>
                  {selectedShop && (
                    <div className="mb-2 text-base text-gray-900">
                      {selectedShop.name}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsShopModalOpen(true)}
                    disabled={!selectedMerchant}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    店舗を選択
                  </button>
                  {!selectedMerchant && (
                    <p className="mt-1 text-xs text-gray-500">先に会社を選択してください</p>
                  )}
                  {errors.shopId && (
                    <p className="mt-1 text-sm text-red-500">{errors.shopId}</p>
                  )}
                </div>
              </>
            )}
            
            {isMerchantAccount && (
              <>
                {/* 会社アカウント：会社名表示（変更不可） */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    会社 <span className="text-red-500">*</span>
                  </label>
                  <div className="text-sm text-gray-900 mb-1">
                    {selectedMerchant?.name || '読み込み中...'}
                  </div>
                  <p className="text-xs text-gray-500">自身の会社が設定されています（変更不可）</p>
                </div>
                
                {/* 会社アカウント：店舗選択 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    店舗 <span className="text-red-500">*</span>
                  </label>
                  {selectedShop && (
                    <div className="mb-2 text-sm text-gray-900">
                      {selectedShop.name}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsShopModalOpen(true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
                  >
                    店舗を選択
                  </button>
                  {errors.shopId && (
                    <p className="mt-1 text-sm text-red-500">{errors.shopId}</p>
                  )}
                </div>
              </>
            )}
            
            {isShopAccount && (
              <>
                {/* 店舗アカウント：会社名表示（変更不可） */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    会社 <span className="text-red-500">*</span>
                  </label>
                  <div className="text-sm text-gray-900 mb-1">
                    {selectedMerchant?.name || '読み込み中...'}
                  </div>
                  <p className="text-xs text-gray-500">自身の会社が設定されています（変更不可）</p>
                </div>
                
                {/* 店舗アカウント：店舗名表示（変更不可） */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    店舗 <span className="text-red-500">*</span>
                  </label>
                  <div className="text-sm text-gray-900 mb-1">
                    {selectedShop?.name || '読み込み中...'}
                  </div>
                  <p className="text-xs text-gray-500">自身の店舗が設定されています（変更不可）</p>
                  {errors.shopId && (
                    <p className="mt-1 text-sm text-red-500">{errors.shopId}</p>
                  )}
                </div>
              </>
            )}

            {/* クーポン名 */}
            <div>
              <label htmlFor="couponName" className="block text-sm font-medium text-gray-700 mb-2">
                クーポン名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="couponName"
                placeholder="クーポン名を入力（最大15文字）"
                value={formData.couponName}
                onChange={(e) => handleInputChange('couponName', e.target.value)}
                className={`w-150 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.couponName ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={15}
              />
              {errors.couponName && (
                <p className="mt-1 text-sm text-red-500">{errors.couponName}</p>
              )}
            </div>

            {/* クーポン内容 */}
            <div>
              <label htmlFor="couponContent" className="block text-sm font-medium text-gray-700 mb-2">
                クーポン内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="couponContent"
                placeholder="クーポン内容を入力（最大100文字）"
                value={formData.couponContent}
                onChange={(e) => handleInputChange('couponContent', e.target.value)}
                className={`w-150 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.couponContent ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={3}
                maxLength={100}
              />
              {errors.couponContent && (
                <p className="mt-1 text-sm text-red-500">{errors.couponContent}</p>
              )}
            </div>

            {/* クーポン画像 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                クーポン画像
              </label>
              <div className="space-y-4">
                {/* 画像プレビュー */}
                {formData.imagePreview && (
                  <div>
                    <img
                      src={formData.imagePreview}
                      alt="クーポン画像プレビュー"
                      className="w-64 h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                {/* アップロードボタン */}
                <div>
                  <input
                    type="file"
                    id="couponImage"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('couponImage')?.click()}
                    className="w-full md:w-auto"
                  >
                    画像アップロード
                  </Button>
                  <p className="mt-1 text-xs text-gray-500">
                    PNG, JPG, WEBP形式の画像をアップロードできます（最大10MB）
                  </p>
                </div>
              </div>
              {errors.couponImage && (
                <p className="mt-1 text-sm text-red-500">{errors.couponImage}</p>
              )}
            </div>

            {/* 公開/非公開 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                公開 / 非公開 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="publishStatus"
                    value="1"
                    checked={formData.publishStatus === '1'}
                    onChange={(e) => handleInputChange('publishStatus', e.target.value)}
                    className="mr-2 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">公開する</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="publishStatus"
                    value="2"
                    checked={formData.publishStatus === '2'}
                    onChange={(e) => handleInputChange('publishStatus', e.target.value)}
                    className="mr-2 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">公開しない</span>
                </label>
              </div>
              {errors.publishStatus && (
                <p className="mt-1 text-sm text-red-500">{errors.publishStatus}</p>
              )}
            </div>

            {/* アクションボタン */}
            <div className="flex justify-center space-x-4 pt-6">
              <Button
                variant="outline"
                size="lg"
                onClick={handleCancel}
                className="px-8"
              >
                キャンセル
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8"
              >
                {isSubmitting ? '処理中...' : '登録内容を確認する'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function CouponNewPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <CouponNewPageContent />
    </Suspense>
  );
}
