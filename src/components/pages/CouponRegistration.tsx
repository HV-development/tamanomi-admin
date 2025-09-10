'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../templates/DashboardLayout';
import Button from '../atoms/Button';

interface CouponFormData {
  couponName: string;
  couponContent: string;
  couponType: string;
  couponImage: File | null;
  imagePreview: string;
  publishStatus: string;
}

export default function CouponRegistration() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<CouponFormData>({
    couponName: '',
    couponContent: '',
    couponType: '',
    couponImage: null,
    imagePreview: '',
    publishStatus: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CouponFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        if (!value.trim()) {
          newErrors.couponName = 'クーポン名を入力してください';
        } else if (value.length > 15) {
          newErrors.couponName = 'クーポン名は15文字以内で入力してください';
        } else {
          delete newErrors.couponName;
        }
        break;

      case 'couponContent':
        if (!value.trim()) {
          newErrors.couponContent = 'クーポン内容を入力してください';
        } else if (value.length > 100) {
          newErrors.couponContent = 'クーポン内容は100文字以内で入力してください';
        } else {
          delete newErrors.couponContent;
        }
        break;

      case 'couponType':
        if (!value) {
          newErrors.couponType = 'クーポン種別を選択してください';
        } else {
          delete newErrors.couponType;
        }
        break;

      case 'publishStatus':
        if (!value) {
          newErrors.publishStatus = '公開 / 非公開を選択してください';
        } else {
          delete newErrors.publishStatus;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const newErrors = { ...errors };

    if (file) {
      // 画像形式チェック
      if (!file.type.startsWith('image/jpeg')) {
        newErrors.couponImage = 'このファイル形式はサポートされていません';
        setErrors(newErrors);
        return;
      }

      // ファイルサイズチェック（5MB以下）
      if (file.size > 5 * 1024 * 1024) {
        newErrors.couponImage = 'ファイルサイズは5MB以下にしてください';
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

      delete newErrors.couponImage;
      setErrors(newErrors);
    }
  };

  const validateAllFields = (): boolean => {
    const newErrors: Partial<Record<keyof CouponFormData, string>> = {};

    // 必須チェック
    if (!formData.couponName.trim()) {
      newErrors.couponName = 'クーポン名を入力してください';
    }
    if (!formData.couponContent.trim()) {
      newErrors.couponContent = 'クーポン内容を入力してください';
    }
    if (!formData.couponType) {
      newErrors.couponType = 'クーポン種別を選択してください';
    }
    if (!formData.couponImage) {
      newErrors.couponImage = 'クーポン画像をアップロードしてください';
    }
    if (!formData.publishStatus) {
      newErrors.publishStatus = '公開 / 非公開を選択してください';
    }

    // 文字数チェック
    if (formData.couponName.length > 15) {
      newErrors.couponName = 'クーポン名は15文字以内で入力してください';
    }
    if (formData.couponContent.length > 100) {
      newErrors.couponContent = 'クーポン内容は100文字以内で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    if (validateAllFields()) {
      // 登録内容確認画面に遷移
      const queryParams = new URLSearchParams({
        couponName: formData.couponName,
        couponContent: formData.couponContent,
        couponType: formData.couponType,
        publishStatus: formData.publishStatus,
        // 画像はBase64エンコードして渡す（実際のアプリではS3 URLなどを使用）
        imagePreview: formData.imagePreview,
      });
      
      router.push(`/coupons/confirm?${queryParams.toString()}`);
    } else {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/coupons');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ページタイトル */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">クーポン新規登録</h1>
          <p className="mt-2 text-gray-600">
            新しいクーポンを登録します
          </p>
        </div>

        {/* 登録フォーム */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-6">
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.couponContent ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={3}
                maxLength={100}
              />
              {errors.couponContent && (
                <p className="mt-1 text-sm text-red-500">{errors.couponContent}</p>
              )}
            </div>

            {/* クーポン種別 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                クーポン種別 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="couponType"
                    value="1"
                    checked={formData.couponType === '1'}
                    onChange={(e) => handleInputChange('couponType', e.target.value)}
                    className="mr-2 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">アルコール</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="couponType"
                    value="2"
                    checked={formData.couponType === '2'}
                    onChange={(e) => handleInputChange('couponType', e.target.value)}
                    className="mr-2 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">ソフトドリンク</span>
                </label>
              </div>
              {errors.couponType && (
                <p className="mt-1 text-sm text-red-500">{errors.couponType}</p>
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
                  <div className="border border-gray-300 rounded-lg p-4">
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
                    accept="image/jpeg"
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
                    JPEG形式のみ対応（最大5MB）
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
    </DashboardLayout>
  );
}