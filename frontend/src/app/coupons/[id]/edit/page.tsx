'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/templates/admin-layout';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import { apiClient } from '@/lib/api';
import type { CouponWithShop, CouponUpdateRequest } from '@hv-development/schemas';
import { 
  validateRequired, 
  validateMaxLength, 
  validateFileSize
} from '@/utils/validation';
import { useAuth } from '@/components/contexts/auth-context';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface CouponFormData {
  couponName: string;
  couponContent: string;
  couponImage: File | null;
  imagePreview: string;
  imageUrl: string;
  publishStatus: string;
}

function CouponEditPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const couponId = params.id as string;
  const auth = useAuth();
  const isMerchantAccount = auth?.user?.accountType === 'merchant';

  const [formData, setFormData] = useState<CouponFormData>({
    couponName: '',
    couponContent: '',
    couponImage: null,
    imagePreview: '',
    imageUrl: '',
    publishStatus: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CouponFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  //事業者・店舗情報（読み取り専用）
  const [merchantName, setMerchantName] = useState<string>('');
  const [shopName, setShopName] = useState<string>('');

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        setIsLoading(true);
        const data = await apiClient.getCoupon(couponId) as CouponWithShop;
        
        setFormData({
          couponName: data.title,
          couponContent: data.description || '',
          couponImage: null,
          imagePreview: data.imageUrl || '',
          imageUrl: data.imageUrl || '',
          publishStatus: data.status === 'approved' ? '1' : '2',
        });
        
        // 事業者・店舗情報を設定
        if (data.shop) {
          setShopName(data.shop.name);
          if (data.shop.merchant) {
            setMerchantName(data.shop.merchant.name);
          }
        }
      } catch (error) {
        console.error('クーポン情報の取得に失敗しました:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // URLパラメータから値を取得してフォームに設定（修正ボタンからの遷移時）
    if (searchParams && searchParams.get('couponName')) {
      const urlData = {
        couponName: searchParams.get('couponName') || '',
        couponContent: searchParams.get('couponContent') || '',
        publishStatus: searchParams.get('publishStatus') || '',
        imagePreview: searchParams.get('imagePreview') || '',
      };
      
      setFormData(prev => ({
        ...prev,
        ...urlData,
        couponImage: null,
      }));
      setIsLoading(false);
    } else {
      fetchCoupon();
    }
  }, [couponId, searchParams]);

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

    }

    setErrors(newErrors);
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
        uploadFormData.append('shopId', 'temp');
        uploadFormData.append('merchantId', 'temp');
        uploadFormData.append('couponId', couponId);
        
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
    const newErrors: Partial<Record<keyof CouponFormData, string>> = {};

    // 必須チェック
    const couponNameError = validateRequired(formData.couponName, 'クーポン名') || validateMaxLength(formData.couponName, 15, 'クーポン名');
    if (couponNameError) newErrors.couponName = couponNameError;

    const couponContentError = validateRequired(formData.couponContent, 'クーポン内容') || validateMaxLength(formData.couponContent, 100, 'クーポン内容');
    if (couponContentError) newErrors.couponContent = couponContentError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    if (validateAllFields()) {
      try {
        const updateData: CouponUpdateRequest = {
          title: formData.couponName,
          description: formData.couponContent || null,
          imageUrl: formData.imageUrl || null
        };
        
        await apiClient.updateCoupon(couponId, updateData);
        router.push('/coupons');
      } catch (error) {
        console.error('クーポンの更新に失敗しました:', error);
        alert('クーポンの更新に失敗しました。もう一度お試しください。');
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/coupons');
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">データを読み込んでいます...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* ページタイトル */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">クーポン編集</h1>
            <p className="text-gray-600">
              クーポン情報を編集します
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

        {/* 編集フォーム */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-6">
            {/* 事業者情報（読み取り専用） */}
            {merchantName && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  事業者
                </label>
                <div className="text-sm text-gray-900">
                  {merchantName}
                </div>
              </div>
            )}
            
            {/* 店舗情報（読み取り専用） */}
            {shopName && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  店舗
                </label>
                <div className="text-sm text-gray-900">
                  {shopName}
                </div>
              </div>
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
                クーポン画像 <span className="text-red-500">*</span>
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
                    disabled={isUploading}
                  >
                    {isUploading ? 'アップロード中...' : '画像アップロード'}
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
                disabled={isSubmitting || isUploading}
                className="px-8"
              >
                {isSubmitting ? '更新中...' : (isMerchantAccount ? '申請する' : '更新する')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function CouponEditPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <CouponEditPageContent />
    </Suspense>
  );
}
