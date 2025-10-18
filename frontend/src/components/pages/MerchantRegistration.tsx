'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/templates/dashboard-layout';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import { validateMerchantField, validateMerchantForm, type MerchantFormData } from '@hv-development/schemas';



const prefectures = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

export default function MerchantRegistration() {
  const router = useRouter();
  
  // フォームデータに追加のフィールドを含める
  const [formData, setFormData] = useState<MerchantFormData & { email: string }>({
    name: '',
    nameKana: '',
    representativeNameLast: '',
    representativeNameFirst: '',
    representativeNameLastKana: '',
    representativeNameFirstKana: '',
    representativePhone: '',
    email: '', // アカウント用メールアドレス
    postalCode: '',
    prefecture: '',
    city: '',
    address1: '',
    address2: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string>('');
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  
  const fieldRefs = useRef<{ [key: string]: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null }>({});


  const handleInputChange = (field: keyof (MerchantFormData & { email: string }), value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // リアルタイムバリデーション（emailフィールドは個別にバリデーション）
    if (field === 'email') {
      // emailの簡易バリデーション
      if (!value.trim()) {
        setErrors((prev) => ({ ...prev, email: 'メールアドレスは必須です' }));
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setErrors((prev) => ({ ...prev, email: '有効なメールアドレスを入力してください' }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      }
    } else {
      const error = validateMerchantField(field, value || '');
      if (error) {
        setErrors((prev) => ({ ...prev, [field]: error }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
      }
    }
  };

  const handleBlur = (field: keyof (MerchantFormData & { email: string })) => {
    const value = formData[field];
    
    if (field === 'email') {
      // emailの簡易バリデーション
      if (!value || !value.trim()) {
        setErrors((prev) => ({ ...prev, email: 'メールアドレスは必須です' }));
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setErrors((prev) => ({ ...prev, email: '有効なメールアドレスを入力してください' }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      }
    } else {
      const error = validateMerchantField(field as keyof MerchantFormData, value || '');
      if (error) {
        setErrors((prev) => ({ ...prev, [field]: error }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
      }
    }
  };

  const handleZipcodeSearch = async () => {
    // 郵便番号の存在チェック
    if (formData.postalCode.length !== 7) {
      alert('郵便番号を正しく入力してください（7桁の数字）');
      return;
    }

    setIsSearchingAddress(true);

    try {
      const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${formData.postalCode}`);
      const data = await response.json();

      if (data.status === 200 && data.results && data.results.length > 0) {
        const result = data.results[0];
        setFormData((prev) => ({
          ...prev,
          prefecture: result.address1,
          city: result.address2,
          address1: result.address3,
        }));
        
        // エラーをクリア
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.prefecture;
          delete newErrors.city;
          delete newErrors.address1;
          return newErrors;
        });
        alert('住所を取得しました');
      } else {
        const newErrors = { ...errors };
        newErrors.postalCode = '入力された郵便番号は存在しません';
        setErrors(newErrors);
        alert('該当する住所が見つかりませんでした');
      }
    } catch (error) {
      console.error('住所検索エラー:', error);
      alert('住所検索に失敗しました');
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const validateFormData = (): boolean => {
    const validationError = validateMerchantForm(formData);
    
    if (validationError) {
      // バリデーションエラーがある場合
      setErrors({ general: validationError });
      return false;
    }
    
    // バリデーション成功
    setErrors({});
    return true;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    
    if (!validateFormData()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // emailフィールドをaccountEmailにマッピング
      // APIスキーマに合わせてフィールドをマッピング
      const requestData = {
        accountEmail: formData.email,
        name: formData.name,
        nameKana: formData.nameKana,
        representativeNameLast: formData.representativeNameLast,
        representativeNameFirst: formData.representativeNameFirst,
        representativeNameLastKana: formData.representativeNameLastKana,
        representativeNameFirstKana: formData.representativeNameFirstKana,
        representativePhone: formData.representativePhone,
        postalCode: formData.postalCode,
        prefecture: formData.prefecture,
        city: formData.city,
        address1: formData.address1,
        address2: formData.address2 || undefined,
      };
      
      console.log('📤 Sending merchant data:', requestData);

      const response = await fetch('/api/merchants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 400) {
          // パラメータエラーの場合
          console.log('🔍 Error data structure:', errorData);
          if (errorData.error?.details) {
            // 新しいエラー形式: { error: { details: [...] } }
            const fieldErrors: Record<string, string> = {};
            errorData.error.details.forEach((detail: { path: string[]; message: string }) => {
              if (detail.path && detail.path.length > 0) {
                const fieldName = detail.path[0];
                fieldErrors[fieldName] = detail.message;
              }
            });
            setErrors(fieldErrors);
            console.log('🔍 Parsed field errors:', fieldErrors);
            
            // 最初のエラーフィールドにスクロール
            const firstErrorField = Object.keys(fieldErrors)[0];
            if (firstErrorField && fieldRefs.current[firstErrorField as keyof typeof fieldRefs.current]) {
              const element = fieldRefs.current[firstErrorField as keyof typeof fieldRefs.current];
              element?.focus();
              element?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
              });
            }
          } else if (errorData.errors) {
            // 古いエラー形式: { errors: {...} }
            setErrors(errorData.errors);
            // 最初のエラーフィールドにスクロール
            const firstErrorField = Object.keys(errorData.errors)[0];
            if (firstErrorField && fieldRefs.current[firstErrorField as keyof typeof fieldRefs.current]) {
              const element = fieldRefs.current[firstErrorField as keyof typeof fieldRefs.current];
              element?.focus();
              element?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
              });
            }
          } else {
            setServerError(errorData.error?.message || errorData.message || '入力内容に誤りがあります');
          }
        } else {
          // その他のエラーの場合
          alert(errorData.message || '登録中にエラーが発生しました');
        }
        return;
      }

      // 成功時の処理
      router.push('/merchants');
      
    } catch (error) {
      console.error('登録エラー:', error);
      alert('登録中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCharacterCount = (field: keyof MerchantFormData, maxLength: number) => {
    const currentLength = (formData[field] || '').length;
    return `${currentLength} / ${maxLength}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">会社新規登録</h1>
              <p className="text-gray-600">
                新しい会社を登録します
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

        {/* サーバーエラー表示 */}
        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-xl mr-2">⚠️</span>
              <div>
                <p className="text-sm text-red-800">{serverError}</p>
              </div>
            </div>
          </div>
        )}

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-6">基本情報</h3>
            
            <div className="space-y-6">
              {/* 会社名 / 会社名 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  会社名 / 会社名 <span className="text-red-500">*</span>
                </label>
                <input
                  ref={(el) => { fieldRefs.current.name = el; }}
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="会社名 / 会社名を入力してください"
                />
                <div className="mt-1 flex justify-between items-center">
                  {errors.name ? (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  ) : (
                    <div></div>
                  )}
                  <p className="text-sm text-gray-500">{getCharacterCount('name', 50)}</p>
                </div>
              </div>

              {/* 会社名（カナ） */}
              <div>
                <label htmlFor="nameKana" className="block text-sm font-medium text-gray-700 mb-2">
                  会社名（カナ） <span className="text-red-500">*</span>
                </label>
                <input
                  ref={(el) => { fieldRefs.current.nameKana = el; }}
                  type="text"
                  id="nameKana"
                  value={formData.nameKana}
                  onChange={(e) => handleInputChange('nameKana', e.target.value)}
                  onBlur={() => handleBlur('nameKana')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.nameKana ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="会社名（カナ）を入力してください"
                />
                <div className="mt-1 flex justify-between items-center">
                  {errors.nameKana ? (
                    <p className="text-sm text-red-600">{errors.nameKana}</p>
                  ) : (
                    <div></div>
                  )}
                  <p className="text-sm text-gray-500">{getCharacterCount('nameKana', 100)}</p>
                </div>
              </div>

              {/* 代表者名（姓・名） */}
              <div className="flex gap-4">
                <div className="w-50">
                  <label htmlFor="representativeNameLast" className="block text-sm font-medium text-gray-700 mb-2">
                    代表者名（姓） <span className="text-red-500">*</span>
                  </label>
                    <input
                      ref={(el) => { fieldRefs.current.representativeNameLast = el; }}
                      type="text"
                      id="representativeNameLast"
                      value={formData.representativeNameLast}
                      onChange={(e) => handleInputChange('representativeNameLast', e.target.value)}
                      onBlur={() => handleBlur('representativeNameLast')}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.representativeNameLast ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="姓を入力してください"
                      maxLength={25}
                    />
                  <div className="mt-1 flex justify-between items-center">
                    {errors.representativeNameLast ? (
                      <p className="text-sm text-red-600">{errors.representativeNameLast}</p>
                    ) : (
                      <div></div>
                    )}
                    <p className="text-sm text-gray-500">{getCharacterCount('representativeNameLast', 25)}</p>
                  </div>
                </div>

                <div className="w-50">
                  <label htmlFor="representativeNameFirst" className="block text-sm font-medium text-gray-700 mb-2">
                    代表者名（名） <span className="text-red-500">*</span>
                  </label>
                    <input
                      ref={(el) => { fieldRefs.current.representativeNameFirst = el; }}
                      type="text"
                      id="representativeNameFirst"
                      value={formData.representativeNameFirst}
                      onChange={(e) => handleInputChange('representativeNameFirst', e.target.value)}
                      onBlur={() => handleBlur('representativeNameFirst')}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.representativeNameFirst ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="名を入力してください"
                      maxLength={25}
                    />
                    <div className="mt-1 flex justify-between items-center">
                      {errors.representativeNameFirst ? (
                        <p className="text-sm text-red-600">{errors.representativeNameFirst}</p>
                      ) : (
                        <div></div>
                      )}
                      <p className="text-sm text-gray-500">{getCharacterCount('representativeNameFirst', 25)}</p>
                    </div>
                </div>
              </div>

              {/* 代表者名（姓・名 / カナ） */}
              <div className="flex gap-4">
                <div className="w-50">
                  <label htmlFor="representativeNameLastKana" className="block text-sm font-medium text-gray-700 mb-2">
                    代表者名（姓 / カナ） <span className="text-red-500">*</span>
                  </label>
                    <input
                      ref={(el) => { fieldRefs.current.representativeNameLastKana = el; }}
                      type="text"
                      id="representativeNameLastKana"
                      value={formData.representativeNameLastKana}
                      onChange={(e) => handleInputChange('representativeNameLastKana', e.target.value)}
                      onBlur={() => handleBlur('representativeNameLastKana')}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.representativeNameLastKana ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="姓（カナ）を入力してください"
                      maxLength={50}
                    />
                    <div className="mt-1 flex justify-between items-center">
                      {errors.representativeNameLastKana ? (
                        <p className="text-sm text-red-600">{errors.representativeNameLastKana}</p>
                      ) : (
                        <div></div>
                      )}
                      <p className="text-sm text-gray-500">{getCharacterCount('representativeNameLastKana', 50)}</p>
                    </div>
                </div>

                <div className="w-50">
                  <label htmlFor="representativeNameFirstKana" className="block text-sm font-medium text-gray-700 mb-2">
                    代表者名（名 / カナ） <span className="text-red-500">*</span>
                  </label>
                    <input
                      ref={(el) => { fieldRefs.current.representativeNameFirstKana = el; }}
                      type="text"
                      id="representativeNameFirstKana"
                      value={formData.representativeNameFirstKana}
                      onChange={(e) => handleInputChange('representativeNameFirstKana', e.target.value)}
                      onBlur={() => handleBlur('representativeNameFirstKana')}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.representativeNameFirstKana ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="名（カナ）を入力してください"
                      maxLength={50}
                    />
                  <div className="mt-1 flex justify-between items-center">
                    {errors.representativeNameFirstKana ? (
                      <p className="text-sm text-red-600">{errors.representativeNameFirstKana}</p>
                    ) : (
                      <div></div>
                    )}
                    <p className="text-sm text-gray-500">{getCharacterCount('representativeNameFirstKana', 50)}</p>
                  </div>
                </div>
              </div>

              {/* 代表者電話番号 */}
              <div className="w-100">
                <label htmlFor="representativePhone" className="block text-sm font-medium text-gray-700 mb-2">
                  代表者電話番号 <span className="text-red-500">*</span>
                </label>
                <input
                  ref={(el) => { fieldRefs.current.representativePhone = el; }}
                  type="tel"
                  id="representativePhone"
                  value={formData.representativePhone}
                  onChange={(e) => handleInputChange('representativePhone', e.target.value.replace(/\D/g, ''))}
                  onBlur={() => handleBlur('representativePhone')}
                  className={`w-100 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.representativePhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="電話番号を入力してください（ハイフン無し）"
                />
                <div className="mt-1 flex justify-between">
                  {errors.representativePhone && (
                    <p className="text-sm text-red-600">{errors.representativePhone}</p>
                  )}
                </div>
              </div>

              {/* メールアドレス */}
              <div className="w-100">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  ref={(el) => { fieldRefs.current.email = el; }}
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email' as keyof (MerchantFormData & { email: string }), e.target.value)}
                  onBlur={() => handleBlur('email' as keyof (MerchantFormData & { email: string }))}
                  className={`w-100 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="メールアドレスを入力してください"
                />
                <div className="mt-1 flex justify-between items-center">
                  {errors.email ? (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  ) : (
                    <div></div>
                  )}
                  <p className="text-sm text-gray-500">{formData.email.length} / 255</p>
                </div>
              </div>
            </div>
          </div>

          {/* 住所情報 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-6">住所情報</h3>
            
            <div className="space-y-6">
              {/* 郵便番号と住所検索 */}
              <div className="flex gap-4">
                <div className="w-40">
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                    郵便番号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={(el) => { fieldRefs.current.postalCode = el; }}
                    type="text"
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value.replace(/\D/g, ''))}
                    onBlur={() => handleBlur('postalCode')}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.postalCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="1234567"
                    maxLength={7}
                  />
                  <div className="mt-1 flex justify-between">
                    {errors.postalCode && (
                      <p className="text-sm text-red-600">{errors.postalCode}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleZipcodeSearch}
                    disabled={formData.postalCode.length !== 7 || isSearchingAddress}
                    className="w-32"
                  >
                    {isSearchingAddress ? '検索中...' : '住所検索'}
                  </Button>
                </div>
              </div>

              {/* 都道府県 */}
              <div className="w-60">
                <label htmlFor="prefecture" className="block text-sm font-medium text-gray-700 mb-2">
                  都道府県 <span className="text-red-500">*</span>
                </label>
                <select
                  ref={(el) => { fieldRefs.current.prefecture = el; }}
                  id="prefecture"
                  value={formData.prefecture}
                  onChange={(e) => handleInputChange('prefecture', e.target.value)}
                  onBlur={() => handleBlur('prefecture')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.prefecture ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">都道府県を選択</option>
                  {prefectures.map(pref => (
                    <option key={pref} value={pref}>{pref}</option>
                  ))}
                </select>
                <div className="mt-1 flex justify-between">
                  {errors.prefecture && (
                    <p className="text-sm text-red-600">{errors.prefecture}</p>
                  )}
                </div>
              </div>

              {/* 市区町村 */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  市区町村 <span className="text-red-500">*</span>
                </label>
                <input
                  ref={(el) => { fieldRefs.current.city = el; }}
                  type="text"
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  onBlur={() => handleBlur('city')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="市区町村を入力してください"
                />
                <div className="mt-1 flex justify-between items-center">
                  {errors.city ? (
                    <p className="text-sm text-red-600">{errors.city}</p>
                  ) : (
                    <div></div>
                  )}
                  <p className="text-sm text-gray-500">{getCharacterCount('city', 255)}</p>
                </div>
              </div>

              {/* 番地以降 */}
              <div>
                <label htmlFor="address1" className="block text-sm font-medium text-gray-700 mb-2">
                  番地以降 <span className="text-red-500">*</span>
                </label>
                <input
                  ref={(el) => { fieldRefs.current.address1 = el; }}
                  type="text"
                  id="address1"
                  value={formData.address1}
                  onChange={(e) => handleInputChange('address1', e.target.value)}
                  onBlur={() => handleBlur('address1')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.address1 ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="番地以降を入力してください"
                />
                <div className="mt-1 flex justify-between items-center">
                  {errors.address1 ? (
                    <p className="text-sm text-red-600">{errors.address1}</p>
                  ) : (
                    <div></div>
                  )}
                  <p className="text-sm text-gray-500">{getCharacterCount('address1', 255)}</p>
                </div>
              </div>

              {/* 建物名 / 部屋番号 */}
              <div>
                <label htmlFor="address2" className="block text-sm font-medium text-gray-700 mb-2">
                  建物名 / 部屋番号
                </label>
                <input
                  ref={(el) => { fieldRefs.current.address2 = el; }}
                  type="text"
                  id="address2"
                  value={formData.address2}
                  onChange={(e) => handleInputChange('address2', e.target.value)}
                  onBlur={() => handleBlur('address2')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.address2 ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="建物名 / 部屋番号を入力してください（任意）"
                />
                <div className="mt-1 flex justify-between items-center">
                  {errors.address2 ? (
                    <p className="text-sm text-red-600">{errors.address2}</p>
                  ) : (
                    <div></div>
                  )}
                  <p className="text-sm text-gray-500">{getCharacterCount('address2', 255)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? '登録中...' : '登録'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}