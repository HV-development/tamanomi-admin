'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/templates/DashboardLayout';
import Button from '@/atoms/Button';
import Icon from '@/atoms/Icon';
import Checkbox from '@/atoms/Checkbox';
import ToastContainer from '@/molecules/ToastContainer';
import FloatingFooter from '@/molecules/FloatingFooter';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/useToast';

interface Merchant {
  id: string;
  name: string;
  nameKana: string;
  representative: string;
  representativeName: string;
  representativePhone: string;
  email: string;
  phone: string;
  postalCode: string;
  address: string;
  status: 'registering' | 'collection_requested' | 'approval_pending' | 'promotional_materials_preparing' | 'promotional_materials_shipping' | 'operating' | 'suspended' | 'terminated';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  account: {
    email: string;
    status: string;
    displayName: string | null;
    lastLoginAt: string | null;
  };
  shops: Array<{
    id: string;
    name: string;
    status: string;
  }>;
}

// ステータスの日本語マッピング
const statusLabels: Record<string, string> = {
  registering: '登録中',
  collection_requested: '回収依頼中',
  approval_pending: '承認待ち',
  promotional_materials_preparing: '販促物準備中',
  promotional_materials_shipping: '販促物発送中',
  operating: '運用中',
  suspended: '停止中',
  terminated: '解約済み',
};

