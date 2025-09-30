'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/templates/DashboardLayout';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';

interface MerchantFormData {
  name: string;
  nameKana: string;
  representative: string;
  representativeName: string;
  representativePhone: string;
  email: string;
  phone: string;
  postalCode: string;
  address: string;
  status: 'pending' | 'active' | 'inactive' | 'suspended';
}

export default function MerchantEditConfirmation() {
  const params = useParams();
  const searchParams = useSearchParams();
  const merchantId = params.id as string;
  
  const [formData, setFormData] = useState<MerchantFormData>({
    name: '',
    nameKana: '',
    representative: '',
    representativeName: '',
    representativePhone: '',
    email: '',
    phone: '',
    postalCode: '',
    address: '',
    status: 'pending',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // URLパラメータからデータを取得
  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(data));
        setFormData(parsedData);
      } catch (error) {
        console.error('データの解析エラー:', error);
      }
    }
  }, [searchParams]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // API呼び出しをシミュレート
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('事業者更新データ:', formData);
      
      // 成功時の処理（実際の実装では適切なページにリダイレクト）
      alert('事業者の更新が完了しました。');
      
    } catch (error) {
      console.error('更新エラー:', error);
      alert('更新中にエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const _handleBack = () => {
    // 前のページに戻る際にデータを保持
    const data = encodeURIComponent(JSON.stringify(formData));
    window.history.back();
  };

  const _getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '審査中';
      case 'active': return '営業中';
      case 'inactive': return '休業中';
      case 'suspended': return '停止中';
      default: return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">事業者編集確認</h1>
              <p className="text-gray-600">
                事業者ID: {merchantId}
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

        {/* 確認フォーム */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-6">変更内容確認</h3>
          
          <div className="space-y-6">
            {/* 基本情報 */}
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-4 border-b border-gray-200 pb-2">基本情報</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    事業者名
                  </label>
                  <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {formData.name}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    事業者名（カナ）
                  </label>
                  <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {formData.nameKana}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    代表者
                  </label>
                  <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {formData.representative}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    代表者名
                  </label>
                  <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {formData.representativeName}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    代表者電話番号
                  </label>
                  <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {formData.representativePhone}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス
                  </label>
                  <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {formData.email}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    電話番号
                  </label>
                  <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {formData.phone}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    郵便番号
                  </label>
                  <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {formData.postalCode}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ステータス
                  </label>
                  <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {_getStatusLabel(formData.status)}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    住所
                  </label>
                  <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {formData.address}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={_handleBack}
          >
            戻る
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? '更新中...' : '更新'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
