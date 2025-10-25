'use client';

import React from 'react';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';

interface FloatingFooterProps {
  selectedCount: number;
  onIssueAccount: () => void;
  isIssuingAccount?: boolean;
}


export default function FloatingFooter({
  selectedCount,
  onIssueAccount,
  isIssuingAccount = false
}: FloatingFooterProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center space-x-12">
          <span className="text-sm font-medium text-gray-700">
            {selectedCount}件選択中
          </span>

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
  );
}
