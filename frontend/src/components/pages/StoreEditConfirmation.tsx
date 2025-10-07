'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import DashboardLayout from '@/components/templates/dashboard-layout';
import Button from '@/components/atoms/button';
import Icon from '@/components/atoms/icon';

interface StoreData {
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

export default function StoreEditConfirmation() {
  const searchParams = useSearchParams();
  const params = useParams();
  const storeId = params.id as string;
  const [storeData, setStoreData] = useState<StoreData | null>(null);

  useEffect(() => {
    const data: StoreData = {
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
    setStoreData(data);
  }, [searchParams]);

  const handleModify = () => {
    // 店舗編集画面に戻る（データを保持）
    const queryParams = new URLSearchParams({
      storeName: storeData?.storeName || '',
      storeDescription: storeData?.storeDescription || '',
      postalCode: storeData?.postalCode || '',
      prefecture: storeData?.prefecture || '',
      city: storeData?.city || '',
      address: storeData?.address || '',
      building: storeData?.building || '',
      phone: storeData?.phone || '',
      homepage: storeData?.homepage || '',
      genres: storeData?.genres || '',
      storeCode: storeData?.storeCode || '',
    });
    
    window.location.href = `/stores/${storeId}/edit?${queryParams.toString()}`;
  };

  const handleUpdate = () => {
    // 実際の更新処理（APIコール等）
    console.log('店舗更新:', storeData);
    alert('店舗情報を更新しました');
    // 更新後は店舗一覧画面に遷移
    window.location.href = '/stores';
  };

  if (!storeData) {
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
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{storeData.storeName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                店舗紹介内容
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{storeData.storeDescription}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                郵便番号
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{storeData.postalCode}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                都道府県
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{storeData.prefecture}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                市区町村
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{storeData.city}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                番地以降
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{storeData.address}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                建物名
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{storeData.building || '（未入力）'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{storeData.phone}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ホームページ
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">
                {storeData.homepage || '（未入力）'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ジャンル
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{storeData.genres}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                店舗CD
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{storeData.storeCode}</p>
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