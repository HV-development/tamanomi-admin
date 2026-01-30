'use client';

import React from 'react';
import Button from '@/components/atoms/Button';
import { statusOptions } from '@/lib/constants/shop';

export interface ShopSearchFormData {
  keyword: string;
  merchantName: string;
  merchantNameKana: string;
  name: string;
  nameKana: string;
  phone: string;
  accountEmail: string;
  postalCode: string;
  prefecture: string;
  fulladdress: string;
  status: string;
  createdFrom: string;
  createdTo: string;
  updatedFrom: string;
  updatedTo: string;
}

export interface ShopSearchErrors {
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
}

interface ShopSearchFormProps {
  searchForm: ShopSearchFormData;
  searchErrors: ShopSearchErrors;
  isSearchExpanded: boolean;
  merchantId?: string;
  onInputChange: (field: keyof ShopSearchFormData, value: string) => void;
  onSearch: () => void;
  onClear: () => void;
  onToggleExpand: () => void;
}

function ShopSearchForm({
  searchForm,
  searchErrors,
  isSearchExpanded,
  merchantId,
  onInputChange,
  onSearch,
  onClear,
  onToggleExpand,
}: ShopSearchFormProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="pb-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">検索条件</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleExpand}
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
      <div className="p-6 space-y-4">
        {/* フリーワード検索 */}
        <div>
          <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-2">
            フリーワード検索
          </label>
          <input
            type="text"
            id="keyword"
            placeholder="店舗名、住所、電話番号などで検索（2文字以上）"
            value={searchForm.keyword}
            onChange={(e) => onInputChange('keyword', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        
        {/* 事業者名と事業者名（カナ） */}
        {!merchantId && (
          <div className="flex gap-4" style={{ marginTop: '16px' }}>
            <div className="flex-1">
              <label htmlFor="merchantName" className="block text-sm font-medium text-gray-700 mb-2">
                事業者名
              </label>
              <input
                type="text"
                id="merchantName"
                placeholder="事業者名を入力"
                value={searchForm.merchantName}
                onChange={(e) => onInputChange('merchantName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="merchantNameKana" className="block text-sm font-medium text-gray-700 mb-2">
                事業者名（カナ）
              </label>
              <input
                type="text"
                id="merchantNameKana"
                placeholder="事業者名（カナ）を入力"
                value={searchForm.merchantNameKana}
                onChange={(e) => onInputChange('merchantNameKana', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        )}

        {/* 店舗名と店舗名（カナ） */}
        <div className="flex gap-4" style={{ marginTop: '16px' }}>
          <div className="flex-1">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              店舗名
            </label>
            <input
              type="text"
              id="name"
              placeholder="店舗名を入力"
              value={searchForm.name}
              onChange={(e) => onInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="nameKana" className="block text-sm font-medium text-gray-700 mb-2">
              店舗名（カナ）
            </label>
            <input
              type="text"
              id="nameKana"
              placeholder="店舗名（カナ）を入力"
              value={searchForm.nameKana}
              onChange={(e) => onInputChange('nameKana', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* 電話番号とメールアドレス */}
        <div className="flex gap-4" style={{ marginTop: '16px' }}>
          <div className="flex-shrink-0">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              電話番号
            </label>
            <input
              type="text"
              id="phone"
              placeholder="電話番号を入力"
              value={searchForm.phone}
              onChange={(e) => onInputChange('phone', e.target.value)}
              className="w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="accountEmail" className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <input
              type="text"
              id="accountEmail"
              placeholder="メールアドレスを入力"
              value={searchForm.accountEmail}
              onChange={(e) => onInputChange('accountEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* 郵便番号、都道府県、住所 */}
        <div className="flex gap-4" style={{ marginTop: '16px' }}>
          <div className="flex-shrink-0">
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
              郵便番号
            </label>
            <input
              type="text"
              id="postalCode"
              placeholder="郵便番号を入力"
              value={searchForm.postalCode}
              onChange={(e) => onInputChange('postalCode', e.target.value)}
              className="w-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="flex-shrink-0">
            <label htmlFor="prefecture" className="block text-sm font-medium text-gray-700 mb-2">
              都道府県
            </label>
            <input
              type="text"
              id="prefecture"
              placeholder="都道府県を入力"
              value={searchForm.prefecture}
              onChange={(e) => onInputChange('prefecture', e.target.value)}
              className="w-[150px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="fulladdress" className="block text-sm font-medium text-gray-700 mb-2">
              住所
            </label>
            <input
              type="text"
              id="fulladdress"
              placeholder="住所を入力"
              value={searchForm.fulladdress}
              onChange={(e) => onInputChange('fulladdress', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* 承認ステータス */}
        <div className="max-w-[200px]" style={{ marginTop: '16px' }}>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            承認ステータス
          </label>
          <select
            id="status"
            value={searchForm.status}
            onChange={(e) => onInputChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="all">すべて</option>
            {statusOptions?.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* 登録日・更新日の範囲 */}
        <div className="flex gap-4" style={{ marginTop: '16px' }}>
          <div>
            <label htmlFor="createdFrom" className="block text-sm font-medium text-gray-700 mb-2">
              登録日（開始）
            </label>
            <input
              type="date"
              id="createdFrom"
              value={searchForm.createdFrom}
              onChange={(e) => onInputChange('createdFrom', e.target.value)}
              className="w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            {searchErrors.createdFrom && (
              <p className="text-red-600 text-sm mt-1">{searchErrors.createdFrom}</p>
            )}
          </div>
          <div>
            <label htmlFor="createdTo" className="block text-sm font-medium text-gray-700 mb-2">
              登録日（終了）
            </label>
            <input
              type="date"
              id="createdTo"
              value={searchForm.createdTo}
              onChange={(e) => onInputChange('createdTo', e.target.value)}
              className="w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            {searchErrors.createdTo && (
              <p className="text-red-600 text-sm mt-1">{searchErrors.createdTo}</p>
            )}
          </div>
          <div>
            <label htmlFor="updatedFrom" className="block text-sm font-medium text-gray-700 mb-2">
              更新日（開始）
            </label>
            <input
              type="date"
              id="updatedFrom"
              value={searchForm.updatedFrom}
              onChange={(e) => onInputChange('updatedFrom', e.target.value)}
              className="w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            {searchErrors.updatedFrom && (
              <p className="text-red-600 text-sm mt-1">{searchErrors.updatedFrom}</p>
            )}
          </div>
          <div>
            <label htmlFor="updatedTo" className="block text-sm font-medium text-gray-700 mb-2">
              更新日（終了）
            </label>
            <input
              type="date"
              id="updatedTo"
              value={searchForm.updatedTo}
              onChange={(e) => onInputChange('updatedTo', e.target.value)}
              className="w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            {searchErrors.updatedTo && (
              <p className="text-red-600 text-sm mt-1">{searchErrors.updatedTo}</p>
            )}
          </div>
        </div>

        {/* 検索・クリアボタン */}
        <div className="flex justify-center gap-2 mt-6">
          <Button variant="outline" onClick={onClear}>
            クリア
          </Button>
          <Button variant="primary" onClick={onSearch}>
            検索
          </Button>
        </div>
      </div>
      )}
    </div>
  );
}

export default React.memo(ShopSearchForm);

