'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import DashboardLayout from '@/components/templates/DashboardLayout';
import Button from '@/components/atoms/Button';
import Checkbox from '@/components/atoms/Checkbox';
import Icon from '@/components/atoms/Icon';
import ToastContainer from '@/components/molecules/ToastContainer';
import FloatingFooter from '@/components/molecules/FloatingFooter';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { statusLabels, statusOptions, prefectures } from '@/constants/merchant';

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
        console.error('掲載店データの取得に失敗しました:', err);
        setError('掲載店データの取得に失敗しました');
        setMerchants([]);
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
      showSuccess(`掲載店のステータスを「${statusLabels[newStatus]}」に更新しました`);
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
            <p className="text-gray-600">掲載店データを読み込み中...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">掲載店管理</h1>
            <p className="text-gray-600">
              掲載店の管理・編集を行います
            </p>
            </div>
            <div className="text-sm text-gray-600">
              <div className="flex items-center">
                <span className="font-medium text-gray-900">管理者太郎</span>
              </div>
            </div>
          </div>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <img 
                src="/alert.svg" 
                alt="警告" 
                width={16} 
                height={16}
                className="w-4 h-4 text-red-500 mr-2"
              />
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
              <div className="w-4 h-4 flex items-center justify-center">
                <span className={`text-gray-600 text-sm transition-transform duration-200 ${isSearchExpanded ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </div>
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

        {/* 掲載店一覧 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              掲載店一覧 ({filteredMerchants.length}件)
            </h3>
            <Link href="/merchants/new">
              <Button variant="outline" className="bg-white text-green-600 border-green-600 hover:bg-green-50 cursor-pointer">
                <span className="mr-2">+</span>
                新規登録
              </Button>
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48 whitespace-nowrap">
                    <div className="flex items-center space-x-4">
                      <Checkbox
                        checked={isAllSelected}
                        indeterminate={isIndeterminate}
                        onChange={handleSelectAll}
                      />
                      <span className="text-xs whitespace-nowrap">アクション</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                    掲載店名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    代表者名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                    メールアドレス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[250px]">
                    住所
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    登録日
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {filteredMerchants.map((merchant) => (
                  <tr key={merchant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap w-48">
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          checked={selectedMerchants.has(merchant.id)}
                          onChange={(checked) => handleSelectMerchant(merchant.id, checked)}
                        />
                        <div className="flex-1 flex justify-center space-x-2">
                          <Link href={`/merchants/${merchant.id}/edit`}>
                            <button 
                              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors cursor-pointer flex items-center justify-center"
                              title="編集"
                            >
                              <Image 
                                src="/edit.svg" 
                                alt="編集" 
                                width={32}
                                height={32}
                                className="w-8 h-8"
                              />
                            </button>
                          </Link>
                          <button 
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-transparent rounded-md transition-colors cursor-pointer flex items-center justify-center"
                            title="店舗一覧"
                          >
                            <Image 
                              src="/store-list.svg" 
                              alt="店舗一覧" 
                              width={32}
                              height={32}
                              className="w-8 h-8"
                            />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[200px]">
                      <div className="text-sm font-medium text-gray-900">{merchant.name}</div>
                      <div className="text-sm text-gray-500">{merchant.nameKana}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[150px]">
                      <div className="text-sm text-gray-900">{merchant.representativeName}</div>
                      <div className="text-sm text-gray-500">{merchant.representativePhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[200px]">
                      <div className="text-sm text-gray-900">{merchant.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[250px]">
                      <div className="text-sm text-gray-900">
                        〒{merchant.postalCode}<br />
                        {merchant.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[180px]">
                      <select
                        value={merchant.status}
                        onChange={(e) => handleIndividualStatusChange(merchant.id, e.target.value)}
                        className={`text-sm font-medium rounded-lg px-3 py-2 border border-gray-300 bg-white focus:ring-2 focus:ring-green-500 w-full ${getStatusColor(merchant.status)}`}
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[150px]">
                      <div className="text-sm text-gray-900">
                        {new Date(merchant.createdAt).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>

          {filteredMerchants.length === 0 && (
            <div className="text-center py-12">
              <img 
                src="/storefront_35dp_666666_FILL1_wght400_GRAD0_opsz40.svg" 
                alt="店舗" 
                width={48} 
                height={48}
                className="mx-auto text-gray-400 mb-4"
              />
              <h3 className="text-lg font-medium text-gray-900 mb-2">掲載店が見つかりません</h3>
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
