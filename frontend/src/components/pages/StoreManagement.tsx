'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/templates/dashboard-layout';
import Button from '@/components/atoms/button';
import Icon from '@/components/atoms/icon';

interface Store {
  id: string;
  name: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
  building: string;
  homepage: string;
  phone: string;
  genre: string;
  status: 'active' | 'inactive';
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

const genres = [
  '居酒屋', 'レストラン', 'カフェ', 'ファストフード', 'ラーメン店',
  '焼肉店', '寿司店', 'イタリアン', 'フレンチ', '中華料理',
  'その他'
];

// サンプルデータ
const sampleStores: Store[] = [
  { id: '1', name: 'たまのみ 渋谷店', postalCode: '150-0002', prefecture: '東京都', city: '渋谷区', address: '渋谷1-1-1', building: 'たまのみビル1F', homepage: 'https://tamanomi-shibuya.com', phone: '03-1234-5678', genre: '居酒屋', status: 'active', registeredAt: '2024-01-15' },
  { id: '2', name: 'たまのみ 新宿店', postalCode: '160-0022', prefecture: '東京都', city: '新宿区', address: '新宿2-2-2', building: '新宿センタービル2F', homepage: 'https://tamanomi-shinjuku.com', phone: '03-2345-6789', genre: 'カフェ', status: 'active', registeredAt: '2024-01-20' },
  { id: '3', name: 'たまのみ 池袋店', postalCode: '171-0022', prefecture: '東京都', city: '豊島区', address: '池袋3-3-3', building: '', homepage: 'https://tamanomi-ikebukuro.com', phone: '03-3456-7890', genre: 'レストラン', status: 'inactive', registeredAt: '2024-02-01' },
  { id: '4', name: 'たまのみ 品川店', postalCode: '108-0075', prefecture: '東京都', city: '港区', address: '港南2-4-4', building: '品川タワー1F', homepage: 'https://tamanomi-shinagawa.com', phone: '03-4567-8901', genre: '居酒屋', status: 'active', registeredAt: '2024-02-05' },
  { id: '5', name: 'たまのみ 上野店', postalCode: '110-0005', prefecture: '東京都', city: '台東区', address: '上野5-5-5', building: '上野プラザ2F', homepage: 'https://tamanomi-ueno.com', phone: '03-5678-9012', genre: 'レストラン', status: 'active', registeredAt: '2024-02-10' },
  { id: '6', name: 'たまのみ 秋葉原店', postalCode: '101-0021', prefecture: '東京都', city: '千代田区', address: '外神田6-6-6', building: '', homepage: 'https://tamanomi-akihabara.com', phone: '03-6789-0123', genre: 'カフェ', status: 'inactive', registeredAt: '2024-02-15' },
  { id: '7', name: 'たまのみ 銀座店', postalCode: '104-0061', prefecture: '東京都', city: '中央区', address: '銀座7-7-7', building: '銀座ビル3F', homepage: 'https://tamanomi-ginza.com', phone: '03-7890-1234', genre: 'フレンチ', status: 'active', registeredAt: '2024-02-20' },
  { id: '8', name: 'たまのみ 六本木店', postalCode: '106-0032', prefecture: '東京都', city: '港区', address: '六本木8-8-8', building: '', homepage: 'https://tamanomi-roppongi.com', phone: '03-8901-2345', genre: 'イタリアン', status: 'active', registeredAt: '2024-02-25' },
  { id: '9', name: 'たまのみ 恵比寿店', postalCode: '150-0013', prefecture: '東京都', city: '渋谷区', address: '恵比寿9-9-9', building: '', homepage: 'https://tamanomi-ebisu.com', phone: '03-9012-3456', genre: '焼肉店', status: 'active', registeredAt: '2024-03-01' },
  { id: '10', name: 'たまのみ 中目黒店', postalCode: '153-0061', prefecture: '東京都', city: '目黒区', address: '中目黒10-10-10', building: '', homepage: 'https://tamanomi-nakameguro.com', phone: '03-0123-4567', genre: 'カフェ', status: 'inactive', registeredAt: '2024-03-05' },
  { id: '11', name: 'たまのみ 自由が丘店', postalCode: '152-0035', prefecture: '東京都', city: '目黒区', address: '自由が丘11-11-11', building: '', homepage: 'https://tamanomi-jiyugaoka.com', phone: '03-1234-5679', genre: 'レストラン', status: 'active', registeredAt: '2024-03-10' },
  { id: '12', name: 'たまのみ 吉祥寺店', postalCode: '180-0004', prefecture: '東京都', city: '武蔵野市', address: '吉祥寺本町12-12-12', building: '', homepage: 'https://tamanomi-kichijoji.com', phone: '03-2345-6780', genre: '居酒屋', status: 'active', registeredAt: '2024-03-15' },
  { id: '13', name: 'たまのみ 立川店', postalCode: '190-0012', prefecture: '東京都', city: '立川市', address: '曙町13-13-13', building: '', homepage: 'https://tamanomi-tachikawa.com', phone: '03-3456-7891', genre: 'ラーメン店', status: 'active', registeredAt: '2024-03-20' },
  { id: '14', name: 'たまのみ 町田店', postalCode: '194-0013', prefecture: '東京都', city: '町田市', address: '原町田14-14-14', building: '', homepage: 'https://tamanomi-machida.com', phone: '03-4567-8902', genre: 'ファストフード', status: 'inactive', registeredAt: '2024-03-25' },
  { id: '15', name: 'たまのみ 八王子店', postalCode: '192-0083', prefecture: '東京都', city: '八王子市', address: '旭町15-15-15', building: '', homepage: 'https://tamanomi-hachioji.com', phone: '03-5678-9013', genre: '中華料理', status: 'active', registeredAt: '2024-03-30' },
  { id: '16', name: 'たまのみ 横浜店', postalCode: '220-0011', prefecture: '神奈川県', city: '横浜市西区', address: '高島16-16-16', building: '', homepage: 'https://tamanomi-yokohama.com', phone: '045-1234-5678', genre: '居酒屋', status: 'active', registeredAt: '2024-04-01' },
  { id: '17', name: 'たまのみ 川崎店', postalCode: '210-0007', prefecture: '神奈川県', city: '川崎市川崎区', address: '駅前本町17-17-17', building: '', homepage: 'https://tamanomi-kawasaki.com', phone: '044-2345-6789', genre: 'レストラン', status: 'active', registeredAt: '2024-04-05' },
  { id: '18', name: 'たまのみ 大宮店', postalCode: '330-0854', prefecture: '埼玉県', city: 'さいたま市大宮区', address: '桜木町18-18-18', building: '', homepage: 'https://tamanomi-omiya.com', phone: '048-3456-7890', genre: 'カフェ', status: 'inactive', registeredAt: '2024-04-10' },
  { id: '19', name: 'たまのみ 浦和店', postalCode: '330-0062', prefecture: '埼玉県', city: 'さいたま市浦和区', address: '仲町19-19-19', building: '', homepage: 'https://tamanomi-urawa.com', phone: '048-4567-8901', genre: '寿司店', status: 'active', registeredAt: '2024-04-15' },
  { id: '20', name: 'たまのみ 千葉店', postalCode: '260-0028', prefecture: '千葉県', city: '千葉市中央区', address: '新町20-20-20', building: '', homepage: 'https://tamanomi-chiba.com', phone: '043-5678-9012', genre: '居酒屋', status: 'active', registeredAt: '2024-04-20' },
  { id: '21', name: 'たまのみ 船橋店', postalCode: '273-0005', prefecture: '千葉県', city: '船橋市', address: '本町21-21-21', building: '', homepage: 'https://tamanomi-funabashi.com', phone: '047-6789-0123', genre: 'イタリアン', status: 'active', registeredAt: '2024-04-25' },
  { id: '22', name: 'たまのみ 柏店', postalCode: '277-0005', prefecture: '千葉県', city: '柏市', address: '柏22-22-22', building: '', homepage: 'https://tamanomi-kashiwa.com', phone: '04-7890-1234', genre: 'フレンチ', status: 'inactive', registeredAt: '2024-05-01' },
  { id: '23', name: 'たまのみ 津田沼店', postalCode: '275-0016', prefecture: '千葉県', city: '習志野市', address: '津田沼23-23-23', building: '', homepage: 'https://tamanomi-tsudanuma.com', phone: '047-8901-2345', genre: '焼肉店', status: 'active', registeredAt: '2024-05-05' },
  { id: '24', name: 'たまのみ 市川店', postalCode: '272-0034', prefecture: '千葉県', city: '市川市', address: '市川24-24-24', building: '', homepage: 'https://tamanomi-ichikawa.com', phone: '047-9012-3456', genre: 'ラーメン店', status: 'active', registeredAt: '2024-05-10' },
  { id: '25', name: 'たまのみ 松戸店', postalCode: '271-0092', prefecture: '千葉県', city: '松戸市', address: '松戸25-25-25', building: '', homepage: 'https://tamanomi-matsudo.com', phone: '047-0123-4567', genre: 'カフェ', status: 'active', registeredAt: '2024-05-15' },
  { id: '26', name: 'たまのみ 所沢店', postalCode: '359-1123', prefecture: '埼玉県', city: '所沢市', address: '日吉町26-26-26', building: '', homepage: 'https://tamanomi-tokorozawa.com', phone: '04-2934-5678', genre: '居酒屋', status: 'inactive', registeredAt: '2024-05-20' },
  { id: '27', name: 'たまのみ 川越店', postalCode: '350-0043', prefecture: '埼玉県', city: '川越市', address: '新富町27-27-27', building: '', homepage: 'https://tamanomi-kawagoe.com', phone: '049-2345-6789', genre: 'レストラン', status: 'active', registeredAt: '2024-05-25' },
  { id: '28', name: 'たまのみ 越谷店', postalCode: '343-0813', prefecture: '埼玉県', city: '越谷市', address: '越ヶ谷28-28-28', building: '', homepage: 'https://tamanomi-koshigaya.com', phone: '048-9876-5432', genre: '中華料理', status: 'active', registeredAt: '2024-05-30' },
  { id: '29', name: 'たまのみ 草加店', postalCode: '340-0016', prefecture: '埼玉県', city: '草加市', address: '中央29-29-29', building: '', homepage: 'https://tamanomi-soka.com', phone: '048-8765-4321', genre: 'その他', status: 'active', registeredAt: '2024-06-01' },
  { id: '30', name: 'たまのみ 春日部店', postalCode: '344-0061', prefecture: '埼玉県', city: '春日部市', address: '粕壁30-30-30', building: '', homepage: 'https://tamanomi-kasukabe.com', phone: '048-7654-3210', genre: 'ファストフード', status: 'inactive', registeredAt: '2024-06-05' },
];

export default function StoreManagement() {
  const [searchForm, setSearchForm] = useState({
    storeId: '',
    storeName: '',
    prefecture: '',
    city: '',
    address: '',
    building: '',
    phone: '',
    genres: [] as string[],
  });
  const [appliedSearchForm, setAppliedSearchForm] = useState({
    storeId: '',
    storeName: '',
    prefecture: '',
    city: '',
    address: '',
    building: '',
    phone: '',
    genres: [] as string[],
  });
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [appliedStatusFilter, setAppliedStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // フィルタリング処理
  const filteredStores = sampleStores.filter((store) => {
    const matchesSearch = 
      (appliedSearchForm.storeId === '' || store.id.includes(appliedSearchForm.storeId)) &&
      (appliedSearchForm.storeName === '' || store.name.toLowerCase().includes(appliedSearchForm.storeName.toLowerCase())) &&
      (appliedSearchForm.prefecture === '' || store.prefecture.toLowerCase().includes(appliedSearchForm.prefecture.toLowerCase())) &&
      (appliedSearchForm.city === '' || store.city.toLowerCase().includes(appliedSearchForm.city.toLowerCase())) &&
      (appliedSearchForm.address === '' || store.address.toLowerCase().includes(appliedSearchForm.address.toLowerCase())) &&
      (appliedSearchForm.building === '' || store.building.toLowerCase().includes(appliedSearchForm.building.toLowerCase())) &&
      (appliedSearchForm.phone === '' || store.phone.includes(appliedSearchForm.phone)) &&
      (appliedSearchForm.genres.length === 0 || appliedSearchForm.genres.includes(store.genre));
    
    const matchesStatus = appliedStatusFilter === 'all' || store.status === appliedStatusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleInputChange = (field: keyof typeof searchForm, value: string) => {
    setSearchForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenreChange = (genre: string, checked: boolean) => {
    setSearchForm(prev => ({
      ...prev,
      genres: checked 
        ? [...prev.genres, genre]
        : prev.genres.filter(g => g !== genre)
    }));
  };

  const handleSearch = () => {
    // 検索フォームの内容を適用済み検索フォームにコピーして検索実行
    setAppliedSearchForm({ ...searchForm });
    setAppliedStatusFilter(statusFilter);
    console.log('検索実行:', searchForm);
  };

  const handleClear = () => {
    setSearchForm({
      storeId: '',
      storeName: '',
      prefecture: '',
      city: '',
      address: '',
      building: '',
      phone: '',
      genres: [],
    });
    setStatusFilter('all');
    setAppliedSearchForm({
      storeId: '',
      storeName: '',
      prefecture: '',
      city: '',
      address: '',
      building: '',
      phone: '',
      genres: [],
    });
    setAppliedStatusFilter('all');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">店舗管理</h1>
            <p className="text-gray-600">
              加盟店舗の管理・編集を行います
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 店舗ID */}
            <div>
              <label htmlFor="storeId" className="block text-sm font-medium text-gray-700 mb-2">
                店舗ID
              </label>
              <input
                type="text"
                id="storeId"
                placeholder="店舗IDを入力"
                value={searchForm.storeId}
                onChange={(e) => handleInputChange('storeId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* 店舗名 */}
            <div>
              <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-2">
                店舗名
              </label>
              <input
                type="text"
                id="storeName"
                placeholder="店舗名を入力"
                value={searchForm.storeName}
                onChange={(e) => handleInputChange('storeName', e.target.value)}
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

            {/* 番地以降 */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                番地以降
              </label>
              <input
                type="text"
                id="address"
                placeholder="番地以降を入力"
                value={searchForm.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* 建物名 */}
            <div>
              <label htmlFor="building" className="block text-sm font-medium text-gray-700 mb-2">
                建物名
              </label>
              <input
                type="text"
                id="building"
                placeholder="建物名を入力"
                value={searchForm.building}
                onChange={(e) => handleInputChange('building', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* 電話番号 */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                電話番号
              </label>
              <input
                type="text"
                id="phone"
                placeholder="電話番号を入力"
                value={searchForm.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* ステータス */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">すべて</option>
                <option value="active">営業中</option>
                <option value="inactive">休業中</option>
              </select>
            </div>
            </div>

            {/* ジャンル（複数選択） */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ジャンル（複数選択可）
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {genres.map((genre) => (
                  <label key={genre} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={searchForm.genres.includes(genre)}
                      onChange={(e) => handleGenreChange(genre, e.target.checked)}
                      className="mr-2 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{genre}</span>
                  </label>
                ))}
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

        {/* 店舗一覧 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              店舗一覧 ({filteredStores.length}件)
            </h3>
            <Link href="/stores/new">
              <Button variant="outline" className="bg-white text-green-600 border-green-600 hover:bg-green-50">
                <span className="mr-2">+</span>
                新規登録
              </Button>
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    店舗名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    郵便番号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    住所
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    電話番号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ホームページ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ジャンル
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {filteredStores.map((store) => (
                  <tr key={store.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{store.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{store.postalCode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{store.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{store.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                          <a 
                            href={store.homepage} 
                            target="_blank" 
                            rel="noopener noreferrer"
                        className="text-sm text-green-600 hover:text-green-800 underline"
                          >
                            {store.homepage}
                          </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{store.genre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {store.status === 'active' ? '営業中' : '休業中'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link href={`/stores/${store.id}/edit`}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-green-600 border-green-300 hover:bg-green-50"
                          onClick={() => console.log('Edit button clicked for store:', store)}
                        >
                          編集
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                        削除
                      </Button>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>

          {filteredStores.length === 0 && (
            <div className="text-center py-12">
              <Icon name="store" size="lg" className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">店舗が見つかりません</h3>
              <p className="text-gray-500">検索条件を変更してお試しください。</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}