'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/templates/DashboardLayout';
import Button from '@/atoms/Button';
import Icon from '@/atoms/Icon';
import { 
  validateRequired, 
  validateMaxLength, 
  validatePostalCode, 
  validatePhone, 
  validateEmail
} from '@/utils/validation';

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

export default function MerchantEdit() {
  const params = useParams();
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

  const [errors, setErrors] = useState<Partial<MerchantFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 事業者データの読み込み
  useEffect(() => {
    const loadMerchantData = async () => {
      try {
        // 実際の実装ではAPIからデータを取得
        // const response = await fetch(`/api/merchants/${merchantId}`);
        // const merchantData = await response.json();
        
        // サンプルデータ
        const sampleData: MerchantFormData = {
          name: '株式会社たまのみ',
          nameKana: 'カブシキガイシャタマノミ',
          representative: '代表取締役',
          representativeName: '田中太郎',
          representativePhone: '03-1234-5678',
          email: 'info@tamanomi.co.jp',
          phone: '03-1234-5679',
          postalCode: '100-0001',
          address: '東京都千代田区千代田1-1-1',
          status: 'active',
        };
        
        setFormData(sampleData);
      } catch (error) {
        console.error('事業者データの読み込みエラー:', error);
        alert('事業者データの読み込みに失敗しました。');
      } finally {
        setIsLoading(false);
      }
    };

    if (merchantId) {
      loadMerchantData();
    }
  }, [merchantId]);

  const handleInputChange = (field: keyof MerchantFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<MerchantFormData> = {};

    // 事業者名
    const nameError = validateRequired(formData.name, '事業者名') || validateMaxLength(formData.name, 100, '事業者名');
    if (nameError) {
      newErrors.name = nameError;
    }

    // 事業者名（カナ）
    const nameKanaError = validateRequired(formData.nameKana, '事業者名（カナ）') || validateMaxLength(formData.nameKana, 100, '事業者名（カナ）');
    if (nameKanaError) {
      newErrors.nameKana = nameKanaError;
    }

    // 代表者
    const representativeError = validateRequired(formData.representative, '代表者') || validateMaxLength(formData.representative, 50, '代表者');
    if (representativeError) {
      newErrors.representative = representativeError;
    }

    // 代表者名
    const representativeNameError = validateRequired(formData.representativeName, '代表者名') || validateMaxLength(formData.representativeName, 50, '代表者名');
    if (representativeNameError) {
      newErrors.representativeName = representativeNameError;
    }

    // 代表者電話番号
    const representativePhoneError = validateRequired(formData.representativePhone, '代表者電話番号') || validatePhone(formData.representativePhone);
    if (representativePhoneError) {
      newErrors.representativePhone = representativePhoneError;
    }

    // メールアドレス
    const emailError = validateRequired(formData.email, 'メールアドレス') || validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    // 電話番号
    const phoneError = validateRequired(formData.phone, '電話番号') || validatePhone(formData.phone);
    if (phoneError) {
      newErrors.phone = phoneError;
    }

    // 郵便番号
    const postalCodeError = validateRequired(formData.postalCode, '郵便番号') || validatePostalCode(formData.postalCode);
    if (postalCodeError) {
      newErrors.postalCode = postalCodeError;
    }

    // 住所
    const addressError = validateRequired(formData.address, '住所') || validateMaxLength(formData.address, 200, '住所');
    if (addressError) {
      newErrors.address = addressError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">事業者編集</h1>
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

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-6">基本情報</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 事業者名 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  事業者名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="事業者名を入力"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* 事業者名（カナ） */}
              <div>
                <label htmlFor="nameKana" className="block text-sm font-medium text-gray-700 mb-2">
                  事業者名（カナ） <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nameKana"
                  value={formData.nameKana}
                  onChange={(e) => handleInputChange('nameKana', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.nameKana ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="事業者名（カナ）を入力"
                />
                {errors.nameKana && (
                  <p className="mt-1 text-sm text-red-600">{errors.nameKana}</p>
                )}
              </div>

              {/* 代表者 */}
              <div>
                <label htmlFor="representative" className="block text-sm font-medium text-gray-700 mb-2">
                  代表者 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="representative"
                  value={formData.representative}
                  onChange={(e) => handleInputChange('representative', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.representative ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="代表者を入力"
                />
                {errors.representative && (
                  <p className="mt-1 text-sm text-red-600">{errors.representative}</p>
                )}
              </div>

              {/* 代表者名 */}
              <div>
                <label htmlFor="representativeName" className="block text-sm font-medium text-gray-700 mb-2">
                  代表者名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="representativeName"
                  value={formData.representativeName}
                  onChange={(e) => handleInputChange('representativeName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.representativeName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="代表者名を入力"
                />
                {errors.representativeName && (
                  <p className="mt-1 text-sm text-red-600">{errors.representativeName}</p>
                )}
              </div>

              {/* 代表者電話番号 */}
              <div>
                <label htmlFor="representativePhone" className="block text-sm font-medium text-gray-700 mb-2">
                  代表者電話番号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="representativePhone"
                  value={formData.representativePhone}
                  onChange={(e) => handleInputChange('representativePhone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.representativePhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="代表者電話番号を入力"
                />
                {errors.representativePhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.representativePhone}</p>
                )}
              </div>

              {/* メールアドレス */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="メールアドレスを入力"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* 電話番号 */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  電話番号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="電話番号を入力"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* 郵便番号 */}
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                  郵便番号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.postalCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="XXX-XXXX"
                />
                {errors.postalCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
                )}
              </div>

              {/* 住所 */}
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  住所 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="address"
                  rows={3}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="住所を入力"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>

              {/* ステータス */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  ステータス <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="pending">審査中</option>
                  <option value="active">営業中</option>
                  <option value="inactive">休業中</option>
                  <option value="suspended">停止中</option>
                </select>
              </div>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? '更新中...' : '更新'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
