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
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 overflow-hidden">
              {/* スマホデバイス風のヘッダー */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <div className="w-1 h-1 bg-white rounded-full opacity-60"></div>
                    <div className="w-1 h-1 bg-white rounded-full opacity-60"></div>
                    <div className="w-1 h-1 bg-white rounded-full opacity-60"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-sm font-medium">たまのみ</div>
                    <div className="text-xs opacity-80">9:41</div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="text-xs opacity-80">100%</div>
                    <div className="w-6 h-3 border border-white rounded-sm opacity-80">
                      <div className="w-full h-full bg-white rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* アプリヘッダー */}
              <div className="bg-white border-b border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm font-bold">た</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">クーポン詳細</div>
                    </div>
                  </div>
                  <button
                    onClick={handleClosePreview}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* プレビュー内容 */}
              <div className="p-4 space-y-4 bg-gray-50">
                {/* クーポン画像 */}
                <div className="relative">
                  <img 
                    src={coupon.imageUrl} 
                    alt={coupon.name}
                    className="w-full h-48 object-cover rounded-xl shadow-sm"
                  />
                  <div className="absolute top-3 right-3 bg-white bg-opacity-90 backdrop-blur-sm px-2 py-1 rounded-full">
                    <span className="text-xs font-medium text-gray-700">
                      {getTypeLabel(coupon.type)}
                    </span>
                  </div>
                </div>

                {/* クーポン情報カード */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 leading-tight">
                        {coupon.name}
                      </h3>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800 leading-relaxed">
                        {coupon.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>発行日: {coupon.createdAt.split(' ')[0]}</span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                        利用可能
                      </span>
                    </div>
                  </div>
                </div>

                {/* 利用ボタン */}
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 rounded-xl shadow-sm"
                    onClick={handleClosePreview}
                  >
                    このクーポンを使用する
                  </Button>
                </div>

                {/* 注意事項 */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">ご利用上の注意</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• 他のクーポンとの併用はできません</li>
                    <li>• 有効期限内にご利用ください</li>
                    <li>• 店舗スタッフにこの画面をお見せください</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}