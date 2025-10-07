'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/atoms/button';
import Checkbox from '@/components/atoms/checkbox';
import ToastContainer from '@/components/molecules/toast-container';
import FloatingFooter from '@/components/molecules/floating-footer';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
// import { Store, StoreListResponse } from '@hv-development/schemas';

// 一時的な型定義
type Store = {
  id: string;
  name: string;
  status: string;
  [key: string]: any;
};

type StoreListResponse = {
  stores: Store[];
  pagination: {
    page: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    total: number;
  };
};

export default function ShopManagement() {
  const [shops, setShops] = useState<Store[]>([]);
  const [pagination, setPagination] = useState<StoreListResponse['pagination']>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    totalCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toasts, removeToast, showSuccess, showError } = useToast();
  
  // チェックボックス関連の状態
  const [selectedShops, setSelectedShops] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isIndeterminate, setIsIndeterminate] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [isExecuting, setIsExecuting] = useState(false);
  
  const [searchForm, setSearchForm] = useState({
    merchantId: '',
    shopName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [appliedSearchForm, setAppliedSearchForm] = useState({
    merchantId: '',
    shopName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [appliedStatusFilter, setAppliedStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // データ取得
  useEffect(() => {
    const fetchShops = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const queryParams = new URLSearchParams();
        queryParams.append('page', pagination.page.toString());
        queryParams.append('limit', pagination.limit.toString());
        
        if (appliedStatusFilter !== 'all') {
          queryParams.append('status', appliedStatusFilter);
        }
        if (appliedSearchForm.merchantId) {
          queryParams.append('merchantId', appliedSearchForm.merchantId);
        }
        
        const data = await apiClient.getShops(queryParams.toString());
        const response = data as StoreListResponse;
        setShops((response as any).shops || []);
        setPagination(response.pagination || pagination);
      } catch (err: unknown) {
        console.error('Failed to fetch shops:', err);
        setError(err instanceof Error ? err.message : '店舗データの取得に失敗しました');
        showError('店舗データの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchShops();
  }, [pagination.page, pagination.limit, appliedStatusFilter, appliedSearchForm.merchantId]);

  // チェックボックスの状態管理
  useEffect(() => {
    const selectedCount = selectedShops.size;
    const totalCount = shops.length;
    
    setIsAllSelected(selectedCount === totalCount && totalCount > 0);
    setIsIndeterminate(selectedCount > 0 && selectedCount < totalCount);
  }, [selectedShops, shops.length]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(shops.map(shop => shop.id));
      setSelectedShops(allIds);
    } else {
      setSelectedShops(new Set());
    }
  };

  const handleSelectShop = (shopId: string, checked: boolean) => {
    const newSelected = new Set(selectedShops);
    if (checked) {
      newSelected.add(shopId);
    } else {
      newSelected.delete(shopId);
    }
    setSelectedShops(newSelected);
  };

  const handleSearch = () => {
    setAppliedSearchForm({ ...searchForm });
    setAppliedStatusFilter(statusFilter);
    setPagination((prev: any) => ({ ...prev, page: 1 }));
  };

  const handleClearSearch = () => {
    setSearchForm({
      merchantId: '',
      shopName: '',
      email: '',
      phone: '',
      address: '',
    });
    setStatusFilter('all');
    setAppliedSearchForm({
      merchantId: '',
      shopName: '',
      email: '',
      phone: '',
      address: '',
    });
    setAppliedStatusFilter('all');
    setPagination((prev: any) => ({ ...prev, page: 1 }));
  };

  const handleStatusChange = async (shopId: string, newStatus: string) => {
    try {
      setIsExecuting(true);
      await apiClient.updateShopStatus(shopId, { status: newStatus });
      showSuccess('ステータスを更新しました');
      
      // データを再取得
      const queryParams = new URLSearchParams();
      queryParams.append('page', pagination.page.toString());
      queryParams.append('limit', pagination.limit.toString());
      
      if (appliedStatusFilter !== 'all') {
        queryParams.append('status', appliedStatusFilter);
      }
      if (appliedSearchForm.merchantId) {
        queryParams.append('merchantId', appliedSearchForm.merchantId);
      }
      
      const data = await apiClient.getShops(queryParams.toString());
      const response = data as StoreListResponse;
        setShops((response as any).shops || []);
      setPagination(response.pagination || pagination);
    } catch (err: unknown) {
      console.error('Failed to update shop status:', err);
      showError('ステータス更新に失敗しました');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleDeleteShop = async (shopId: string) => {
    if (!confirm('この店舗を削除しますか？')) return;
    
    try {
      setIsExecuting(true);
      await apiClient.deleteShop(shopId);
      showSuccess('店舗を削除しました');
      
      // データを再取得
      const queryParams = new URLSearchParams();
      queryParams.append('page', pagination.page.toString());
      queryParams.append('limit', pagination.limit.toString());
      
      if (appliedStatusFilter !== 'all') {
        queryParams.append('status', appliedStatusFilter);
      }
      if (appliedSearchForm.merchantId) {
        queryParams.append('merchantId', appliedSearchForm.merchantId);
      }
      
      const data = await apiClient.getShops(queryParams.toString());
      const response = data as StoreListResponse;
        setShops((response as any).shops || []);
      setPagination(response.pagination || pagination);
    } catch (err: unknown) {
      console.error('Failed to delete shop:', err);
      showError('店舗削除に失敗しました');
    } finally {
      setIsExecuting(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      active: '営業中',
      inactive: '休業中',
      suspended: '停止中',
    };
    return statusLabels[status] || status;
  };

  const getStatusBadgeClass = (status: string) => {
    const statusClasses: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">店舗管理</h1>
        <Link href="/shops/new">
          <Button variant="primary" size="md">
            新規店舗登録
          </Button>
        </Link>
      </div>

      {/* 検索フォーム */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">検索条件</h2>
          <button
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {isSearchExpanded ? '閉じる' : '詳細検索'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              加盟店ID
            </label>
            <input
              type="text"
              value={searchForm.merchantId}
              onChange={(e) => setSearchForm(prev => ({ ...prev, merchantId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="加盟店IDを入力"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              店舗名
            </label>
            <input
              type="text"
              value={searchForm.shopName}
              onChange={(e) => setSearchForm(prev => ({ ...prev, shopName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="店舗名を入力"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ステータス
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              <option value="active">営業中</option>
              <option value="inactive">休業中</option>
              <option value="suspended">停止中</option>
            </select>
          </div>
        </div>

        {isSearchExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                value={searchForm.email}
                onChange={(e) => setSearchForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="メールアドレスを入力"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号
              </label>
              <input
                type="tel"
                value={searchForm.phone}
                onChange={(e) => setSearchForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="電話番号を入力"
              />
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <Button variant="primary" onClick={handleSearch}>
            検索
          </Button>
          <Button variant="secondary" onClick={handleClearSearch}>
            クリア
          </Button>
        </div>
      </div>

      {/* 一括操作 */}
      {selectedShops.size > 0 && (
        <FloatingFooter
          selectedCount={selectedShops.size}
          onStatusChange={setSelectedStatus}
          onExecute={() => {
            // 一括ステータス更新の実装
            console.log('Bulk status update:', selectedStatus, selectedShops);
          }}
          onIssueAccount={() => {
            // アカウント発行の実装
            console.log('Issue account for:', selectedShops);
          }}
          selectedStatus={selectedStatus}
          isExecuting={isExecuting}
          isIssuingAccount={false}
        />
      )}

      {/* 店舗一覧 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              店舗一覧 ({pagination.total}件)
            </h2>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={isAllSelected}
                indeterminate={isIndeterminate}
                onChange={handleSelectAll}
              />
              <span className="text-sm text-gray-600">すべて選択</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="px-6 py-4 bg-red-50 border-b border-red-200">
            <div className="text-red-600">{error}</div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  選択
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  店舗名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  加盟店
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  連絡先
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  住所
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作成日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shops.map((shop) => (
                <tr key={shop.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Checkbox
                      checked={selectedShops.has(shop.id)}
                      onChange={(checked) => handleSelectShop(shop.id, checked)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{shop.name}</div>
                      {shop.nameKana && (
                        <div className="text-sm text-gray-500">{shop.nameKana}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{shop.merchant.name}</div>
                      <div className="text-sm text-gray-500">{shop.merchant.account.displayName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{shop.email}</div>
                      <div className="text-sm text-gray-500">{shop.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {shop.postalCode && <div>〒{shop.postalCode}</div>}
                      <div>{shop.address}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(shop.status)}`}>
                      {getStatusLabel(shop.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(shop.createdAt).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link href={`/shops/${shop.id}`}>
                        <Button variant="secondary" size="sm">
                          詳細
                        </Button>
                      </Link>
                      <Link href={`/shops/${shop.id}/edit`}>
                        <Button variant="secondary" size="sm">
                          編集
                        </Button>
                      </Link>
                      <select
                        value={shop.status}
                        onChange={(e) => handleStatusChange(shop.id, e.target.value)}
                        className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isExecuting}
                      >
                        <option value="active">営業中</option>
                        <option value="inactive">休業中</option>
                        <option value="suspended">停止中</option>
                      </select>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDeleteShop(shop.id)}
                        disabled={isExecuting}
                      >
                        削除
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ページネーション */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                {pagination.total}件中 {((pagination.page - 1) * pagination.limit) + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)}件を表示
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPagination((prev: any) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1}
                >
                  前へ
                </Button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPagination((prev: any) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  次へ
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
