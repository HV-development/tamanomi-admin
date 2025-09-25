'use client';

import React from 'react';
import Button from '@/atoms/Button';
import Icon from '@/atoms/Icon';

interface FloatingFooterProps {
  selectedCount: number;
  onStatusChange: (status: string) => void;
  onExecute: () => void;
  onIssueAccount: () => void;
  selectedStatus: string;
  isExecuting?: boolean;
  isIssuingAccount?: boolean;
}

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

export default function FloatingFooter({
  selectedCount,
  onStatusChange,
  onExecute,
  onIssueAccount,
  selectedStatus,
  isExecuting = false,
  isIssuingAccount = false
}: FloatingFooterProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              {selectedCount}件選択中
            </span>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                ステータス変更:
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => onStatusChange(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={onExecute}
              disabled={isExecuting}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-medium rounded-lg flex items-center space-x-2"
            >
              {isExecuting ? (
                <>
                  <Icon name="info" size="sm" className="animate-spin" />
                  <span>実行中...</span>
                </>
              ) : (
                <>
                  <Icon name="check" size="sm" />
                  <span>実行</span>
                </>
              )}
            </Button>

            <Button
              onClick={onIssueAccount}
              disabled={isIssuingAccount}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium rounded-lg flex items-center space-x-2"
            >
              {isIssuingAccount ? (
                <>
                  <Icon name="info" size="sm" className="animate-spin" />
                  <span>発行中...</span>
                </>
              ) : (
                <>
                  <Icon name="users" size="sm" />
                  <span>アカウント発行</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
