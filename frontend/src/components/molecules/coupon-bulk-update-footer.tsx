'use client';

import React, { useState } from 'react';
import Button from '@/components/atoms/Button';
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
  const [pendingStatus, setPendingStatus] = useState<string>('');
  const [pendingPublicStatus, setPendingPublicStatus] = useState<string>('');

  if (selectedCount === 0) {
    return null;
  }

  const handleStatusChange = () => {
    if (pendingStatus) {
      setShowStatusModal(true);
    }
  };

  const handlePublicStatusChange = () => {
    if (pendingPublicStatus) {
      setShowPublicStatusModal(true);
    }
  };

  const confirmStatusUpdate = async () => {
    if (pendingStatus && onBulkUpdateStatus) {
      await onBulkUpdateStatus(pendingStatus);
    }
    setShowStatusModal(false);
    setPendingStatus('');
  };

  const confirmPublicStatusUpdate = async () => {
    if (pendingPublicStatus && onBulkUpdatePublicStatus) {
      await onBulkUpdatePublicStatus(pendingPublicStatus === 'true');
    }
    setShowPublicStatusModal(false);
    setPendingPublicStatus('');
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '申請中';
      case 'approved':
        return '承認済み';
      case 'suspended':
        return '停止中';
      default:
        return '';
    }
  };

  const getPublicStatusLabel = (isPublic: string) => {
    return isPublic === 'true' ? '公開中' : isPublic === 'false' ? '非公開' : '';
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-6">
            <span className="text-sm font-medium text-gray-700">
              {selectedCount}件選択中
            </span>

            {isAdminAccount && (
              <div className="flex items-center space-x-2">
                <select
                  value={pendingStatus}
                  onChange={(e) => setPendingStatus(e.target.value)}
                  disabled={isUpdating}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">承認ステータスを選択</option>
                  <option value="pending">申請中</option>
                  <option value="approved">承認済み</option>
                  <option value="suspended">停止中</option>
                </select>
                <Button
                  onClick={handleStatusChange}
                  disabled={isUpdating || !pendingStatus}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  更新
                </Button>
              </div>
            )}

            {(isAdminAccount || isMerchantAccount) && (
              <div className="flex items-center space-x-2">
                <select
                  value={pendingPublicStatus}
                  onChange={(e) => setPendingPublicStatus(e.target.value)}
                  disabled={isUpdating}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">公開ステータスを選択</option>
                  <option value="true">公開中</option>
                  <option value="false">非公開</option>
                </select>
                <Button
                  onClick={handlePublicStatusChange}
                  disabled={isUpdating || !pendingPublicStatus}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  更新
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <BulkUpdateConfirmModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setPendingStatus('');
        }}
        onConfirm={confirmStatusUpdate}
        selectedCount={selectedCount}
        title="承認ステータスの一括変更"
        message={`選択中の${selectedCount}件のクーポンを「${getStatusLabel(pendingStatus)}」に変更しますか？`}
      />

      <BulkUpdateConfirmModal
        isOpen={showPublicStatusModal}
        onClose={() => {
          setShowPublicStatusModal(false);
          setPendingPublicStatus('');
        }}
        onConfirm={confirmPublicStatusUpdate}
        selectedCount={selectedCount}
        title="公開ステータスの一括変更"
        message={`選択中の${selectedCount}件のクーポンを「${getPublicStatusLabel(pendingPublicStatus)}」に変更しますか？`}
      />
    </>
  );
}

