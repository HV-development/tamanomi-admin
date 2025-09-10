'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../templates/DashboardLayout';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

interface CouponUsage {
  id: string;
  couponId: string;
  couponName: string;
  userId: string;
  nickname: string;
  gender: number;
  birthDate: string;
  address: string;
  usedAt: string;
}

// サンプルデータ
const sampleCouponUsages: CouponUsage[] = [
  {
    id: 'CU001',
    couponId: 'CP001',
    couponName: '新規会員限定10%オフクーポン',
    userId: 'U001',
    nickname: '田中太郎',
    gender: 1,
    birthDate: '1990/05/15',
    address: '埼玉県さいたま市浦和区高砂1-1-1',
    usedAt: '2024/01/15 14:30',
  },
  {
    id: 'CU002',
    couponId: 'CP002',
    couponName: '誕生日特典20%オフクーポン',
    userId: 'U002',
    nickname: '佐藤花子',
    gender: 2,
    birthDate: '1985/08/22',
    address: '埼玉県さいたま市浦和区仲町2-2-2',
    usedAt: '2024/01/20 18:45',
  },
  {
    id: 'CU003',
    couponId: 'CP001',
    couponName: '新規会員限定10%オフクーポン',
    userId: 'U003',
    nickname: '鈴木次郎',
    gender: 1,
    birthDate: '1995/12/03',
    address: '埼玉県さいたま市浦和区大東3-3-3',
    usedAt: '2024/02/01 12:15',
  },
  {
    id: 'CU004',
    couponId: 'CP003',
    couponName: '年末年始限定500円オフクーポン',
    userId: 'U004',
    nickname: '山田美咲',
    gender: 2,
    birthDate: '1992/03/18',
    address: '埼玉県さいたま市浦和区岸町4-4-4',
    usedAt: '2024/02/10 16:20',
  },
  {
    id: 'CU005',
    couponId: 'CP002',
    couponName: '誕生日特典20%オフクーポン',
    userId: 'U001',
    nickname: '田中太郎',
    gender: 1,
    birthDate: '1990/05/15',
    address: '埼玉県さいたま市浦和区高砂1-1-1',
    usedAt: '2024/02/15 19:30',
  },
];

