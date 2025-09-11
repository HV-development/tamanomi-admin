'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../templates/DashboardLayout';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

interface Coupon {
  id: string;
  status: number;
  type: number;
  name: string;
  content: string;
  imageUrl: string;
  createdAt: string;
}

// サンプルデータ
const sampleCoupons: Record<string, Coupon> = {
  'CP001': {
    id: 'CP001',
    status: 1,
    type: 1,
    name: '新規会員限定10%オフクーポン',
    content: '新規会員登録をしていただいた方限定で、全メニュー10%オフでご提供いたします。',
    imageUrl: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=400',
    createdAt: '2024-01-15 10:30:00',
  },
  'CP002': {
    id: 'CP002',
    status: 1,
    type: 2,
    name: '誕生日特典20%オフクーポン',
    content: 'お誕生日月の方限定で、アルコール類20%オフでご提供いたします。',
    imageUrl: 'https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg?auto=compress&cs=tinysrgb&w=400',
    createdAt: '2024-01-20 09:00:00',
  },
  'CP003': {
    id: 'CP003',
    status: 2,
    type: 1,
    name: '年末年始限定500円オフクーポン',
    content: '年末年始期間限定で、ソフトドリンク500円オフでご提供いたします。',
    imageUrl: 'https://images.pexels.com/photos/544961/pexels-photo-544961.jpeg?auto=compress&cs=tinysrgb&w=400',
    createdAt: '2024-12-01 12:00:00',
  },
};

export default function CouponDetail() {
  const params = useParams();
  const couponId = params.id as string;
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 実際はAPIからクーポンデータを取得
    const couponData = sampleCoupons[couponId];
    if (couponData) {
      setCoupon(couponData);
    }
    setIsLoading(false);
  }, [couponId]);

  const getStatusLabel = (status: number) => {
    return status === 1 ? '公開中' : '非公開';
  };

  const getStatusColor = (status: number) => {
    return status === 1 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: number) => {
    return type === 1 ? 'ソフトドリンク' : 'アルコール';
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">データを読み込んでいます...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!coupon) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">クーポンが見つかりません</h3>
          <p className="text-gray-500 mb-4">指定されたクーポンは存在しません。</p>
          <Link href="/coupons">
            <Button variant="primary">クーポン一覧に戻る</Button>
          </Link>
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
            <h1 className="text-2xl font-bold text-gray-900">クーポン詳細</h1>
            <p className="text-gray-600">
              クーポンの詳細情報を表示します
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

        {/* クーポン詳細 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-6">
            {/* クーポンID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                クーポンID
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{coupon.id}</p>
            </div>

            {/* ステータス */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{getStatusLabel(coupon.status)}</p>
            </div>

            {/* クーポン種別 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                クーポン種別
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{getTypeLabel(coupon.type)}</p>
            </div>

            {/* クーポン名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                クーポン名
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{coupon.name}</p>
            </div>

            {/* クーポン内容 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                クーポン内容
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{coupon.content}</p>
            </div>

            {/* クーポン画像 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                クーポン画像
              </label>
              <div className="bg-gray-50 p-3 rounded">
                <img 
                  src={coupon.imageUrl} 
                  alt={coupon.name}
                  className="w-64 h-48 object-cover rounded-lg shadow-sm"
                />
              </div>
            </div>

            {/* 作成日時 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                作成日時
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{coupon.createdAt}</p>
            </div>

            {/* アクションボタン */}
            <div className="flex justify-center space-x-4 pt-6 border-t border-gray-200">
              <Link href="/coupon-history">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  戻る
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={handlePreview}
                className="px-8"
              >
                プレビュー
              </Button>
            </div>
          </div>
        </div>

        {/* プレビューモーダル */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
              {/* スマホデバイス風のヘッダー */}
              <div className="bg-gray-900 text-white p-4 rounded-t-lg relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <button
                    onClick={handleClosePreview}
                    className="text-white hover:text-gray-300 text-xl font-bold"
                  >
                    ×
                  </button>
                </div>
                <div className="text-center mt-2">
                  <p className="text-sm">たまのみアプリ</p>
                </div>
              </div>

              {/* プレビュー内容 */}
              <div className="p-6 space-y-4">
                <div className="text-center">
                  <img 
                    src={coupon.imageUrl} 
                    alt={coupon.name}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    クーポン種別
                  </label>
                  <p className="text-sm text-gray-900">{getTypeLabel(coupon.type)}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    クーポン名
                  </label>
                  <p className="text-sm font-medium text-gray-900">{coupon.name}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    クーポン内容
                  </label>
                  <p className="text-sm text-gray-900">{coupon.content}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    作成日時
                  </label>
                  <p className="text-xs text-gray-600">{coupon.createdAt}</p>
                </div>

                <div className="pt-4">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={handleClosePreview}
                  >
                    このクーポンを使用する
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}