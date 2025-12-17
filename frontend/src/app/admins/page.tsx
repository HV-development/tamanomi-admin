'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminLayout from '@/components/templates/admin-layout';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Pagination from '@/components/molecules/Pagination';
import { type Admin, type AdminSearchForm } from '@hv-development/schemas';
import { apiClient } from '@/lib/api';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export default function AdminsPage() {
  const [searchForm, setSearchForm] = useState<AdminSearchForm>({
    accountId: '',
    name: '',
    email: '',
    role: '',
  });
  const lastFetchKeyRef = useRef<string | null>(null);
  const [appliedSearchForm, setAppliedSearchForm] = useState<AdminSearchForm>({
    accountId: '',
    name: '',
    email: '',
    role: '',
  });
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // データ取得
  const fetchAdmins = useCallback(async (searchParams?: AdminSearchForm) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.getAdminAccounts({
        ...searchParams,
        page: pagination.page,
        limit: pagination.limit,
      });
      
      const responseData = response as { 
        accounts?: Admin[]; 
        pagination?: { page: number; limit: number; total: number; pages: number } 
      };
      
      const adminData = responseData.accounts || [];
      const paginationData = responseData.pagination || { page: 1, limit: 10, total: 0, pages: 0 };
      
      setAdmins(adminData);
      setPagination(paginationData);
    } catch (err) {
      console.error('管理者データの取得に失敗しました:', err);
      setError('管理者データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  // データ取得（検索条件変更またはページ変更の場合に実行）
  useEffect(() => {
    const key = JSON.stringify({
      search: appliedSearchForm,
      page: pagination.page,
      limit: pagination.limit,
    });

    if (lastFetchKeyRef.current === key) {
      return;
    }

    lastFetchKeyRef.current = key;

    fetchAdmins(appliedSearchForm);
  }, [appliedSearchForm, pagination.page, pagination.limit, fetchAdmins]);

  // ページ変更ハンドラー
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleInputChange = (field: keyof typeof searchForm, value: string) => {
    setSearchForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    // 検索フォームの内容を適用済み検索フォームにコピーして検索実行
    setAppliedSearchForm({ ...searchForm });
    // ページを1にリセット
    setPagination(prev => ({ ...prev, page: 1 }));
    console.log('検索実行:', searchForm);
  };

  const handleClear = () => {
    setSearchForm({
      accountId: '',
      name: '',
      email: '',
      role: '',
    });
    setAppliedSearchForm({
      accountId: '',
      name: '',
      email: '',
      role: '',
    });
    // ページを1にリセット
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const _getRoleLabel = (role: string) => {
    switch (role) {
      case 'sysadmin':
        return '管理者';
      case 'operator':
        return '一般';
      default:
        return '一般';
    }
  };

  const handleDelete = async (adminId: string, adminEmail: string) => {
    if (!adminId) return;
    if (!confirm(`${adminEmail}のアカウントを削除しますか？`)) return;
    try {
      await apiClient.deleteAdminAccount(adminId);
      // 手動で再取得
      fetchAdmins(appliedSearchForm);
      alert('管理者アカウントを削除しました');
    } catch (error: unknown) {
      console.error('管理者アカウントの削除に失敗しました:', error);
      alert('管理者アカウントの削除に失敗しました。もう一度お試しください。');
    }
  };

  // エラー状態
  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Icon name="admin" size="lg" className="mx-auto text-red-400 mb-4" />
            <p className="text-red-500 mb-4">{error}</p>
            <Button variant="outline" onClick={() => fetchAdmins()}>
              再試行
            </Button>
          </div>
        </div>
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
            <h1 className="text-2xl font-bold text-gray-900">管理者アカウント</h1>
            <p className="text-gray-600">
              管理者アカウントの管理・編集を行います
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

            {/* 氏名 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                氏名
              </label>
              <input
                type="text"
                id="name"
                placeholder="氏名を入力"
                value={searchForm.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* メールアドレス */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                placeholder="メールアドレスを入力"
                value={searchForm.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* 権限 */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                権限
              </label>
              <select
                id="role"
                value={searchForm.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">すべて</option>
                <option value="sysadmin">管理者</option>
                <option value="operator">一般</option>
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
        {/* ページネーション */}
        {pagination.pages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={handlePageChange}
          />
        )}

        {/* アカウント一覧 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              アカウント一覧 ({pagination.total}件)
            </h3>
            <Link href="/admins/new">
              <Button variant="outline" className="bg-white text-green-600 border-green-600 hover:bg-green-50">
                <span className="mr-2">+</span>
                新規登録
              </Button>
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            {/* ローディング状態 - テーブル内のみ */}
            {isLoading && admins.length > 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">読み込み中...</p>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      アクション
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      氏名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      メールアドレス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      権限
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {admins.map((admin, index) => (
                    <tr key={admin.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap w-48">
                        <div className="flex items-center gap-2">
                          <Link href={`/admins/${admin.id}/edit`}>
                            <button 
                              className="p-2 text-green-600 hover:text-green-800 rounded-lg transition-colors cursor-pointer flex items-center justify-center min-w-[44px] min-h-[44px]"
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
                          <button 
                            onClick={() => handleDelete(admin.id, admin.email)}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center min-w-[44px] min-h-[44px] group"
                            title="削除"
                          >
                            <Image 
                              src="/dustbox.png" 
                              alt="削除" 
                              width={24}
                              height={24}
                              className="w-6 h-6 flex-shrink-0 object-contain"
                            />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{admin.lastName} {admin.firstName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{admin.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{_getRoleLabel(admin.role.toString())}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {isLoading && admins.length === 0 && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-500">データを読み込み中...</p>
            </div>
          )}

          {!isLoading && admins.length === 0 && (
            <div className="text-center py-12">
              <Icon name="admin" size="lg" className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">管理者アカウントが見つかりません</h3>
              <p className="text-gray-500">検索条件を変更してお試しください。</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
