'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import DashboardLayout from '@/components/templates/dashboard-layout';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';

interface ShopData {
  storeName: string;
  storeDescription: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
  building: string;
  phone: string;
  homepage: string;
  genres: string;
  storeCode: string;
}

export default function ShopEditConfirmation() {
  const searchParams = useSearchParams();
  const params = useParams();
  const storeId = params.id as string;
  const [shopData, setShopData] = useState<ShopData | null>(null);

  useEffect(() => {
    const data: ShopData = {
      storeName: searchParams.get('storeName') || '',
      storeDescription: searchParams.get('storeDescription') || '',
      postalCode: searchParams.get('postalCode') || '',
      prefecture: searchParams.get('prefecture') || '',
      city: searchParams.get('city') || '',
      address: searchParams.get('address') || '',
      building: searchParams.get('building') || '',
      phone: searchParams.get('phone') || '',
      homepage: searchParams.get('homepage') || '',
      genres: searchParams.get('genres') || '',
      storeCode: searchParams.get('storeCode') || '',
    };
    setShopData(data);
  }, [searchParams]);

  const handleModify = () => {
    // 店舗編集画面に戻る（データを保持）
    const queryParams = new URLSearchParams({
      storeName: shopData?.storeName || '',
      storeDescription: shopData?.storeDescription || '',
      postalCode: shopData?.postalCode || '',
      prefecture: shopData?.prefecture || '',
      city: shopData?.city || '',
      address: shopData?.address || '',
      building: shopData?.building || '',
      phone: shopData?.phone || '',
      homepage: shopData?.homepage || '',
      genres: shopData?.genres || '',
      storeCode: shopData?.storeCode || '',
    });
    
    window.location.href = `/stores/${storeId}/edit?${queryParams.toString()}`;
  };

  const handleUpdate = () => {
    // 実際の更新処理（APIコール等）
    console.log('店舗更新:', shopData);
    alert('店舗情報を更新しました');
    // 更新後は店舗一覧画面に遷移
    window.location.href = '/stores';
  };

  if (!shopData) {
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
            <h1 className="text-2xl font-bold text-gray-900">店舗変更内容確認</h1>
            <p className="text-gray-600">
              変更内容を確認してください
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
                店舗名
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{shopData.storeName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                店舗紹介内容
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{shopData.storeDescription}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                郵便番号
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{shopData.postalCode}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                都道府県
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{shopData.prefecture}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                市区町村
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{shopData.city}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                番地以降
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{shopData.address}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                建物名
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{shopData.building || '（未入力）'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{shopData.phone}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ホームページ
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">
                {shopData.homepage || '（未入力）'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ジャンル
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{shopData.genres}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                店舗CD
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{shopData.storeCode}</p>
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
              変更内容を修正する
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleUpdate}
              className="px-8"
            >
              変更する
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}