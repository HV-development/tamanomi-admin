'use client';

import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';

interface QRCodeGeneratorProps {
  qrCodeLoading: boolean;
  qrCodeUrl: string;
  shopId: string;
  showSuccess: (message: string) => void;
}

export default function QRCodeGenerator({ qrCodeLoading, qrCodeUrl, shopId, showSuccess }: QRCodeGeneratorProps) {
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!qrCodeUrl || !qrCodeRef.current) return;

    const canvas = qrCodeRef.current.querySelector('canvas');
    if (!canvas) return;

    try {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `shop-${shopId}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSuccess('QRコードをダウンロードしました');
    } catch (error) {
      console.error('QRコードのダウンロードに失敗しました:', error);
      showSuccess('QRコードのダウンロードに失敗しました');
    }
  };

  const handleCopyImage = async () => {
    if (!qrCodeUrl || !qrCodeRef.current) return;

    const canvas = qrCodeRef.current.querySelector('canvas');
    if (!canvas) return;

    try {
      // CanvasをBlobに変換
      canvas.toBlob(async (blob) => {
        if (!blob) {
          showSuccess('QRコードのコピーに失敗しました');
          return;
        }

        try {
          // クリップボードに画像をコピー
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
            }),
          ]);
          showSuccess('QRコードをクリップボードにコピーしました');
        } catch (error) {
          console.error('QRコードのコピーに失敗しました:', error);
          showSuccess('QRコードのコピーに失敗しました');
        }
      }, 'image/png');
    } catch (error) {
      console.error('QRコードのコピーに失敗しました:', error);
      showSuccess('QRコードのコピーに失敗しました');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">店舗QRコード</h3>
      {qrCodeLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">QRコードを読み込み中...</span>
        </div>
      ) : qrCodeUrl ? (
        <div className="space-y-4">
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg border-2 border-gray-300 inline-block" ref={qrCodeRef}>
              <QRCodeCanvas
                value={qrCodeUrl}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>
          <div className="flex justify-center space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (qrCodeUrl) {
                  navigator.clipboard.writeText(qrCodeUrl);
                  showSuccess('URLをクリップボードにコピーしました');
                }
              }}
            >
              <Icon name="link" size="sm" className="mr-2" />
              URLをコピー
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyImage}
            >
              <Icon name="content-copy" size="sm" className="mr-2" />
              QRコードをコピー
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleDownload}
            >
              <Icon name="download" size="sm" className="mr-2" />
              QRコードをダウンロード
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-4">QRコードの取得に失敗しました</div>
      )}
    </div>
  );
}