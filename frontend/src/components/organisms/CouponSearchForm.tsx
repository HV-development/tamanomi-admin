'use client';

import React from 'react';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import type { CouponStatus } from '@hv-development/schemas';

export interface CouponSearchFormData {
  couponId: string;
  couponName: string;
}

interface CouponSearchFormProps {
  searchForm: CouponSearchFormData;
  statusFilter: 'all' | CouponStatus;
  isSearchExpanded: boolean;
  onInputChange: (field: keyof CouponSearchFormData, value: string) => void;
  onStatusFilterChange: (value: 'all' | CouponStatus) => void;
  onSearch: () => void;
  onClear: () => void;
  onToggleExpand: () => void;
}

export default function CouponSearchForm({
  searchForm,
  statusFilter,
  isSearchExpanded,
  onInputChange,
  onStatusFilterChange,
  onSearch,
  onClear,
  onToggleExpand,
}: CouponSearchFormProps) {
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
          <Icon name={isSearchExpanded ? 'chevronUp' : 'chevronDown'} size="sm" />
        </Button>
      </div>

      {isSearchExpanded && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* クーポンID */}
            <div>
              <label htmlFor="couponId" className="block text-sm font-medium text-gray-700 mb-2">
                クーポンID
              </label>
              <input
                type="text"
                id="couponId"
                placeholder="クーポンIDを入力"
                value={searchForm.couponId}
                onChange={(e) => onInputChange('couponId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* クーポン名 */}
            <div>
              <label htmlFor="couponName" className="block text-sm font-medium text-gray-700 mb-2">
                クーポン名
              </label>
              <input
                type="text"
                id="couponName"
                placeholder="クーポン名を入力"
                value={searchForm.couponName}
                onChange={(e) => onInputChange('couponName', e.target.value)}
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
                onChange={(e) => onStatusFilterChange(e.target.value as 'all' | CouponStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">すべて</option>
                <option value="active">有効</option>
                <option value="inactive">無効</option>
                <option value="expired">期限切れ</option>
              </select>
            </div>
          </div>

          {/* 検索・クリアボタン */}
          <div className="flex justify-end gap-2 mt-6">
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