export default function CouponHistory() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  
  const [searchForm, setSearchForm] = useState({
    usageId: '',
    couponId: '',
    couponName: '',
    userId: '',
    nickname: '',
    usedDateStart: '',
    usedDateEnd: '',
  });

  const [showBackButton, setShowBackButton] = useState(false);
  const [backUrl, setBackUrl] = useState('');
  const [pageTitle, setPageTitle] = useState('クーポン利用履歴');
  const [filteredUsages, setFilteredUsages] = useState<CouponUsage[]>([]);
  const [isFromCouponDetail, setIsFromCouponDetail] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  useEffect(() => {
    // 遷移元を判定して戻るボタンの表示を制御
    if (pathname.includes('/coupons/') && pathname.includes('/history')) {
      // クーポン詳細からの遷移
      const couponId = pathname.split('/')[2];
      setShowBackButton(true);
      setBackUrl(`/coupons/${couponId}`);
      setPageTitle('クーポン一覧詳細');
      setIsFromCouponDetail(true);
      
      // 該当クーポンの利用履歴のみを表示
      const couponUsages = sampleCouponUsages.filter(usage => usage.couponId === couponId);
      setFilteredUsages(couponUsages);
    } else if (pathname.includes('/users/') && pathname.includes('/coupon-history')) {
      // ユーザー詳細からの遷移
      const userId = pathname.split('/')[2];
      setShowBackButton(true);
      setBackUrl(`/users/${userId}`);
      setPageTitle('クーポン利用履歴');
      setIsFromCouponDetail(false);
      
      // 該当ユーザーの利用履歴のみを表示
      const userUsages = sampleCouponUsages.filter(usage => usage.userId === userId);
      setFilteredUsages(userUsages);
    } else if (pathname === '/coupon-history') {
      // クーポン一覧またはユーザー一覧からの遷移（referrerで判定）
      setShowBackButton(true);
      setBackUrl('/coupons'); // デフォルトはクーポン一覧
      setPageTitle('クーポン利用履歴');
      setIsFromCouponDetail(false);
      setFilteredUsages(sampleCouponUsages);
    }
  }, [pathname]);

  useEffect(() => {
    // フィルタリング処理
    let baseUsages = sampleCouponUsages;
    
    // 遷移元に応じて基本データを設定
    if (pathname.includes('/coupons/') && pathname.includes('/history')) {
      const couponId = pathname.split('/')[2];
      baseUsages = sampleCouponUsages.filter(usage => usage.couponId === couponId);
    } else if (pathname.includes('/users/') && pathname.includes('/coupon-history')) {
      const userId = pathname.split('/')[2];
      baseUsages = sampleCouponUsages.filter(usage => usage.userId === userId);
    }
    
    const filtered = baseUsages.filter((usage) => {
      const matchesSearch = 
        (searchForm.usageId === '' || usage.id.toLowerCase().includes(searchForm.usageId.toLowerCase())) &&
        (searchForm.couponId === '' || usage.couponId.toLowerCase().includes(searchForm.couponId.toLowerCase())) &&
        (searchForm.couponName === '' || usage.couponName.toLowerCase().includes(searchForm.couponName.toLowerCase())) &&
        (searchForm.userId === '' || usage.userId.toLowerCase().includes(searchForm.userId.toLowerCase())) &&
        (searchForm.nickname === '' || usage.nickname.toLowerCase().includes(searchForm.nickname.toLowerCase()));

      // 利用日範囲チェック
      let matchesDateRange = true;
      if (searchForm.usedDateStart || searchForm.usedDateEnd) {
        const usageDate = new Date(usage.usedAt.split(' ')[0].replace(/\//g, '-'));
        if (searchForm.usedDateStart) {
          const startDate = new Date(searchForm.usedDateStart);
          if (usageDate < startDate) matchesDateRange = false;
        }
        if (searchForm.usedDateEnd) {
          const endDate = new Date(searchForm.usedDateEnd);
          if (usageDate > endDate) matchesDateRange = false;
        }
      }
      
      return matchesSearch && matchesDateRange;
    });
    
    setFilteredUsages(filtered);
  }, [searchForm, pathname]);

  const handleInputChange = (field: keyof typeof searchForm, value: string) => {
    setSearchForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    // 検索処理は既にリアルタイムで実行されているため、特別な処理は不要
    console.log('検索実行:', searchForm);
  };

  const handleClear = () => {
    setSearchForm({
      usageId: '',
      couponId: '',
      couponName: '',
      userId: '',
      nickname: '',
      usedDateStart: '',
      usedDateEnd: '',
    });
  };

  const handleBack = () => {
    router.push(backUrl);
  };

  const getGenderLabel = (gender: number) => {
    switch (gender) {
      case 1:
        return '男性';
      case 2:
        return '女性';
      case 3:
        return '未回答';
      default:
        return '未回答';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-gray-600">
              {isFromCouponDetail ? 'このクーポンの利用履歴を表示します' : 'クーポンの利用履歴を管理します'}
            </p>
            </div>
            <div className="text-sm text-gray-600">
              ログインユーザー: <span className="font-medium text-gray-900">管理者太郎</span>
            </div>
          </div>
        </div>

        {/* 検索フォーム（クーポン詳細からの遷移時は簡略化） */}
        {!isFromCouponDetail && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="pb-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">検索条件</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="flex items-center focus:outline-none"
            >
              <Icon name={isSearchExpanded ? 'chevronUp' : 'chevronDown'} size="sm" />
            </Button>
          </div>
          
          {isSearchExpanded && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 利用ID */}
            <div>
              <label htmlFor="usageId" className="block text-sm font-medium text-gray-700 mb-2">
                利用ID
              </label>
              <input
                type="text"
                id="usageId"
                placeholder="利用IDを入力"
                value={searchForm.usageId}
                onChange={(e) => handleInputChange('usageId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* クーポンID */}
            <div>
              <label htmlFor="couponId" className="block text-sm font-medium text-gray-700 mb-2">
                クーポンID
              </label>
              <input
                type="text"
                id="couponId"
                placeholder="クーポンIDを入力"
                value={searchForm.couponId}
                onChange={(e) => handleInputChange('couponId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* クーポン名 */}
            <div>
              <label htmlFor="couponName" className="block text-sm font-medium text-gray-700 mb-2">
                クーポン名
              </label>
              <input
                type="text"
                id="couponName"
                placeholder="クーポン名を入力"
                value={searchForm.couponName}
                onChange={(e) => handleInputChange('couponName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* ユーザーID */}
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                ユーザーID
              </label>
              <input
                type="text"
                id="userId"
                placeholder="ユーザーIDを入力"
                value={searchForm.userId}
                onChange={(e) => handleInputChange('userId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* ニックネーム */}
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
                ニックネーム
              </label>
              <input
                type="text"
                id="nickname"
                placeholder="ニックネームを入力"
                value={searchForm.nickname}
                onChange={(e) => handleInputChange('nickname', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* 利用日範囲指定 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              利用日（範囲指定）
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="usedDateStart" className="block text-xs text-gray-500 mb-1">
                  開始日
                </label>
                <input
                  type="date"
                  id="usedDateStart"
                  value={searchForm.usedDateStart}
                  onChange={(e) => handleInputChange('usedDateStart', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label htmlFor="usedDateEnd" className="block text-xs text-gray-500 mb-1">
                  終了日
                </label>
                <input
                  type="date"
                  id="usedDateEnd"
                  value={searchForm.usedDateEnd}
                  onChange={(e) => handleInputChange('usedDateEnd', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>

            {/* 検索・クリアボタン */}
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="primary" onClick={handleSearch}>
                検索
              </Button>
              <Button variant="outline" onClick={handleClear}>
                クリア
              </Button>
            </div>
          </div>
          )}
        </div>
        )}

        {/* クーポン利用履歴一覧（クーポン詳細からの遷移時は表示項目を調整） */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {isFromCouponDetail ? 'クーポン利用履歴' : 'クーポン利用履歴一覧'} ({filteredUsages.length}件)
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    クーポン利用ID
                  </th>
                  {!isFromCouponDetail && (
                    <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    クーポンID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    クーポン名
                  </th>
                    </>
                  )}
                  {isFromCouponDetail && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      クーポン名
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ユーザーID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ニックネーム
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    性別
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    生年月日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    住所
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    利用日時
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsages.map((usage) => (
                  <tr key={usage.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{usage.id}</div>
                    </td>
                    {!isFromCouponDetail && (
                      <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        href={`/coupons/${usage.couponId}`}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        {usage.couponId}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{usage.couponName}</div>
                    </td>
                      </>
                    )}
                    {isFromCouponDetail && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          href={`/coupons/${usage.couponId}`}
                          className="text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          {usage.couponName}
                        </Link>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        href={`/users/${usage.userId}`}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        {usage.userId}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{usage.nickname}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getGenderLabel(usage.gender)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{usage.birthDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{usage.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{usage.usedAt}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsages.length === 0 && (
            <div className="text-center py-12">
              <Icon name="history" size="lg" className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">利用履歴が見つかりません</h3>
              <p className="text-gray-500">検索条件を変更してお試しください。</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}