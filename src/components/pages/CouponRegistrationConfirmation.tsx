'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '../templates/DashboardLayout';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

interface CouponData {
  couponName: string;
  couponContent: string;
  couponType: string;
  publishStatus: string;
  imagePreview: string;
}

export default function CouponRegistrationConfirmation() {
  const searchParams = useSearchParams();
  const [couponData, setCouponData] = useState<CouponData | null>(null);

  useEffect(() => {
    const data: CouponData = {
      couponName: searchParams.get('couponName') || '',
      couponContent: searchParams.get('couponContent') || '',
      couponType: searchParams.get('couponType') || '',
      publishStatus: searchParams.get('publishStatus') || '',
      imagePreview: searchParams.get('imagePreview') || '',
    };
    setCouponData(data);
  }, [searchParams]);

  const getCouponTypeLabel = (type: string) => {
    switch (type) {
      case '1':
        return 'アルコール';
      case '2':
        return 'ソフトドリンク';
      default:
        return '';
    }
  };

  const getPublishStatusLabel = (status: string) => {
    switch (status) {
      case '1':
        return '公開する';
      case '2':
        return '公開しない';
      default:
        return '';
    }
  };

  const handleModify = () => {
    // クーポン登録画面に戻る（データを保持）
    const queryParams = new URLSearchParams({
      couponName: couponData?.couponName || '',
      couponContent: couponData?.couponContent || '',
      couponType: couponData?.couponType || '',
      publishStatus: couponData?.publishStatus || '',
      imagePreview: couponData?.imagePreview || '',
    });
    
    window.location.href = `/coupons/new?${queryParams.toString()}`;
  };

  const handleRegister = () => {
    // 実際の登録処理（APIコール等）
    console.log('クーポン登録:', couponData);
    alert('クーポンを登録しました');
    // 登録後はクーポン一覧画面に遷移
    window.location.href = '/coupons';
  };

  if (!couponData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">データを読み込んでいます...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ページタイトル */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">クーポン登録内容確認</h1>
            <p className="text-gray-600">
              入力内容を確認してください
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

        {/* 確認内容 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                クーポン名
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{couponData.couponName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                クーポン内容
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{couponData.couponContent}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                クーポン種別
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{getCouponTypeLabel(couponData.couponType)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                クーポン画像
              </label>
              <div className="bg-gray-50 p-2 rounded">
                {couponData.imagePreview ? (
                  <img
                    src={couponData.imagePreview}
                    alt="クーポン画像プレビュー"
                    className="w-64 h-48 object-cover rounded-lg"
                  />
                ) : (
                  <p className="text-gray-500">画像がアップロードされていません</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                公開 / 非公開
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{getPublishStatusLabel(couponData.publishStatus)}</p>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex justify-center space-x-4 pt-6 mt-6 border-t border-gray-200">
            <Button
              variant="outline"
              size="lg"
              onClick={handleModify}
              className="px-8"
            >
              登録内容を修正する
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleRegister}
              className="px-8"
            >
              登録する
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}