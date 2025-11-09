'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminLayout from '@/components/templates/admin-layout';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import { useAuth } from '@/components/contexts/auth-context';
import ToastContainer from '@/components/molecules/toast-container';
import { convertUsersToCSV, downloadCSV, generateFilename, type UserForCSV } from '@/utils/csvExport';
import { useToast } from '@/hooks/use-toast';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

interface User {
  id: string;
  nickname: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
  birthDate: string;
  gender: number;
  saitamaAppId: string;
  rank: number;
  registeredStore: string;
  registeredAt: string;
}

const prefectures = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

export default function UsersPage() {
  const auth = useAuth();
  const lastFetchKeyRef = useRef<string | null>(null);
  
  // operatorロールかどうかを判定
  const isOperatorRole = auth?.user?.accountType === 'admin' && auth?.user?.role === 'operator';
  
  const [searchForm, setSearchForm] = useState({
    nickname: '',
    postalCode: '',
    prefecture: '',
    city: '',
    address: '',
    birthDate: '',
    gender: '',
    saitamaAppId: '',
    ranks: [] as number[],
    registeredDateStart: '',
    registeredDateEnd: '',
  });
  const [appliedSearchForm, setAppliedSearchForm] = useState({
    nickname: '',
    postalCode: '',
    prefecture: '',
    city: '',
    address: '',
    birthDate: '',
    gender: '',
    saitamaAppId: '',
    ranks: [] as number[],
    registeredDateStart: '',
    registeredDateEnd: '',
  });
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadingCSV, setIsDownloadingCSV] = useState(false);
  const { toasts, removeToast, showSuccess, showError } = useToast();

  // データ取得
  const fetchUsers = useCallback(async (searchParams?: typeof appliedSearchForm) => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      
      // 検索条件をクエリパラメータに追加
      if (searchParams?.nickname) queryParams.append('nickname', searchParams.nickname);
      
      // operatorロールでない場合のみ機密情報での検索パラメータを追加
      if (!isOperatorRole) {
        if (searchParams?.postalCode) queryParams.append('postalCode', searchParams.postalCode);
        if (searchParams?.prefecture) queryParams.append('prefecture', searchParams.prefecture);
        if (searchParams?.city) queryParams.append('city', searchParams.city);
        if (searchParams?.address) queryParams.append('address', searchParams.address);
        if (searchParams?.birthDate) queryParams.append('birthDate', searchParams.birthDate);
        if (searchParams?.gender) queryParams.append('gender', searchParams.gender);
        if (searchParams?.saitamaAppId) queryParams.append('saitamaAppId', searchParams.saitamaAppId);
      }
      
      if (searchParams?.ranks && searchParams.ranks.length > 0) {
        queryParams.append('ranks', JSON.stringify(searchParams.ranks));
      }
      if (searchParams?.registeredDateStart) queryParams.append('registeredDateStart', searchParams.registeredDateStart);
      if (searchParams?.registeredDateEnd) queryParams.append('registeredDateEnd', searchParams.registeredDateEnd);

      const response = await fetch(`/api/admin/users?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('ユーザー一覧の取得に失敗しました');
      }
      
      const data = await response.json();
      
      // APIレスポンスをフォーマット
      const responseData = data as { users: Array<{
        id: string;
        nickname: string;
        postalCode?: string;
        prefecture?: string;
        city?: string;
        address?: string;
        birthDate?: string;
        gender?: string | number;
        saitamaAppId?: string;
        rank: number;
        registeredStore?: string;
        registeredAt: string;
      }> };
      
      // operatorロールの場合は機密情報を含めない
      const formattedUsers: User[] = responseData.users.map((user) => {
        const base: User = {
          id: user.id,
          nickname: user.nickname,
          postalCode: '',
          prefecture: '',
          city: '',
          address: '',
          birthDate: '',
          gender: 0,
          saitamaAppId: '',
          rank: user.rank,
          registeredStore: '',
          registeredAt: user.registeredAt ? user.registeredAt.replace(/-/g, '/') : '',
        };

        // operatorロールでない場合のみ機密情報を設定
        if (!isOperatorRole) {
          return {
            ...base,
            postalCode: user.postalCode ?? '',
            prefecture: user.prefecture ?? '',
            city: user.city ?? '',
            address: user.address ?? '',
            birthDate: user.birthDate ? user.birthDate.replace(/-/g, '/') : '',
            gender: typeof user.gender === 'string' ? (user.gender === 'male' ? 1 : user.gender === 'female' ? 2 : 3) : (user.gender || 0),
            saitamaAppId: user.saitamaAppId ?? '',
            registeredStore: user.registeredStore ?? '',
          };
        }

        // operatorロールの場合は機密情報を含めない
        return base;
      });
      
      setUsers(formattedUsers);
    } catch (err) {
      console.error('ユーザー一覧の取得に失敗しました:', err);
      setError('ユーザー一覧の取得に失敗しました');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [isOperatorRole]);

  // データ取得（初回読み込み・検索）
  useEffect(() => {
     // authの初期化を待つ
     if (auth?.isLoading) {
       return;
     }
     
     // 認証情報が取得できていない場合はスキップ
     if (!auth?.user) {
       return;
     }
     
    const key = JSON.stringify({
      user: auth?.user?.id ?? auth?.user?.email ?? 'anonymous',
      search: appliedSearchForm,
      isOperatorRole,
    });

    if (lastFetchKeyRef.current === key) {
      return;
    }

    lastFetchKeyRef.current = key;

    fetchUsers(appliedSearchForm);
  }, [auth?.isLoading, auth?.user, appliedSearchForm, fetchUsers, isOperatorRole]);

  // フィルタリング処理（クライアント側の追加フィルタリング）
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      (appliedSearchForm.nickname === '' || user.nickname.includes(appliedSearchForm.nickname)) &&
      (appliedSearchForm.postalCode === '' || user.postalCode === appliedSearchForm.postalCode) &&
      (appliedSearchForm.prefecture === '' || user.prefecture === appliedSearchForm.prefecture) &&
      (appliedSearchForm.city === '' || user.city.includes(appliedSearchForm.city)) &&
      (appliedSearchForm.address === '' || user.address.includes(appliedSearchForm.address)) &&
      (appliedSearchForm.birthDate === '' || user.birthDate === appliedSearchForm.birthDate) &&
      (appliedSearchForm.gender === '' || user.gender.toString() === appliedSearchForm.gender) &&
      (appliedSearchForm.saitamaAppId === '' || user.saitamaAppId.includes(appliedSearchForm.saitamaAppId)) &&
      (appliedSearchForm.ranks.length === 0 || appliedSearchForm.ranks.includes(user.rank));

    // 登録日範囲チェック
    let matchesDateRange = true;
    if (appliedSearchForm.registeredDateStart || appliedSearchForm.registeredDateEnd) {
      const userDate = new Date(user.registeredAt.replace(/\//g, '-'));
      if (appliedSearchForm.registeredDateStart) {
        const startDate = new Date(appliedSearchForm.registeredDateStart);
        if (userDate < startDate) matchesDateRange = false;
      }
      if (appliedSearchForm.registeredDateEnd) {
        const endDate = new Date(appliedSearchForm.registeredDateEnd);
        if (userDate > endDate) matchesDateRange = false;
      }
    }
    
    return matchesSearch && matchesDateRange;
  });

  const handleInputChange = (field: keyof typeof searchForm, value: string) => {
    setSearchForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRankChange = (rank: number, checked: boolean) => {
    setSearchForm(prev => ({
      ...prev,
      ranks: checked 
        ? [...prev.ranks, rank]
        : prev.ranks.filter(r => r !== rank)
    }));
  };

  const handleSearch = () => {
    // 検索フォームの内容を適用済み検索フォームにコピーして検索実行
    setAppliedSearchForm({ ...searchForm });
  };

  const handleClear = () => {
    setSearchForm({
      nickname: '',
      postalCode: '',
      prefecture: '',
      city: '',
      address: '',
      birthDate: '',
      gender: '',
      saitamaAppId: '',
      ranks: [],
      registeredDateStart: '',
      registeredDateEnd: '',
    });
    setAppliedSearchForm({
      nickname: '',
      postalCode: '',
      prefecture: '',
      city: '',
      address: '',
      birthDate: '',
      gender: '',
      saitamaAppId: '',
      ranks: [],
      registeredDateStart: '',
      registeredDateEnd: '',
    });
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

  const getRankLabel = (rank: number) => {
    switch (rank) {
      case 1:
        return 'ブロンズ';
      case 2:
        return 'シルバー';
      case 3:
        return 'ゴールド';
      case 4:
        return 'ダイヤモンド';
      default:
        return 'ブロンズ';
    }
  };

  const _getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-orange-100 text-orange-800';
      case 2:
        return 'bg-gray-100 text-gray-800';
      case 3:
        return 'bg-yellow-100 text-yellow-800';
      case 4:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  // 全データ取得関数（ページネーション対応、検索条件適用）
  const fetchAllUsers = async (): Promise<User[]> => {
    const allUsers: User[] = [];
    let page = 1;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      try {
        const queryParams = new URLSearchParams();
        
        if (appliedSearchForm.nickname) queryParams.append('nickname', appliedSearchForm.nickname);
        
        if (!isOperatorRole) {
          if (appliedSearchForm.postalCode) queryParams.append('postalCode', appliedSearchForm.postalCode);
          if (appliedSearchForm.prefecture) queryParams.append('prefecture', appliedSearchForm.prefecture);
          if (appliedSearchForm.city) queryParams.append('city', appliedSearchForm.city);
          if (appliedSearchForm.address) queryParams.append('address', appliedSearchForm.address);
          if (appliedSearchForm.birthDate) queryParams.append('birthDate', appliedSearchForm.birthDate);
          if (appliedSearchForm.gender) queryParams.append('gender', appliedSearchForm.gender);
          if (appliedSearchForm.saitamaAppId) queryParams.append('saitamaAppId', appliedSearchForm.saitamaAppId);
        }
        
        if (appliedSearchForm.ranks && appliedSearchForm.ranks.length > 0) {
          queryParams.append('ranks', JSON.stringify(appliedSearchForm.ranks));
        }
        if (appliedSearchForm.registeredDateStart) queryParams.append('registeredDateStart', appliedSearchForm.registeredDateStart);
        if (appliedSearchForm.registeredDateEnd) queryParams.append('registeredDateEnd', appliedSearchForm.registeredDateEnd);
        
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());

        const response = await fetch(`/api/admin/users?${queryParams.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('ユーザー一覧の取得に失敗しました');
        }
        
        const data = await response.json();
        
        let usersArray: User[] = [];
        let pagination: { totalPages?: number; total?: number } = {};
        
        if (Array.isArray(data)) {
          usersArray = data;
          hasMore = false;
        } else if (data && typeof data === 'object') {
          if ('users' in data) {
            usersArray = data.users || [];
            pagination = data.pagination || {};
          }
        }

        allUsers.push(...usersArray);

        const totalPages = pagination.totalPages || 1;
        hasMore = page < totalPages;
        page++;

        if (usersArray.length === 0) {
          hasMore = false;
        }
      } catch (error) {
        console.error('全データ取得中にエラーが発生しました:', error);
        throw error;
      }
    }

    // フロントエンドのフィルタリングを適用
    return allUsers.filter((user) => {
      const matchesSearch = 
        (appliedSearchForm.nickname === '' || user.nickname.toLowerCase().includes(appliedSearchForm.nickname.toLowerCase())) &&
        (!isOperatorRole || true) &&
        (isOperatorRole || (
          (appliedSearchForm.postalCode === '' || user.postalCode.includes(appliedSearchForm.postalCode)) &&
          (appliedSearchForm.prefecture === '' || user.prefecture.toLowerCase().includes(appliedSearchForm.prefecture.toLowerCase())) &&
          (appliedSearchForm.city === '' || user.city.toLowerCase().includes(appliedSearchForm.city.toLowerCase())) &&
          (appliedSearchForm.address === '' || user.address.toLowerCase().includes(appliedSearchForm.address.toLowerCase())) &&
          (appliedSearchForm.birthDate === '' || user.birthDate === appliedSearchForm.birthDate) &&
          (appliedSearchForm.gender === '' || user.gender.toString() === appliedSearchForm.gender) &&
          (appliedSearchForm.saitamaAppId === '' || user.saitamaAppId.includes(appliedSearchForm.saitamaAppId))
        )) &&
        (appliedSearchForm.ranks.length === 0 || appliedSearchForm.ranks.includes(user.rank));
      
      let matchesDateRange = true;
      if (appliedSearchForm.registeredDateStart || appliedSearchForm.registeredDateEnd) {
        const userDate = new Date(user.registeredAt);
        if (appliedSearchForm.registeredDateStart) {
          const startDate = new Date(appliedSearchForm.registeredDateStart);
          if (userDate < startDate) matchesDateRange = false;
        }
        if (appliedSearchForm.registeredDateEnd) {
          const endDate = new Date(appliedSearchForm.registeredDateEnd);
          if (userDate > endDate) matchesDateRange = false;
        }
      }
      
      return matchesSearch && matchesDateRange;
    });
  };

  // 全データをCSVダウンロード
  const handleDownloadAllCSV = async () => {
    try {
      setIsDownloadingCSV(true);
      
      const allUsers = await fetchAllUsers();
      
      const usersForCSV: UserForCSV[] = allUsers.map((user) => ({
        nickname: user.nickname,
        postalCode: user.postalCode,
        prefecture: user.prefecture,
        city: user.city,
        address: user.address,
        birthDate: user.birthDate,
        gender: user.gender,
        saitamaAppId: user.saitamaAppId,
        rank: user.rank,
        registeredAt: user.registeredAt,
      }));

      const csvContent = convertUsersToCSV(usersForCSV, isOperatorRole);
      const filename = generateFilename('users');
      downloadCSV(csvContent, filename);
      
      showSuccess(`${allUsers.length}件のユーザーデータをCSVでダウンロードしました`);
    } catch (error: unknown) {
      console.error('CSVダウンロードに失敗しました:', error);
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      showError(`CSVダウンロードに失敗しました: ${errorMessage}`);
    } finally {
      setIsDownloadingCSV(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">ユーザー管理</h1>
            <p className="text-gray-600">
              ユーザーの管理・編集を行います
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

        {/* 検索フォーム */}
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

            {/* 郵便番号 */}
            {!isOperatorRole && (
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                  郵便番号
                </label>
                <input
                  type="text"
                  id="postalCode"
                  placeholder="郵便番号を入力"
                  value={searchForm.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            )}

            {/* 都道府県 */}
            {!isOperatorRole && (
              <div>
                <label htmlFor="prefecture" className="block text-sm font-medium text-gray-700 mb-2">
                  都道府県
                </label>
                <select
                  id="prefecture"
                  value={searchForm.prefecture}
                  onChange={(e) => handleInputChange('prefecture', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">都道府県を選択してください</option>
                  {prefectures.map((pref) => (
                    <option key={pref} value={pref}>{pref}</option>
                  ))}
                </select>
              </div>
            )}

            {/* 市区町村 */}
            {!isOperatorRole && (
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  市区町村
                </label>
                <input
                  type="text"
                  id="city"
                  placeholder="市区町村を入力"
                  value={searchForm.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            )}

            {/* 住所 */}
            {!isOperatorRole && (
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  住所
                </label>
                <input
                  type="text"
                  id="address"
                  placeholder="住所を入力"
                  value={searchForm.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            )}

            {/* 生年月日 */}
            {!isOperatorRole && (
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
                  生年月日
                </label>
                <input
                  type="date"
                  id="birthDate"
                  value={searchForm.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            )}

            {/* 登録日範囲指定 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                登録日（範囲指定）
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="registeredDateStart" className="block text-xs text-gray-500 mb-1">
                    開始日
                  </label>
                  <input
                    type="date"
                    id="registeredDateStart"
                    value={searchForm.registeredDateStart}
                    onChange={(e) => handleInputChange('registeredDateStart', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="registeredDateEnd" className="block text-xs text-gray-500 mb-1">
                    終了日
                  </label>
                  <input
                    type="date"
                    id="registeredDateEnd"
                    value={searchForm.registeredDateEnd}
                    onChange={(e) => handleInputChange('registeredDateEnd', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>
            </div>

            {/* ランクと性別を横並びに配置 */}
            <div className="md:col-span-2 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ランク（複数選択可） */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ランク（複数選択可）
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={searchForm.ranks.includes(1)}
                        onChange={(e) => handleRankChange(1, e.target.checked)}
                        className="mr-2 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">ブロンズ</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={searchForm.ranks.includes(2)}
                        onChange={(e) => handleRankChange(2, e.target.checked)}
                        className="mr-2 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">シルバー</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={searchForm.ranks.includes(3)}
                        onChange={(e) => handleRankChange(3, e.target.checked)}
                        className="mr-2 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">ゴールド</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={searchForm.ranks.includes(4)}
                        onChange={(e) => handleRankChange(4, e.target.checked)}
                        className="mr-2 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">ダイヤモンド</span>
                    </label>
                  </div>
                </div>

                {/* 性別 */}
                {!isOperatorRole && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      性別
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value=""
                          checked={searchForm.gender === ''}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="mr-2 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">すべて</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="1"
                          checked={searchForm.gender === '1'}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="mr-2 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">男性</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="2"
                          checked={searchForm.gender === '2'}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="mr-2 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">女性</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="3"
                          checked={searchForm.gender === '3'}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="mr-2 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">未回答</span>
                      </label>
                    </div>
                  </div>
                )}
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

        {/* ユーザー一覧 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              ユーザー一覧 ({filteredUsers.length}件)
            </h3>
            <Button
              variant="outline"
              onClick={handleDownloadAllCSV}
              disabled={isDownloadingCSV || filteredUsers.length === 0}
              className="bg-white text-blue-600 border-blue-600 hover:bg-blue-50 cursor-pointer"
            >
              {isDownloadingCSV ? 'ダウンロード中...' : 'CSVダウンロード'}
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '140px', minWidth: '140px' }}>
                    アクション
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ニックネーム
                  </th>
                  {!isOperatorRole && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      郵便番号
                    </th>
                  )}
                  {!isOperatorRole && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      住所
                    </th>
                  )}
                  {!isOperatorRole && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      生年月日
                    </th>
                  )}
                  {!isOperatorRole && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      性別
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ランク
                  </th>
                  {!isOperatorRole && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      登録店舗
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    登録日
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap" style={{ width: '140px', minWidth: '140px' }}>
                      <div className="flex justify-center gap-2 items-center">
                        <Link href={`/users/${user.id}`}>
                          <button 
                            className="p-1.5 text-blue-600 hover:text-blue-800 rounded-lg transition-colors cursor-pointer flex items-center justify-center min-w-[44px] min-h-[44px] flex-shrink-0"
                            title="詳細"
                            style={{ width: 'auto', height: 'auto' }}
                          >
                            <Image 
                              src="/info.png" 
                              alt="詳細" 
                              width={32}
                              height={32}
                              className="object-contain"
                              style={{ width: '32px', height: '32px', aspectRatio: '1/1', flexShrink: 0, display: 'block' }}
                              unoptimized
                            />
                          </button>
                        </Link>
                        {!isOperatorRole && (
                          <Link href={`/users/${user.id}/edit`}>
                            <button 
                              className="p-1.5 text-green-600 hover:text-green-800 rounded-lg transition-colors cursor-pointer flex items-center justify-center min-w-[44px] min-h-[44px] flex-shrink-0"
                              title="編集"
                              style={{ width: 'auto', height: 'auto' }}
                            >
                              <Image 
                                src="/edit.svg" 
                                alt="編集" 
                                width={24}
                                height={24}
                                className="object-contain"
                                style={{ width: '24px', height: '24px', flexShrink: 0, display: 'block' }}
                                unoptimized
                              />
                            </button>
                          </Link>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.nickname}</div>
                    </td>
                    {!isOperatorRole && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.postalCode}</div>
                      </td>
                    )}
                    {!isOperatorRole && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.prefecture}{user.city}{user.address}
                        </div>
                      </td>
                    )}
                    {!isOperatorRole && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.birthDate}</div>
                      </td>
                    )}
                    {!isOperatorRole && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getGenderLabel(user.gender)}</div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getRankLabel(user.rank)}</div>
                    </td>
                    {!isOperatorRole && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.registeredStore}</div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.registeredAt}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-500">データを読み込み中...</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="text-center py-12">
              <Icon name="users" size="lg" className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">エラーが発生しました</h3>
              <p className="text-gray-500">{error}</p>
            </div>
          )}

          {!isLoading && !error && filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Icon name="users" size="lg" className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">ユーザーが見つかりません</h3>
              <p className="text-gray-500">検索条件を変更してお試しください。</p>
            </div>
          )}
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </AdminLayout>
  );
}
