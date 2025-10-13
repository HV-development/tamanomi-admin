'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/templates/dashboard-layout';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';

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

// サンプルデータ
const sampleUsers: User[] = [
  { id: '1', nickname: '田中太郎', postalCode: '330-0001', prefecture: '埼玉県', city: 'さいたま市浦和区', address: '高砂1-1-1', birthDate: '1990/05/15', gender: 1, saitamaAppId: 'SA001234', rank: 3, registeredStore: 'たまのみ 浦和店', registeredAt: '2024/01/15' },
  { id: '2', nickname: '佐藤花子', postalCode: '330-0062', prefecture: '埼玉県', city: 'さいたま市浦和区', address: '仲町2-2-2', birthDate: '1985/08/22', gender: 2, saitamaAppId: 'SA005678', rank: 4, registeredStore: 'たまのみ 浦和店', registeredAt: '2024/01/20' },
  { id: '3', nickname: '鈴木次郎', postalCode: '330-0043', prefecture: '埼玉県', city: 'さいたま市浦和区', address: '大東3-3-3', birthDate: '1995/12/03', gender: 1, saitamaAppId: 'SA009012', rank: 2, registeredStore: 'たまのみ 大宮店', registeredAt: '2024/02/01' },
  { id: '4', nickname: '山田美咲', postalCode: '330-0064', prefecture: '埼玉県', city: 'さいたま市浦和区', address: '岸町4-4-4', birthDate: '1992/03/18', gender: 2, saitamaAppId: 'SA003456', rank: 1, registeredStore: 'たまのみ 浦和店', registeredAt: '2024/02/10' },
  { id: '5', nickname: '高橋健一', postalCode: '330-0845', prefecture: '埼玉県', city: 'さいたま市大宮区', address: '仲町5-5-5', birthDate: '1988/07/12', gender: 1, saitamaAppId: 'SA012345', rank: 2, registeredStore: 'たまのみ 大宮店', registeredAt: '2024/02/15' },
  { id: '6', nickname: '伊藤美由紀', postalCode: '330-0801', prefecture: '埼玉県', city: 'さいたま市大宮区', address: '土手町6-6-6', birthDate: '1993/11/28', gender: 2, saitamaAppId: 'SA067890', rank: 3, registeredStore: 'たまのみ 大宮店', registeredAt: '2024/02/20' },
  { id: '7', nickname: '渡辺誠', postalCode: '330-0854', prefecture: '埼玉県', city: 'さいたま市大宮区', address: '桜木町7-7-7', birthDate: '1991/04/05', gender: 1, saitamaAppId: 'SA123456', rank: 1, registeredStore: 'たまのみ 大宮店', registeredAt: '2024/02/25' },
  { id: '8', nickname: '中村麻衣', postalCode: '330-0803', prefecture: '埼玉県', city: 'さいたま市大宮区', address: '高鼻町8-8-8', birthDate: '1987/09/14', gender: 2, saitamaAppId: 'SA234567', rank: 4, registeredStore: 'たまのみ 浦和店', registeredAt: '2024/03/01' },
  { id: '9', nickname: '小林大輔', postalCode: '330-0835', prefecture: '埼玉県', city: 'さいたま市大宮区', address: '北袋町9-9-9', birthDate: '1994/12/21', gender: 1, saitamaAppId: 'SA345678', rank: 2, registeredStore: 'たまのみ 大宮店', registeredAt: '2024/03/05' },
  { id: '10', nickname: '加藤優子', postalCode: '330-0064', prefecture: '埼玉県', city: 'さいたま市浦和区', address: '岸町10-10-10', birthDate: '1989/06/30', gender: 2, saitamaAppId: 'SA456789', rank: 3, registeredStore: 'たまのみ 浦和店', registeredAt: '2024/03/10' },
  { id: '11', nickname: '吉田修平', postalCode: '330-0062', prefecture: '埼玉県', city: 'さいたま市浦和区', address: '仲町11-11-11', birthDate: '1992/01/17', gender: 1, saitamaAppId: 'SA567890', rank: 1, registeredStore: 'たまのみ 浦和店', registeredAt: '2024/03/15' },
  { id: '12', nickname: '山口恵美', postalCode: '330-0043', prefecture: '埼玉県', city: 'さいたま市浦和区', address: '大東12-12-12', birthDate: '1986/10/08', gender: 2, saitamaAppId: 'SA678901', rank: 4, registeredStore: 'たまのみ 浦和店', registeredAt: '2024/03/20' },
  { id: '13', nickname: '松本和也', postalCode: '330-0801', prefecture: '埼玉県', city: 'さいたま市大宮区', address: '土手町13-13-13', birthDate: '1990/03/25', gender: 1, saitamaAppId: 'SA789012', rank: 2, registeredStore: 'たまのみ 大宮店', registeredAt: '2024/03/25' },
  { id: '14', nickname: '井上千春', postalCode: '330-0854', prefecture: '埼玉県', city: 'さいたま市大宮区', address: '桜木町14-14-14', birthDate: '1995/08/11', gender: 2, saitamaAppId: 'SA890123', rank: 3, registeredStore: 'たまのみ 大宮店', registeredAt: '2024/03/30' },
  { id: '15', nickname: '木村拓也', postalCode: '330-0001', prefecture: '埼玉県', city: 'さいたま市浦和区', address: '高砂15-15-15', birthDate: '1988/05/02', gender: 1, saitamaAppId: 'SA901234', rank: 1, registeredStore: 'たまのみ 浦和店', registeredAt: '2024/04/01' },
  { id: '16', nickname: '林美穂', postalCode: '330-0803', prefecture: '埼玉県', city: 'さいたま市大宮区', address: '高鼻町16-16-16', birthDate: '1993/12/19', gender: 2, saitamaAppId: 'SA012346', rank: 4, registeredStore: 'たまのみ 大宮店', registeredAt: '2024/04/05' },
  { id: '17', nickname: '斎藤雄一', postalCode: '330-0835', prefecture: '埼玉県', city: 'さいたま市大宮区', address: '北袋町17-17-17', birthDate: '1991/07/26', gender: 1, saitamaAppId: 'SA123457', rank: 2, registeredStore: 'たまのみ 大宮店', registeredAt: '2024/04/10' },
  { id: '18', nickname: '清水香織', postalCode: '330-0064', prefecture: '埼玉県', city: 'さいたま市浦和区', address: '岸町18-18-18', birthDate: '1987/02/13', gender: 2, saitamaAppId: 'SA234568', rank: 3, registeredStore: 'たまのみ 浦和店', registeredAt: '2024/04/15' },
  { id: '19', nickname: '森田慎吾', postalCode: '330-0062', prefecture: '埼玉県', city: 'さいたま市浦和区', address: '仲町19-19-19', birthDate: '1994/09/04', gender: 1, saitamaAppId: 'SA345679', rank: 1, registeredStore: 'たまのみ 浦和店', registeredAt: '2024/04/20' },
  { id: '20', nickname: '池田理恵', postalCode: '330-0043', prefecture: '埼玉県', city: 'さいたま市浦和区', address: '大東20-20-20', birthDate: '1989/04/21', gender: 2, saitamaAppId: 'SA456780', rank: 4, registeredStore: 'たまのみ 浦和店', registeredAt: '2024/04/25' },
  { id: '21', nickname: '橋本光男', postalCode: '330-0801', prefecture: '埼玉県', city: 'さいたま市大宮区', address: '土手町21-21-21', birthDate: '1992/11/07', gender: 1, saitamaAppId: 'SA567891', rank: 2, registeredStore: 'たまのみ 大宮店', registeredAt: '2024/05/01' },
  { id: '22', nickname: '石川奈々', postalCode: '330-0854', prefecture: '埼玉県', city: 'さいたま市大宮区', address: '桜木町22-22-22', birthDate: '1986/06/18', gender: 2, saitamaAppId: 'SA678902', rank: 3, registeredStore: 'たまのみ 大宮店', registeredAt: '2024/05/05' },
  { id: '23', nickname: '長谷川隆', postalCode: '330-0001', prefecture: '埼玉県', city: 'さいたま市浦和区', address: '高砂23-23-23', birthDate: '1990/01/29', gender: 1, saitamaAppId: 'SA789013', rank: 1, registeredStore: 'たまのみ 浦和店', registeredAt: '2024/05/10' },
  { id: '24', nickname: '近藤由香', postalCode: '330-0803', prefecture: '埼玉県', city: 'さいたま市大宮区', address: '高鼻町24-24-24', birthDate: '1995/08/15', gender: 2, saitamaAppId: 'SA890124', rank: 4, registeredStore: 'たまのみ 大宮店', registeredAt: '2024/05/15' },
  { id: '25', nickname: '後藤正樹', postalCode: '330-0835', prefecture: '埼玉県', city: 'さいたま市大宮区', address: '北袋町25-25-25', birthDate: '1988/03/06', gender: 1, saitamaAppId: 'SA901235', rank: 2, registeredStore: 'たまのみ 大宮店', registeredAt: '2024/05/20' },
  { id: '26', nickname: '藤田真理子', postalCode: '330-0064', prefecture: '埼玉県', city: 'さいたま市浦和区', address: '岸町26-26-26', birthDate: '1993/10/22', gender: 2, saitamaAppId: 'SA012347', rank: 3, registeredStore: 'たまのみ 浦和店', registeredAt: '2024/05/25' },
  { id: '27', nickname: '岡田浩二', postalCode: '330-0062', prefecture: '埼玉県', city: 'さいたま市浦和区', address: '仲町27-27-27', birthDate: '1991/05/09', gender: 1, saitamaAppId: 'SA123458', rank: 1, registeredStore: 'たまのみ 浦和店', registeredAt: '2024/05/30' },
  { id: '28', nickname: '前田智美', postalCode: '330-0043', prefecture: '埼玉県', city: 'さいたま市浦和区', address: '大東28-28-28', birthDate: '1987/12/16', gender: 2, saitamaAppId: 'SA234569', rank: 4, registeredStore: 'たまのみ 浦和店', registeredAt: '2024/06/01' },
  { id: '29', nickname: '増田健太', postalCode: '330-0801', prefecture: '埼玉県', city: 'さいたま市大宮区', address: '土手町29-29-29', birthDate: '1994/07/03', gender: 1, saitamaAppId: 'SA345680', rank: 2, registeredStore: 'たまのみ 大宮店', registeredAt: '2024/06/05' },
  { id: '30', nickname: '金子亜希子', postalCode: '330-0854', prefecture: '埼玉県', city: 'さいたま市大宮区', address: '桜木町30-30-30', birthDate: '1989/02/20', gender: 2, saitamaAppId: 'SA456781', rank: 3, registeredStore: 'たまのみ 大宮店', registeredAt: '2024/06/10' },
];

const prefectures = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

export default function UserManagement() {
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

  // フィルタリング処理
  const filteredUsers = sampleUsers.filter((user) => {
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
    console.log('検索実行:', searchForm);
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

  return (
    <DashboardLayout>
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

            {/* 都道府県 */}
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

            {/* 市区町村 */}
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

            {/* 住所 */}
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

            {/* 生年月日 */}
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
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              ユーザー一覧 ({filteredUsers.length}件)
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ニックネーム
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    郵便番号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    住所
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    生年月日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    性別
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ランク
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    登録店舗
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    登録日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.nickname}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.postalCode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.prefecture}{user.city}{user.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.birthDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getGenderLabel(user.gender)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getRankLabel(user.rank)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.registeredStore}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.registeredAt}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link href={`/users/${user.id}`}>
                        <Button variant="outline" size="sm">
                          詳細
                        </Button>
                      </Link>
                      <Link href={`/users/${user.id}/edit`}>
                        <Button variant="outline" size="sm" className="text-green-600 border-green-300 hover:bg-green-50">
                          編集
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Icon name="users" size="lg" className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">ユーザーが見つかりません</h3>
              <p className="text-gray-500">検索条件を変更してお試しください。</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}