// ステータスオプション
const statusOptions = [
  { value: 'registering', label: '登録中' },
  { value: 'collection_requested', label: '回収依頼中' },
  { value: 'approval_pending', label: '承認待ち' },
  { value: 'promotional_materials_preparing', label: '販促物準備中' },
  { value: 'promotional_materials_shipping', label: '販促物発送中' },
  { value: 'operating', label: '運用中' },
  { value: 'suspended', label: '停止中' },
  { value: 'terminated', label: '解約済み' },
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

// サンプルデータ
const sampleMerchants: Merchant[] = [
  { 
    id: '550e8400-e29b-41d4-a716-446655440001', 
    name: '株式会社たまのみ', 
    nameKana: 'カブシキガイシャタマノミ',
    representative: '代表取締役',
    representativeName: '田中太郎',
    representativePhone: '03-1234-5678',
    email: 'info@tamanomi.co.jp', 
    phone: '03-1234-5679', 
    postalCode: '100-0001', 
    address: '東京都千代田区千代田1-1-1', 
    status: 'operating', 
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
    deletedAt: null,
    account: {
      email: 'info@tamanomi.co.jp',
      status: 'active',
      displayName: 'たまのみ',
      lastLoginAt: '2024-01-15T10:00:00Z'
    },
    shops: [] 
  },
  { 
    id: '550e8400-e29b-41d4-a716-446655440002', 
    name: '株式会社レストラン山田', 
    nameKana: 'カブシキガイシャレストランヤマダ',
    representative: '代表取締役',
    representativeName: '山田花子',
    representativePhone: '03-2345-6789',
    email: 'info@yamada-restaurant.co.jp', 
    phone: '03-2345-6790', 
    postalCode: '150-0002', 
    address: '東京都渋谷区渋谷2-2-2', 
    status: 'operating', 
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
    deletedAt: null,
    account: {
      email: 'info@yamada-restaurant.co.jp',
      status: 'active',
      displayName: 'レストラン山田',
      lastLoginAt: '2024-01-20T14:30:00Z'
    },
    shops: [] 
  },
  { 
    id: '550e8400-e29b-41d4-a716-446655440003', 
    name: '株式会社カフェ佐藤', 
    nameKana: 'カブシキガイシャカフェサトウ',
    representative: '代表取締役',
    representativeName: '佐藤次郎',
    representativePhone: '03-3456-7890',
    email: 'info@sato-cafe.co.jp', 
    phone: '03-3456-7891', 
    postalCode: '160-0022', 
    address: '東京都新宿区新宿3-3-3', 
    status: 'registering', 
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01',
    deletedAt: null,
    account: {
      email: 'info@sato-cafe.co.jp',
      status: 'active',
      displayName: 'カフェ佐藤',
      lastLoginAt: '2024-02-01T09:15:00Z'
    },
    shops: [] 
  },
  { 
    id: '550e8400-e29b-41d4-a716-446655440004', 
    name: '株式会社居酒屋鈴木', 
    nameKana: 'カブシキガイシャイザカヤスズキ',
    representative: '代表取締役',
    representativeName: '鈴木三郎',
    representativePhone: '03-4567-8901',
    email: 'info@suzuki-izakaya.co.jp', 
    phone: '03-4567-8902', 
    postalCode: '171-0022', 
    address: '東京都豊島区池袋4-4-4', 
    status: 'suspended', 
    createdAt: '2024-02-05',
    updatedAt: '2024-02-05',
    deletedAt: null,
    account: {
      email: 'info@suzuki-izakaya.co.jp',
      status: 'inactive',
      displayName: '居酒屋鈴木',
      lastLoginAt: '2024-02-05T16:45:00Z'
    },
    shops: [] 
  },
  { 
    id: '550e8400-e29b-41d4-a716-446655440005', 
    name: '株式会社ラーメン高橋', 
    nameKana: 'カブシキガイシャラーメンタカハシ',
    representative: '代表取締役',
    representativeName: '高橋四郎',
    representativePhone: '03-5678-9012',
    email: 'info@takahashi-ramen.co.jp', 
    phone: '03-5678-9013', 
    postalCode: '108-0075', 
    address: '東京都港区港南5-5-5', 
    status: 'operating', 
    createdAt: '2024-02-10',
    updatedAt: '2024-02-10',
    deletedAt: null,
    account: {
      email: 'info@takahashi-ramen.co.jp',
      status: 'active',
      displayName: 'ラーメン高橋',
      lastLoginAt: '2024-02-10T11:20:00Z'
    },
    shops: [] 
  },
];

export default function MerchantManagement() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toasts, removeToast, showSuccess, showError } = useToast();
  
  // チェックボックス関連の状態
  const [selectedMerchants, setSelectedMerchants] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isIndeterminate, setIsIndeterminate] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('operating');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isIssuingAccount, setIsIssuingAccount] = useState(false);
  
  const [searchForm, setSearchForm] = useState({
    merchantId: '',
    merchantName: '',
    representativeName: '',
    email: '',
    phone: '',
    postalCode: '',
    address: '',
    prefecture: '',
  });
  const [appliedSearchForm, setAppliedSearchForm] = useState({
    merchantId: '',
    merchantName: '',
    representativeName: '',
    email: '',
    phone: '',
    postalCode: '',
    address: '',
    prefecture: '',
  });
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'inactive' | 'suspended'>('all');
  const [appliedStatusFilter, setAppliedStatusFilter] = useState<'all' | 'pending' | 'active' | 'inactive' | 'suspended'>('all');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // データ取得
  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await apiClient.getMerchants();
        // APIレスポンスが {merchants: [], pagination: {}} の形式の場合
        const merchantsArray = Array.isArray(data) ? data : data.merchants || [];
        setMerchants(merchantsArray);
      } catch (err: any) {
        console.error('事業者データの取得に失敗しました:', err);
        setError('事業者データの取得に失敗しました');
        // エラー時はサンプルデータを使用
        setMerchants(sampleMerchants);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMerchants();
  }, []);

  // チェックボックス関連の関数
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredMerchants.map(merchant => merchant.id));
      setSelectedMerchants(allIds);
      setIsAllSelected(true);
      setIsIndeterminate(false);
    } else {
      setSelectedMerchants(new Set());
      setIsAllSelected(false);
      setIsIndeterminate(false);
    }
  };

  const handleSelectMerchant = (merchantId: string, checked: boolean) => {
    const newSelected = new Set(selectedMerchants);
    if (checked) {
      newSelected.add(merchantId);
    } else {
      newSelected.delete(merchantId);
    }
    setSelectedMerchants(newSelected);

    // 全選択状態の更新
    const totalCount = filteredMerchants.length;
    const selectedCount = newSelected.size;
    
    if (selectedCount === 0) {
      setIsAllSelected(false);
      setIsIndeterminate(false);
    } else if (selectedCount === totalCount) {
      setIsAllSelected(true);
      setIsIndeterminate(false);
    } else {
      setIsAllSelected(false);
      setIsIndeterminate(true);
    }
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const handleExecute = async () => {
    if (selectedMerchants.size === 0) return;

    setIsExecuting(true);
    try {
      // 選択された事業者のステータスを一括更新
      const updatePromises = Array.from(selectedMerchants).map(merchantId =>
        apiClient.updateMerchantStatus(merchantId, selectedStatus)
      );
      
      await Promise.all(updatePromises);
      
      // ローカル状態を更新
      setMerchants(prev =>
        prev.map(merchant =>
          selectedMerchants.has(merchant.id)
            ? { ...merchant, status: selectedStatus as any }
            : merchant
        )
      );
      
      showSuccess(`${selectedMerchants.size}件の事業者のステータスを「${statusLabels[selectedStatus]}」に更新しました`);
      
      // 選択をクリア
      setSelectedMerchants(new Set());
      setIsAllSelected(false);
      setIsIndeterminate(false);
    } catch (error: any) {
      showError(`ステータスの一括更新に失敗しました: ${error.message || '不明なエラー'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleIssueAccount = async () => {
    if (selectedMerchants.size === 0) return;

    setIsIssuingAccount(true);
    try {
      // アカウント発行処理（実装は後で）
      await new Promise(resolve => setTimeout(resolve, 2000)); // 仮の処理
      
      showSuccess(`${selectedMerchants.size}件の事業者にアカウントを発行しました`);
      
      // 選択をクリア
      setSelectedMerchants(new Set());
      setIsAllSelected(false);
      setIsIndeterminate(false);
    } catch (error: any) {
      showError(`アカウント発行に失敗しました: ${error.message || '不明なエラー'}`);
    } finally {
      setIsIssuingAccount(false);
    }
  };

  // フィルタリング処理
  const filteredMerchants = Array.isArray(merchants) ? merchants.filter((merchant) => {
    const matchesSearch = 
      (appliedSearchForm.merchantId === '' || merchant.id.includes(appliedSearchForm.merchantId)) &&
      (appliedSearchForm.merchantName === '' || merchant.name.toLowerCase().includes(appliedSearchForm.merchantName.toLowerCase())) &&
      (appliedSearchForm.representativeName === '' || merchant.representativeName.toLowerCase().includes(appliedSearchForm.representativeName.toLowerCase())) &&
      (appliedSearchForm.email === '' || merchant.email.toLowerCase().includes(appliedSearchForm.email.toLowerCase())) &&
      (appliedSearchForm.phone === '' || merchant.phone.includes(appliedSearchForm.phone)) &&
      (appliedSearchForm.postalCode === '' || merchant.postalCode.includes(appliedSearchForm.postalCode)) &&
      (appliedSearchForm.address === '' || merchant.address.toLowerCase().includes(appliedSearchForm.address.toLowerCase())) &&
      (appliedSearchForm.prefecture === '' || merchant.address.toLowerCase().includes(appliedSearchForm.prefecture.toLowerCase()));
    
    const matchesStatus = appliedStatusFilter === 'all' || merchant.status === appliedStatusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  const handleInputChange = (field: keyof typeof searchForm, value: string) => {
    setSearchForm(prev => ({
      ...prev,
      [field]: value
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
      merchantId: '',
      merchantName: '',
      representativeName: '',
      email: '',
      phone: '',
      postalCode: '',
      address: '',
      prefecture: '',
    });
    setStatusFilter('all');
    setAppliedSearchForm({
      merchantId: '',
      merchantName: '',
      representativeName: '',
      email: '',
      phone: '',
      postalCode: '',
      address: '',
      prefecture: '',
    });
    setAppliedStatusFilter('all');
  };

  const handleIndividualStatusChange = async (merchantId: string, newStatus: string) => {
    const originalMerchant = merchants.find(m => m.id === merchantId);
    if (!originalMerchant) return;

    const originalStatus = originalMerchant.status;

    // 楽観的更新: まずUIを更新
    setMerchants(prev => 
      prev.map(merchant => 
        merchant.id === merchantId 
          ? { ...merchant, status: newStatus as any }
          : merchant
      )
    );

    try {
      await apiClient.updateMerchantStatus(merchantId, newStatus);
      showSuccess(`事業者のステータスを「${statusLabels[newStatus]}」に更新しました`);
    } catch (error: any) {
      // エラー時は元のステータスに戻す
      setMerchants(prev => 
        prev.map(merchant => 
          merchant.id === merchantId 
            ? { ...merchant, status: originalStatus }
            : merchant
        )
      );
      showError(`ステータスの更新に失敗しました: ${error.message || '不明なエラー'}`);
    }
  };

  const getStatusLabel = (status: string) => {
    return statusLabels[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registering': return 'text-blue-600';
      case 'collection_requested': return 'text-purple-600';
      case 'approval_pending': return 'text-yellow-600';
      case 'promotional_materials_preparing': return 'text-orange-600';
      case 'promotional_materials_shipping': return 'text-indigo-600';
      case 'operating': return 'text-green-600';
      case 'suspended': return 'text-red-600';
      case 'terminated': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">事業者データを読み込み中...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">事業者管理</h1>
            <p className="text-gray-600">
              加盟事業者の管理・編集を行います
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

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <Icon name="alert" size="sm" className="text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

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
            {/* 事業者ID */}
            <div>
              <label htmlFor="merchantId" className="block text-sm font-medium text-gray-700 mb-2">
                事業者ID
              </label>
              <input
                type="text"
                id="merchantId"
                placeholder="事業者IDを入力"
                value={searchForm.merchantId}
                onChange={(e) => handleInputChange('merchantId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* 事業者名 */}
            <div>
              <label htmlFor="merchantName" className="block text-sm font-medium text-gray-700 mb-2">
                事業者名
              </label>
              <input
                type="text"
                id="merchantName"
                placeholder="事業者名を入力"
                value={searchForm.merchantName}
                onChange={(e) => handleInputChange('merchantName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* 代表者名 */}
            <div>
              <label htmlFor="representativeName" className="block text-sm font-medium text-gray-700 mb-2">
                代表者名
              </label>
              <input
                type="text"
                id="representativeName"
                placeholder="代表者名を入力"
                value={searchForm.representativeName}
                onChange={(e) => handleInputChange('representativeName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* メールアドレス */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                type="text"
                id="email"
                placeholder="メールアドレスを入力"
                value={searchForm.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
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

            {/* ステータス */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">すべて</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
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

        {/* 事業者一覧 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              事業者一覧 ({filteredMerchants.length}件)
            </h3>
            <Link href="/merchants/new">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isIndeterminate}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    事業者名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    代表者名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    メールアドレス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    電話番号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    住所
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
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
              {filteredMerchants.map((merchant) => (
                  <tr key={merchant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Checkbox
                        checked={selectedMerchants.has(merchant.id)}
                        onChange={(checked) => handleSelectMerchant(merchant.id, checked)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{merchant.name}</div>
                      <div className="text-sm text-gray-500">{merchant.nameKana}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{merchant.representativeName}</div>
                      <div className="text-sm text-gray-500">{merchant.representativePhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{merchant.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{merchant.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        〒{merchant.postalCode}<br />
                        {merchant.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={merchant.status}
                        onChange={(e) => handleIndividualStatusChange(merchant.id, e.target.value)}
                        className={`text-sm font-medium rounded-lg px-3 py-2 border border-gray-300 bg-white focus:ring-2 focus:ring-green-500 min-w-[140px] ${getStatusColor(merchant.status)}`}
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{merchant.createdAt}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link href={`/merchants/${merchant.id}/edit`}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-green-600 border-green-300 hover:bg-green-50"
                          onClick={() => console.log('Edit button clicked for merchant:', merchant)}
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

          {filteredMerchants.length === 0 && (
            <div className="text-center py-12">
              <Icon name="store" size="lg" className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">事業者が見つかりません</h3>
              <p className="text-gray-500">検索条件を変更してお試しください。</p>
            </div>
          )}
        </div>
      </div>
      
      <FloatingFooter
        selectedCount={selectedMerchants.size}
        onStatusChange={handleStatusChange}
        onExecute={handleExecute}
        onIssueAccount={handleIssueAccount}
        selectedStatus={selectedStatus}
        isExecuting={isExecuting}
        isIssuingAccount={isIssuingAccount}
      />
      
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </DashboardLayout>
  );
}
