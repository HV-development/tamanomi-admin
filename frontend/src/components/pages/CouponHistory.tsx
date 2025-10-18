'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/templates/admin-layout';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';

// TODO: 将来的にAPIから取得する際は、@hv-development/schemasから型をインポート
// import type { CouponUsage } from '@hv-development/schemas';

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
  { id: 'CU001', couponId: 'CP001', couponName: '新規会員限定10%オフクーポン', userId: '1', nickname: '田中太郎', gender: 1, birthDate: '1990/05/15', address: '埼玉県さいたま市浦和区高砂1-1-1', usedAt: '2024/01/15 14:30' },
  { id: 'CU002', couponId: 'CP002', couponName: '誕生日特典20%オフクーポン', userId: '2', nickname: '佐藤花子', gender: 2, birthDate: '1985/08/22', address: '埼玉県さいたま市浦和区仲町2-2-2', usedAt: '2024/01/20 18:45' },
  { id: 'CU003', couponId: 'CP001', couponName: '新規会員限定10%オフクーポン', userId: '3', nickname: '鈴木次郎', gender: 1, birthDate: '1995/12/03', address: '埼玉県さいたま市浦和区大東3-3-3', usedAt: '2024/02/01 12:15' },
  { id: 'CU004', couponId: 'CP003', couponName: '年末年始限定500円オフクーポン', userId: '4', nickname: '山田美咲', gender: 2, birthDate: '1992/03/18', address: '埼玉県さいたま市浦和区岸町4-4-4', usedAt: '2024/02/10 16:20' },
  { id: 'CU005', couponId: 'CP002', couponName: '誕生日特典20%オフクーポン', userId: '1', nickname: '田中太郎', gender: 1, birthDate: '1990/05/15', address: '埼玉県さいたま市浦和区高砂1-1-1', usedAt: '2024/02/15 19:30' },
  { id: 'CU006', couponId: 'CP005', couponName: '平日限定ドリンク半額クーポン', userId: '5', nickname: '高橋健一', gender: 1, birthDate: '1988/07/12', address: '埼玉県さいたま市大宮区仲町5-5-5', usedAt: '2024/02/20 13:45' },
  { id: 'CU007', couponId: 'CP006', couponName: '学生限定20%オフクーポン', userId: '6', nickname: '伊藤美由紀', gender: 2, birthDate: '1993/11/28', address: '埼玉県さいたま市大宮区土手町6-6-6', usedAt: '2024/02/25 16:10' },
  { id: 'CU008', couponId: 'CP008', couponName: 'ハッピーアワー限定クーポン', userId: '7', nickname: '渡辺誠', gender: 1, birthDate: '1991/04/05', address: '埼玉県さいたま市大宮区桜木町7-7-7', usedAt: '2024/03/01 17:20' },
  { id: 'CU009', couponId: 'CP009', couponName: '友達紹介特典クーポン', userId: '8', nickname: '中村麻衣', gender: 2, birthDate: '1987/09/14', address: '埼玉県さいたま市大宮区高鼻町8-8-8', usedAt: '2024/03/05 14:55' },
  { id: 'CU010', couponId: 'CP011', couponName: 'グループ利用特典クーポン', userId: '9', nickname: '小林大輔', gender: 1, birthDate: '1994/12/21', address: '埼玉県さいたま市大宮区北袋町9-9-9', usedAt: '2024/03/10 19:15' },
  { id: 'CU011', couponId: 'CP012', couponName: 'デザート無料クーポン', userId: '10', nickname: '加藤優子', gender: 2, birthDate: '1989/06/30', address: '埼玉県さいたま市浦和区岸町10-10-10', usedAt: '2024/03/15 15:30' },
  { id: 'CU012', couponId: 'CP014', couponName: '初回来店限定クーポン', userId: '11', nickname: '吉田修平', gender: 1, birthDate: '1992/01/17', address: '埼玉県さいたま市浦和区仲町11-11-11', usedAt: '2024/03/20 12:40' },
  { id: 'CU013', couponId: 'CP015', couponName: 'ランチタイム限定クーポン', userId: '12', nickname: '山口恵美', gender: 2, birthDate: '1986/10/08', address: '埼玉県さいたま市浦和区大東12-12-12', usedAt: '2024/03/25 13:25' },
  { id: 'CU014', couponId: 'CP017', couponName: 'シニア限定優待クーポン', userId: '13', nickname: '松本和也', gender: 1, birthDate: '1990/03/25', address: '埼玉県さいたま市大宮区土手町13-13-13', usedAt: '2024/03/30 18:50' },
  { id: 'CU015', couponId: 'CP018', couponName: 'レディースデー特典クーポン', userId: '14', nickname: '井上千春', gender: 2, birthDate: '1995/08/11', address: '埼玉県さいたま市大宮区桜木町14-14-14', usedAt: '2024/04/01 16:35' },
  { id: 'CU016', couponId: 'CP020', couponName: '雨の日限定クーポン', userId: '15', nickname: '木村拓也', gender: 1, birthDate: '1988/05/02', address: '埼玉県さいたま市浦和区高砂15-15-15', usedAt: '2024/04/05 14:20' },
  { id: 'CU017', couponId: 'CP021', couponName: 'SNS投稿特典クーポン', userId: '16', nickname: '林美穂', gender: 2, birthDate: '1993/12/19', address: '埼玉県さいたま市大宮区高鼻町16-16-16', usedAt: '2024/04/10 17:45' },
  { id: 'CU018', couponId: 'CP023', couponName: 'VIP会員限定クーポン', userId: '17', nickname: '斎藤雄一', gender: 1, birthDate: '1991/07/26', address: '埼玉県さいたま市大宮区北袋町17-17-17', usedAt: '2024/04/15 19:10' },
  { id: 'CU019', couponId: 'CP024', couponName: '早割予約特典クーポン', userId: '18', nickname: '清水香織', gender: 2, birthDate: '1987/02/13', address: '埼玉県さいたま市浦和区岸町18-18-18', usedAt: '2024/04/20 13:55' },
  { id: 'CU020', couponId: 'CP026', couponName: 'テイクアウト限定クーポン', userId: '19', nickname: '森田慎吾', gender: 1, birthDate: '1994/09/04', address: '埼玉県さいたま市浦和区仲町19-19-19', usedAt: '2024/04/25 15:40' },
  { id: 'CU021', couponId: 'CP027', couponName: 'デリバリー限定クーポン', userId: '20', nickname: '池田理恵', gender: 2, birthDate: '1989/04/21', address: '埼玉県さいたま市浦和区大東20-20-20', usedAt: '2024/05/01 18:25' },
  { id: 'CU022', couponId: 'CP029', couponName: '夏季限定冷たいドリンククーポン', userId: '21', nickname: '橋本光男', gender: 1, birthDate: '1992/11/07', address: '埼玉県さいたま市大宮区土手町21-21-21', usedAt: '2024/05/05 16:15' },
  { id: 'CU023', couponId: 'CP030', couponName: '月末感謝祭クーポン', userId: '22', nickname: '石川奈々', gender: 2, birthDate: '1986/06/18', address: '埼玉県さいたま市大宮区桜木町22-22-22', usedAt: '2024/05/10 14:30' },
  { id: 'CU024', couponId: 'CP001', couponName: '新規会員限定10%オフクーポン', userId: '23', nickname: '長谷川隆', gender: 1, birthDate: '1990/01/29', address: '埼玉県さいたま市浦和区高砂23-23-23', usedAt: '2024/05/15 17:50' },
  { id: 'CU025', couponId: 'CP002', couponName: '誕生日特典20%オフクーポン', userId: '24', nickname: '近藤由香', gender: 2, birthDate: '1995/08/15', address: '埼玉県さいたま市大宮区高鼻町24-24-24', usedAt: '2024/05/20 19:35' },
  { id: 'CU026', couponId: 'CP005', couponName: '平日限定ドリンク半額クーポン', userId: '25', nickname: '後藤正樹', gender: 1, birthDate: '1988/03/06', address: '埼玉県さいたま市大宮区北袋町25-25-25', usedAt: '2024/05/25 13:20' },
  { id: 'CU027', couponId: 'CP006', couponName: '学生限定20%オフクーポン', userId: '26', nickname: '藤田真理子', gender: 2, birthDate: '1993/10/22', address: '埼玉県さいたま市浦和区岸町26-26-26', usedAt: '2024/05/30 15:45' },
  { id: 'CU028', couponId: 'CP008', couponName: 'ハッピーアワー限定クーポン', userId: '27', nickname: '岡田浩二', gender: 1, birthDate: '1991/05/09', address: '埼玉県さいたま市浦和区仲町27-27-27', usedAt: '2024/06/01 18:10' },
  { id: 'CU029', couponId: 'CP009', couponName: '友達紹介特典クーポン', userId: '28', nickname: '前田智美', gender: 2, birthDate: '1987/12/16', address: '埼玉県さいたま市浦和区大東28-28-28', usedAt: '2024/06/05 16:55' },
  { id: 'CU030', couponId: 'CP011', couponName: 'グループ利用特典クーポン', userId: '29', nickname: '増田健太', gender: 1, birthDate: '1994/07/03', address: '埼玉県さいたま市大宮区土手町29-29-29', usedAt: '2024/06/10 14:40' },
];

