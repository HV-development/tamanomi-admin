'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminLayout from '@/components/templates/admin-layout';
import Button from '@/components/atoms/Button';
import Checkbox from '@/components/atoms/Checkbox';
import ToastContainer from '@/components/molecules/toast-container';
import FloatingFooter from '@/components/molecules/floating-footer';
import AccountIssueConfirmModal from '@/components/molecules/account-issue-confirm-modal';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { prefectures } from '@/lib/constants/merchant';
import { type MerchantWithDetails } from '@hv-development/schemas';
import { useAuth } from '@/components/contexts/auth-context';

// APIレスポンス用の型（日付がstringとして返される）
type Merchant = Omit<MerchantWithDetails, 'createdAt' | 'updatedAt' | 'deletedAt' | 'account' | 'shops'> & {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  accountEmail: string;
  account?: {
    email: string;
    status: string;
    displayName: string | null;
    lastLoginAt: string | null;
  };
};

export default function MerchantsPage() {
  const auth = useAuth();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [myMerchant, setMyMerchant] = useState<Merchant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toasts, removeToast, showSuccess, showError } = useToast();
  
  // 会社アカウントかどうかを判定
  const isMerchantAccount = auth?.user?.accountType === 'merchant';
  
  // チェックボックス関連の状態
  const [selectedMerchants, setSelectedMerchants] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isIndeterminate, setIsIndeterminate] = useState(false);
  const [isIssuingAccount, setIsIssuingAccount] = useState(false);
  const [showAccountIssueModal, setShowAccountIssueModal] = useState(false);
  
  const [searchForm, setSearchForm] = useState({
    merchantId: '',
    merchantName: '',
    representativeName: '',
    email: '',
    phone: '',
    postalCode: '',
    address: '',
    prefecture: '',
    accountNotIssued: false,
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
    accountNotIssued: false,
  });
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // データ取得
  useEffect(() => {
    let isMounted = true;
    let hasFetched = false;
    const abortController = new AbortController();

    const fetchMerchants = async () => {
      // 重複実行を防止
      if (hasFetched) {
        console.log('🔍 MerchantsPage: Already fetched, skipping...');
        return;
      }
      hasFetched = true;
      try {
        setIsLoading(true);
        setError(null);
        
        // 会社アカウントの場合は自分の会社情報のみを取得
        if (isMerchantAccount) {
          const data = await apiClient.getMyMerchant();
          
          if (!isMounted) return;
          
          // APIレスポンス形式: {success: true, data: {...}}
          let merchantData: Merchant | null = null;
          if (data && typeof data === 'object') {
            if ('data' in data && data.data && typeof data.data === 'object') {
              merchantData = data.data as Merchant;
            }
          }
          
          if (isMounted && merchantData) {
            setMyMerchant(merchantData);
          }
          return;
        }
        
        console.log('🔍 MerchantsPage: Starting to fetch merchants data');
        const data = await apiClient.getMerchants();
        console.log('🔍 MerchantsPage: API call completed, data received');
        
        // コンポーネントがアンマウントされている場合は処理を中断
        if (!isMounted) return;
        
        console.log('🔍 MerchantsPage: API Response received', { 
          data, 
          dataType: typeof data, 
          isArray: Array.isArray(data),
          hasMerchants: data && typeof data === 'object' && 'merchants' in data,
          hasDataMerchants: data && typeof data === 'object' && 'data' in data && data.data && typeof data.data === 'object' && 'merchants' in data.data,
          dataKeys: data && typeof data === 'object' ? Object.keys(data) : 'not object',
          dataDataKeys: data && typeof data === 'object' && 'data' in data && data.data && typeof data.data === 'object' ? Object.keys(data.data) : 'no data.data',
          dataStructure: JSON.stringify(data, null, 2)
        });
        
        // APIレスポンスが {success: true, data: {merchants: [], pagination: {}}} の形式の場合
        let merchantsArray: unknown[] = [];
        if (Array.isArray(data)) {
          merchantsArray = data;
        } else if (data && typeof data === 'object') {
          // 新しいAPIレスポンス形式: {success: true, data: {merchants: [...], pagination: {...}}}
          if ('data' in data && data.data && typeof data.data === 'object' && 'merchants' in data.data) {
            merchantsArray = (data.data as { merchants: unknown[] }).merchants || [];
          }
          // 古いAPIレスポンス形式: {merchants: [...], pagination: {...}}
          else if ('merchants' in data) {
            merchantsArray = (data as { merchants: unknown[] }).merchants || [];
          }
        }
        console.log('🔍 MerchantsPage: Processed merchants array', { 
          merchantsArray, 
          length: merchantsArray.length,
          firstMerchant: merchantsArray[0] || 'no merchants'
        });
        
        if (isMounted) {
          setMerchants(merchantsArray as Merchant[]);
        }
      } catch (err: unknown) {
        // アボート時のエラーは無視
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        
        if (isMounted) {
          console.error('会社データの取得に失敗しました:', err);
          setError('会社データの取得に失敗しました');
          setMerchants([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMerchants();

    // クリーンアップ: コンポーネントのアンマウント時または再実行時にリクエストをキャンセル
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [isMerchantAccount]);

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

  const handleResendRegistration = async (merchantId: string) => {
    if (!confirm('登録用URLを再発行しますか？')) {
      return;
    }

    try {
      await apiClient.resendMerchantRegistration(merchantId);
      showSuccess('登録用URLを再送信しました');
    } catch (error) {
      console.error('登録URL再発行エラー:', error);
      showError('登録URLの再発行に失敗しました');
    }
  };

  const handleIssueAccount = async () => {
    if (selectedMerchants.size === 0) return;

    // アカウント発行確認モーダルを表示
    setShowAccountIssueModal(true);
  };

  const handleConfirmAccountIssue = async () => {
    if (selectedMerchants.size === 0) return;

    setShowAccountIssueModal(false);
    setIsIssuingAccount(true);
    try {
      // アカウント発行処理（実装は後で）
      await new Promise(resolve => setTimeout(resolve, 2000)); // 仮の処理
      
      showSuccess(`${selectedMerchants.size}件の会社にアカウントを発行しました`);
      
      // 選択をクリア
      setSelectedMerchants(new Set());
      setIsAllSelected(false);
      setIsIndeterminate(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      showError(`アカウント発行に失敗しました: ${errorMessage}`);
    } finally {
      setIsIssuingAccount(false);
    }
  };

  const handleCancelAccountIssue = () => {
    setShowAccountIssueModal(false);
  };

  const getAccountStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return '契約中';
      case 'inactive': return 'メール承認待ち';
      case 'suspended': return '解約';
      case 'terminated': return '終了';
      default: return status;
    }
  };

  // 選択された会社のアカウント発行済み数を取得
  const getExistingAccountCount = () => {
    const selectedMerchantList = Array.from(selectedMerchants);
    const existingAccounts = selectedMerchantList.filter(merchantId => {
      const merchant = filteredMerchants.find(m => m.id === merchantId);
      return merchant && merchant.account && merchant.account.status === 'active';
    });
    
    return existingAccounts.length;
  };

  const getAccountStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-yellow-600';
      case 'suspended': return 'text-red-600';
      case 'terminated': return 'text-gray-600';
      default: return 'text-gray-900';
    }
  };

  // フィルタリング処理
  const filteredMerchants = Array.isArray(merchants) ? merchants.filter((merchant) => {
    const matchesSearch = 
      (appliedSearchForm.merchantId === '' || merchant.id.includes(appliedSearchForm.merchantId)) &&
      (appliedSearchForm.merchantName === '' || merchant.name.toLowerCase().includes(appliedSearchForm.merchantName.toLowerCase())) &&
      (appliedSearchForm.representativeName === '' || 
        `${merchant.representativeNameLast} ${merchant.representativeNameFirst}`.toLowerCase().includes(appliedSearchForm.representativeName.toLowerCase())) &&
      (appliedSearchForm.email === '' || merchant.account?.email.toLowerCase().includes(appliedSearchForm.email.toLowerCase())) &&
      (appliedSearchForm.phone === '' || merchant.representativePhone.includes(appliedSearchForm.phone)) &&
      (appliedSearchForm.postalCode === '' || merchant.postalCode.includes(appliedSearchForm.postalCode)) &&
      (appliedSearchForm.address === '' || 
        `${merchant.prefecture}${merchant.city}${merchant.address1}${merchant.address2}`.toLowerCase().includes(appliedSearchForm.address.toLowerCase())) &&
      (appliedSearchForm.prefecture === '' || merchant.prefecture.toLowerCase().includes(appliedSearchForm.prefecture.toLowerCase()));

    // アカウント未発行のフィルタ
    const matchesAccountFilter = appliedSearchForm.accountNotIssued 
      ? !merchant.account || merchant.account.status !== 'active'
      : true;
    
    return matchesSearch && matchesAccountFilter;
  }) : [];

  const handleInputChange = (field: keyof typeof searchForm, value: string) => {
    setSearchForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (field: keyof typeof searchForm, checked: boolean) => {
    setSearchForm(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const handleSearch = () => {
    // 検索フォームの内容を適用済み検索フォームにコピーして検索実行
    setAppliedSearchForm({ ...searchForm });
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
      accountNotIssued: false,
    });
    setAppliedSearchForm({
      merchantId: '',
      merchantName: '',
      representativeName: '',
      email: '',
      phone: '',
      postalCode: '',
      address: '',
      prefecture: '',
      accountNotIssued: false,
    });
  };


  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">会社データを読み込み中...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // 会社アカウントの場合は自分の会社情報のみを表示
  if (isMerchantAccount) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          {/* ヘッダー */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">事業者情報</h1>
            <p className="text-gray-600 mt-1">事業者の詳細情報を確認できます</p>
          </div>

          {/* ローディング状態 */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-600">読み込み中...</p>
            </div>
          )}

          {/* エラー状態 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* 会社情報 */}
          {!isLoading && !error && myMerchant && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 space-y-6">
                {/* 基本情報 */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
                  <table className="w-full border-collapse border border-gray-300">
                    <tbody>
                      <tr className="border-b border-gray-300">
                        <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 w-1/2">事業者名</td>
                        <td className="py-3 px-4 text-gray-900">{myMerchant.name}</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 w-1/3">事業者名（カナ）</td>
                        <td className="py-3 px-4 text-gray-900">{myMerchant.nameKana}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 代表者情報 */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">代表者情報</h2>
                  <table className="w-full border-collapse border border-gray-300">
                    <tbody>
                      <tr className="border-b border-gray-300">
                        <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 w-1/3">代表者名</td>
                        <td className="py-3 px-4 text-gray-900">{myMerchant.representativeNameLast} {myMerchant.representativeNameFirst}</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 w-1/3">代表者名（カナ）</td>
                        <td className="py-3 px-4 text-gray-900">{myMerchant.representativeNameLastKana} {myMerchant.representativeNameFirstKana}</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 w-1/3">電話番号</td>
                        <td className="py-3 px-4 text-gray-900">{myMerchant.representativePhone}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 住所情報 */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">住所情報</h2>
                  <table className="w-full border-collapse border border-gray-300">
                    <tbody>
                      <tr className="border-b border-gray-300">
                        <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 w-1/3">郵便番号</td>
                        <td className="py-3 px-4 text-gray-900">{myMerchant.postalCode}</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 w-1/3">都道府県</td>
                        <td className="py-3 px-4 text-gray-900">{myMerchant.prefecture}</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 w-1/3">市区町村</td>
                        <td className="py-3 px-4 text-gray-900">{myMerchant.city}</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 w-1/3">番地</td>
                        <td className="py-3 px-4 text-gray-900">{myMerchant.address1}</td>
                      </tr>
                      {myMerchant.address2 && (
                        <tr className="border-b border-gray-300">
                          <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 w-1/3">建物名・部屋番号</td>
                          <td className="py-3 px-4 text-gray-900">{myMerchant.address2}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* アカウント情報 */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">アカウント情報</h2>
                  <table className="w-full border-collapse border border-gray-300">
                    <tbody>
                      <tr className="border-b border-gray-300">
                        <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 w-1/3">メールアドレス</td>
                        <td className="py-3 px-4 text-gray-900">{myMerchant.account?.email || myMerchant.accountEmail}</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="py-3 px-4 text-sm font-medium text-gray-700 bg-gray-50 w-1/3">アカウントステータス</td>
                        <td className={`py-3 px-4 text-sm font-medium ${getAccountStatusColor(myMerchant.account?.status || 'inactive')}`}>
                          {getAccountStatusLabel(myMerchant.account?.status || 'inactive')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ボタンエリア */}
          {!isLoading && !error && myMerchant && (
            <div className="flex justify-center gap-4">
              <Link href={`/merchants/${myMerchant.id}/shops`}>
                <button className="px-6 py-3 border-2 border-green-600 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium text-base">
                  店舗一覧を見る
                </button>
              </Link>
              <Link href={`/merchants/${myMerchant.id}/edit-account`}>
                <button className="px-6 py-3 border-2 border-green-600 bg-green-600 text-white rounded-lg hover:bg-green-700 hover:border-green-700 transition-colors font-medium text-base">
                  アカウント情報編集
                </button>
              </Link>
            </div>
          )}
        </div>
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">事業者管理</h1>
            <p className="text-gray-600">
              事業者の管理・編集を行います
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

            {/* アカウント未発行 */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={searchForm.accountNotIssued}
                  onChange={(e) => handleCheckboxChange('accountNotIssued', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  アカウント未発行のみ
                </span>
              </label>
            </div>
            </div>

            {/* 検索・クリアボタン */}
            <div className="flex justify-center gap-2 mt-6">
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

        {/* 会社一覧 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              会社一覧 ({filteredMerchants.length}件)
            </h3>
            <Link href="/merchants/new">
              <Button variant="outline" className="bg-white text-green-600 border-green-600 hover:bg-green-50 cursor-pointer">
                <span className="mr-2">+</span>
                新規登録
              </Button>
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1320px]">
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
                    会社名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    代表者名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    電話番号
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
                        <div className="flex-1 flex justify-center gap-2">
                          <Link href={`/merchants/${merchant.id}/edit`}>
                            <button 
                              className="p-2.5 text-green-600 hover:text-green-800 rounded-lg transition-colors cursor-pointer flex items-center justify-center min-w-[44px] min-h-[44px]"
                              title="編集"
                            >
                              <Image 
                                src="/edit.svg" 
                                alt="編集" 
                                width={24}
                                height={24}
                                className="w-6 h-6 flex-shrink-0"
                              />
                            </button>
                          </Link>
                          <Link href={`/merchants/${merchant.id}/shops`}>
                            <button 
                              className="p-2.5 text-blue-600 hover:text-blue-800 rounded-lg transition-colors cursor-pointer flex items-center justify-center min-w-[44px] min-h-[44px]"
                              title="店舗一覧"
                            >
                              <Image 
                                src="/store-list.svg" 
                                alt="店舗一覧" 
                                width={24}
                                height={24}
                                className="w-6 h-6 flex-shrink-0"
                              />
                            </button>
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[200px]">
                      <div className="text-sm font-medium text-gray-900">{merchant.name}</div>
                      <div className="text-sm text-gray-500">{merchant.nameKana}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[150px]">
                      <div className="text-sm font-medium text-gray-900">{merchant.representativeNameLast} {merchant.representativeNameFirst}</div>
                      <div className="text-sm text-gray-500">{merchant.representativeNameLastKana} {merchant.representativeNameFirstKana}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[120px]">
                      <div className="text-sm text-gray-900">{merchant.representativePhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[200px]">
                      <div className="text-sm text-gray-900">{merchant.email}</div>
                    </td>
                    <td className="px-6 py-4 min-w-[250px]">
                      <div className="text-sm text-gray-900">
                        〒{merchant.postalCode}<br />
                        {merchant.prefecture}{merchant.city}{merchant.address1}{merchant.address2}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[180px]">
                      <div className="flex items-center gap-2">
                        <div className={`text-sm font-medium ${getAccountStatusColor(merchant.account?.status || 'inactive')}`}>
                          {getAccountStatusLabel(merchant.account?.status || 'inactive')}
                        </div>
                        {merchant.account?.status === 'inactive' && (
                          <button 
                            onClick={() => handleResendRegistration(merchant.id)}
                            className="p-1.5 text-orange-600 hover:text-orange-800 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                            title="登録URL再発行"
                          >
                            <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </button>
                        )}
                      </div>
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
                src="/storefront-icon.svg" 
                alt="店舗" 
                width={48} 
                height={48}
                className="mx-auto text-gray-400 mb-4"
              />
              <h3 className="text-lg font-medium text-gray-900 mb-2">会社が見つかりません</h3>
              <p className="text-gray-500">検索条件を変更してお試しください。</p>
            </div>
          )}
        </div>
      </div>
      
      <FloatingFooter
        selectedCount={selectedMerchants.size}
        onIssueAccount={handleIssueAccount}
        isIssuingAccount={isIssuingAccount}
      />
      
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      
      <AccountIssueConfirmModal
        isOpen={showAccountIssueModal}
        onClose={handleCancelAccountIssue}
        onConfirm={handleConfirmAccountIssue}
        selectedCount={selectedMerchants.size}
        existingAccountCount={getExistingAccountCount()}
        isExecuting={isIssuingAccount}
      />
    </AdminLayout>
  );
}