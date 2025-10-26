'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';

interface Merchant {
  id: string;
  name: string;
  account: {
    email: string;
  };
}

interface MerchantSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (merchant: Merchant) => void;
  selectedMerchantId?: string;
}

export default function MerchantSelectModal({
  isOpen,
  onClose,
  onSelect,
  selectedMerchantId,
}: MerchantSelectModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Merchant[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // 検索実行（API経由）
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    
    try {
      setIsSearching(true);
      const response = await apiClient.getMerchants({ 
        search: searchQuery,
        limit: 100 // 検索結果の上限
      });
      
      console.log('🔍 Search response:', response);
      
      // レスポンスの形式を確認して適切に処理
      let merchants: Merchant[] = [];
      if (response && typeof response === 'object') {
        if ('data' in response && response.data && typeof response.data === 'object' && 'merchants' in response.data) {
          merchants = (response.data as { merchants: Merchant[] }).merchants || [];
        } else if ('merchants' in response) {
          merchants = (response as { merchants: Merchant[] }).merchants || [];
        } else if (Array.isArray(response)) {
          merchants = response as Merchant[];
        }
      }
      
      console.log('🔍 Processed merchants:', merchants.length);
      setSearchResults(merchants);
      setHasSearched(true);
    } catch (error) {
      console.error('❌ Search error:', error);
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (merchant: Merchant) => {
    onSelect(merchant);
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    onClose();
  };

  // Enterキーで検索
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* オーバーレイ（透明） */}
      <div 
        className="fixed inset-0"
        onClick={handleClose}
      />
      
      {/* モーダルコンテンツ */}
      <div className="relative bg-white rounded-lg shadow-2xl border border-gray-300 max-w-2xl w-full max-h-[80vh] flex flex-col animate-fadeIn">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 bg-green-600 rounded-t-lg">
          <h2 className="text-lg font-semibold text-white">事業者選択</h2>
          <button
            onClick={handleClose}
            className="text-white hover:text-green-100 focus:outline-none"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 検索ボックス */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="事業者名またはメールアドレスで検索..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              autoFocus
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              title="検索"
            >
              {isSearching ? (
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* 事業者リスト */}
        <div className="flex-1 overflow-y-auto p-6">
          {!hasSearched ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p>事業者名またはメールアドレスで検索してください</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>検索結果が見つかりませんでした</p>
            </div>
          ) : (
            <div className="space-y-2">
              {searchResults.map((merchant) => (
                <button
                  key={merchant.id}
                  onClick={() => handleSelect(merchant)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    selectedMerchantId === merchant.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{merchant.name}</div>
                      <div className="text-sm text-gray-500 mt-1">{merchant.account.email}</div>
                    </div>
                    {selectedMerchantId === merchant.id && (
                      <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-white border-2 border-green-600 text-green-600 text-sm rounded-md hover:bg-green-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}