export default function CouponHistory() {
  const pathname = usePathname();
  const router = useRouter();
  const _params = useParams(); // 将来的に使用予定
  
  const [searchForm, setSearchForm] = useState({
    usageId: '',
    couponId: '',
    couponName: '',
    userId: '',
    nickname: '',
    usedDateStart: '',
    usedDateEnd: '',
  });
  const [appliedSearchForm, setAppliedSearchForm] = useState({
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
  const [_isFromCouponDetail, setIsFromCouponDetail] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  useEffect(() => {
    // 遷移元を判定して戻るボタンの表示を制御
    if (pathname.includes('/coupons/') && pathname.includes('/history')) {
      // クーポン詳細からの遷移
      const couponId = pathname.split('/')[2];
      setShowBackButton(true);
      setBackUrl(`/coupons/${couponId}`);
      setPageTitle('クーポン利用履歴');
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
        (appliedSearchForm.usageId === '' || usage.id.toLowerCase().includes(appliedSearchForm.usageId.toLowerCase())) &&
        (appliedSearchForm.couponId === '' || usage.couponId.toLowerCase().includes(appliedSearchForm.couponId.toLowerCase())) &&
        (appliedSearchForm.couponName === '' || usage.couponName.toLowerCase().includes(appliedSearchForm.couponName.toLowerCase())) &&
        (appliedSearchForm.userId === '' || usage.userId.toLowerCase().includes(appliedSearchForm.userId.toLowerCase())) &&
        (appliedSearchForm.nickname === '' || usage.nickname.toLowerCase().includes(appliedSearchForm.nickname.toLowerCase()));

      // 利用日範囲チェック
      let matchesDateRange = true;
      if (appliedSearchForm.usedDateStart || appliedSearchForm.usedDateEnd) {
        const usageDate = new Date(usage.usedAt.split(' ')[0].replace(/\//g, '-'));
        if (appliedSearchForm.usedDateStart) {
          const startDate = new Date(appliedSearchForm.usedDateStart);
          if (usageDate < startDate) matchesDateRange = false;
        }
        if (appliedSearchForm.usedDateEnd) {
          const endDate = new Date(appliedSearchForm.usedDateEnd);
          if (usageDate > endDate) matchesDateRange = false;
        }
      }
      
      return matchesSearch && matchesDateRange;
    });
    
    setFilteredUsages(filtered);
  }, [appliedSearchForm, pathname]);

  const handleInputChange = (field: keyof typeof searchForm, value: string) => {
    setSearchForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    // 検索フォームの内容を適用済み検索フォームにコピーして検索実行
    setAppliedSearchForm({ ...searchForm });
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
    setAppliedSearchForm({
      usageId: '',
      couponId: '',
      couponName: '',
      userId: '',
      nickname: '',
      usedDateStart: '',
      usedDateEnd: '',
    });
  };

  const _handleBack = () => {
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
    <AdminLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-gray-600">
              {pathname.includes('/coupons/') && pathname.includes('/history') 
                ? 'このクーポンの利用履歴を表示します' 
                : pathname.includes('/users/') && pathname.includes('/coupon-history')
                ? 'このユーザーが使用したクーポンの利用履歴を表示します'
                : 'クーポンの利用履歴を管理します'}
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

        {/* 検索フォーム（クーポン詳細からの遷移時は簡略化） */}
        {!(pathname.includes('/coupons/') && pathname.includes('/history')) && !(pathname.includes('/users/') && pathname.includes('/coupon-history')) && (
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
              <Button variant="outline" onClick={handleClear}>
                クリア
              </Button>
              <Button variant="primary" onClick={handleSearch}>
                検索
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
              {pathname.includes('/coupons/') && pathname.includes('/history') 
                ? 'クーポン利用履歴' 
                : pathname.includes('/users/') && pathname.includes('/coupon-history')
                ? 'クーポン利用履歴'
                : 'クーポン利用履歴一覧'} ({filteredUsages.length}件)
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    クーポン利用ID
                  </th>
                  {!(pathname.includes('/coupons/') && pathname.includes('/history')) && !(pathname.includes('/users/') && pathname.includes('/coupon-history')) && (
                    <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    クーポンID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    クーポン名
                  </th>
                    </>
                  )}
                  {(pathname.includes('/coupons/') && pathname.includes('/history')) || (pathname.includes('/users/') && pathname.includes('/coupon-history')) ? (
                    <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    クーポンID
                  </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      クーポン名
                    </th>
                    </>
                  ) : null}
                  {!(pathname.includes('/users/') && pathname.includes('/coupon-history')) && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ユーザーID
                    </th>
                  )}
                  {!(pathname.includes('/users/') && pathname.includes('/coupon-history')) && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ニックネーム
                    </th>
                  )}
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
                    {!(pathname.includes('/coupons/') && pathname.includes('/history')) && !(pathname.includes('/users/') && pathname.includes('/coupon-history')) && (
                      <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{usage.couponId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{usage.couponName}</div>
                    </td>
                      </>
                    )}
                    {(pathname.includes('/coupons/') && pathname.includes('/history')) || (pathname.includes('/users/') && pathname.includes('/coupon-history')) ? (
                      <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{usage.couponId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{usage.couponName}</div>
                      </td>
                      </>
                    ) : null}
                    {!(pathname.includes('/users/') && pathname.includes('/coupon-history')) && (
                      <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        href={`/users/${usage.userId}`}
                        className="text-sm text-green-600 hover:text-green-800 underline"
                      >
                        {usage.userId}
                      </Link>
                      </td>
                    )}
                    {!(pathname.includes('/users/') && pathname.includes('/coupon-history')) && (
                      <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{usage.nickname}</div>
                      </td>
                    )}
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

        {/* 戻るボタン（画面下部） */}
        {showBackButton && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="lg"
              onClick={_handleBack}
              className="px-8"
            >
              戻る
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}