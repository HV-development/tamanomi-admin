'use client';

import React, { useState } from 'react';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import BulkUpdateConfirmModal from '@/components/molecules/bulk-update-confirm-modal';

interface CouponBulkUpdateFooterProps {
  selectedCount: number;
  isAdminAccount: boolean;
  isMerchantAccount: boolean;
  onBulkUpdateStatus?: (status: string) => void;
  onBulkUpdatePublicStatus?: (isPublic: boolean) => void;
  isUpdating?: boolean;
}

export default function CouponBulkUpdateFooter({
  selectedCount,
  isAdminAccount,
  isMerchantAccount,
  onBulkUpdateStatus,
  onBulkUpdatePublicStatus,
  isUpdating = false
}: CouponBulkUpdateFooterProps) {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPublicStatusModal, setShowPublicStatusModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [pendingPublicStatus, setPendingPublicStatus] = useState<boolean | null>(null);

  if (selectedCount === 0) {
    return null;
  }

  const handleStatusChange = (status: string) => {
    setPendingStatus(status);
    setShowStatusModal(true);
  };

  const handlePublicStatusChange = (isPublic: boolean) => {
    setPendingPublicStatus(isPublic);
    setShowPublicStatusModal(true);
  };

  const confirmStatusUpdate = async () => {
    if (pendingStatus && onBulkUpdateStatus) {
      await onBulkUpdateStatus(pendingStatus);
    }
    setShowStatusModal(false);
    setPendingStatus(null);
  };

  const confirmPublicStatusUpdate = async () => {
    if (pendingPublicStatus !== null && onBulkUpdatePublicStatus) {
      await onBulkUpdatePublicStatus(pendingPublicStatus);
    }
    setShowPublicStatusModal(false);
    setPendingPublicStatus(null);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              {selectedCount}件選択中
            </span>

            {isAdminAccount && (
              <>
                <Button
                  onClick={() => handleStatusChange('pending')}
                  disabled={isUpdating}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 text-sm font-medium rounded-lg"
                >
                  申請中にする
                </Button>
                <Button
                  onClick={() => handleStatusChange('approved')}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-medium rounded-lg"
                >
                  承認済みにする
                </Button>
                <Button
                  onClick={() => handleStatusChange('suspended')}
                  disabled={isUpdating}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium rounded-lg"
                >
                  停止中にする
                </Button>
              </>
            )}

            {(isAdminAccount || isMerchantAccount) && (
              <>
                <Button
                  onClick={() => handlePublicStatusChange(true)}
                  disabled={isUpdating}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium rounded-lg"
                >
                  公開中にする
                </Button>
                <Button
                  onClick={() => handlePublicStatusChange(false)}
                  disabled={isUpdating}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 text-sm font-medium rounded-lg"
                >
                  非公開にする
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <BulkUpdateConfirmModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setPendingStatus(null);
        }}
        onConfirm={confirmStatusUpdate}
        selectedCount={selectedCount}
        title="承認ステータスの一括変更"
        message={
          pendingStatus === 'pending' ? '選択中のクーポンを「申請中」に変更しますか？' :
          pendingStatus === 'approved' ? '選択中のクーポンを「承認済み」に変更しますか？' :
          '選択中のクーポンを「停止中」に変更しますか？'
        }
      />

      <BulkUpdateConfirmModal
        isOpen={showPublicStatusModal}
        onClose={() => {
          setShowPublicStatusModal(false);
          setPendingPublicStatus(null);
        }}
        onConfirm={confirmPublicStatusUpdate}
        selectedCount={selectedCount}
        title="公開ステータスの一括変更"
        message={
          pendingPublicStatus ? '選択中のクーポンを「公開中」に変更しますか？' : '選択中のクーポンを「非公開」に変更しますか？'
        }
      />
    </>
  );
}

