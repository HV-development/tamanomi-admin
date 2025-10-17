'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/templates/dashboard-layout';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import { validateMerchantField, validateMerchantForm, type MerchantFormData, type MerchantStatus } from '@hv-development/schemas';

// 編集画面用のフォームデータ型（statusフィールドを含む）
type MerchantEditFormData = Partial<MerchantFormData> & {
  status: MerchantStatus;
  name: string;
  nameKana: string;
  representative?: string;
  representativeName?: string;
  representativeNameLast: string;
  representativeNameFirst: string;
  representativeNameLastKana: string;
  representativeNameFirstKana: string;
  representativePhone: string;
  email: string;
  phone: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address1: string;
  address2?: string;
  [key: string]: unknown;
};

const prefectures = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];


export default function MerchantEdit() {
  const params = useParams();
  const merchantId = params.id as string;
  
  const [formData, setFormData] = useState<MerchantEditFormData>({
    name: '',
    nameKana: '',
    representative: '',
    representativeName: '',
    representativeNameLast: '',
    representativeNameFirst: '',
    representativeNameLastKana: '',
    representativeNameFirstKana: '',
    representativePhone: '',
    email: '',
    phone: '',
    postalCode: '',
    prefecture: '',
    city: '',
    address1: '',
    address2: '',
    status: 'registering',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  
  const fieldRefs = useRef<{ [key: string]: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null }>({});

  // 会社データの読み込み
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const loadMerchantData = async () => {
      try {
        // APIから会社データを取得
        const response = await fetch(`/api/merchants/${merchantId}`, {
          signal: abortController.signal,
        });
        
        // コンポーネントがアンマウントされている場合は処理を中断
        if (!isMounted) return;
        
        if (response.ok) {
          const merchantData = await response.json();
          
          if (isMounted) {
            // APIレスポンスをフォームデータに変換
            setFormData({
              name: merchantData.name || '',
              nameKana: merchantData.nameKana || '',
              representative: merchantData.representative || '',
              representativeName: merchantData.representativeName || '',
              representativeNameLast: merchantData.representativeNameLast || '',
              representativeNameFirst: merchantData.representativeNameFirst || '',
              representativeNameLastKana: merchantData.representativeNameLastKana || '',
              representativeNameFirstKana: merchantData.representativeNameFirstKana || '',
              representativePhone: merchantData.representativePhone || '',
              email: merchantData.email || '',
              phone: merchantData.phone || '',
              postalCode: merchantData.postalCode || '',
              prefecture: merchantData.prefecture || '',
              city: merchantData.city || '',
              address1: merchantData.address1 || '',
              address2: merchantData.address2 || '',
              status: (merchantData.status as MerchantStatus) || 'registering',
            });
          }
        } else {
          if (!isMounted) return;
          
          console.error('会社データの取得に失敗しました:', response.status);
          // エラー時はサンプルデータを使用
          const sampleData: MerchantEditFormData = {
            name: '株式会社たまのみ',
            nameKana: 'カブシキガイシャタマノミ',
            representative: '田中太郎',
            representativeName: '田中太郎',
            representativeNameLast: '田中',
            representativeNameFirst: '太郎',
            representativeNameLastKana: 'タナカ',
            representativeNameFirstKana: 'タロウ',
            representativePhone: '0312345678',
            email: 'info@tamanomi.co.jp',
            phone: '0312345678',
            postalCode: '1000001',
            prefecture: '東京都',
            city: '千代田区',
            address1: '千代田1-1-1',
            address2: '',
            status: 'operating',
          };
          setFormData(sampleData);
        }
      } catch (error) {
        // アボート時のエラーは無視
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        
        if (!isMounted) return;
        
        console.error('会社データの読み込みエラー:', error);
        // エラー時はサンプルデータを使用
        const sampleData: MerchantEditFormData = {
          name: '株式会社たまのみ',
          nameKana: 'カブシキガイシャタマノミ',
          representative: '田中太郎',
          representativeName: '田中太郎',
          representativeNameLast: '田中',
          representativeNameFirst: '太郎',
          representativeNameLastKana: 'タナカ',
          representativeNameFirstKana: 'タロウ',
          representativePhone: '0312345678',
          email: 'info@tamanomi.co.jp',
          phone: '0312345678',
          postalCode: '1000001',
          prefecture: '東京都',
          city: '千代田区',
          address1: '千代田1-1-1',
          address2: '',
          status: 'operating',
        };
        setFormData(sampleData);
        alert('会社データの読み込みに失敗しました。サンプルデータを表示しています。');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (merchantId) {
      loadMerchantData();
    }

    // クリーンアップ: コンポーネントのアンマウント時または再実行時にリクエストをキャンセル
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [merchantId]);

  const handleInputChange = (field: keyof MerchantEditFormData, value: string) => {
    setFormData((prev: MerchantEditFormData) => ({ ...prev, [field]: value }));
    
    // リアルタイムバリデーション（statusフィールドは除く）
    if (field !== 'status') {
      const error = validateMerchantField(field as keyof MerchantFormData, value || '');
      if (error) {
        setErrors((prev: Record<string, string>) => ({ ...prev, [field]: error }));
      } else {
        setErrors((prev: Record<string, string>) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
      }
    }
  };

  const handleBlur = (field: keyof MerchantEditFormData) => {
    const value = formData[field];
    // statusフィールドは除く
    if (field !== 'status') {
      const error = validateMerchantField(field as keyof MerchantFormData, (value as string) || '');
      if (error) {
        setErrors((prev: Record<string, string>) => ({ ...prev, [field]: error }));
      } else {
        setErrors((prev: Record<string, string>) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
      }
    }
  };

  const getCharacterCount = (field: keyof MerchantEditFormData, maxLength: number) => {
    const currentLength = ((formData[field] as string) || '').length;
    return `${currentLength} / ${maxLength}`;
  };

  const handleAddressSearch = async () => {
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
    // MerchantFormDataの部分のみをバリデーション
    const { name, nameKana, representativeNameLast, representativeNameFirst, representativeNameLastKana, representativeNameFirstKana, representativePhone, email, phone, postalCode, prefecture, city, address1, address2 } = formData;
    const merchantData = { name, nameKana, representativeNameLast, representativeNameFirst, representativeNameLastKana, representativeNameFirstKana, representativePhone, email, phone, postalCode, prefecture, city, address1, address2 };
    
    const { isValid, errors: validationErrors } = validateMerchantForm(merchantData as Partial<MerchantFormData>);
    setErrors(validationErrors);
    
    if (!isValid) {
      const firstErrorField = Object.keys(validationErrors)[0];
      if (firstErrorField && fieldRefs.current[firstErrorField]) {
        fieldRefs.current[firstErrorField]?.focus();
      }
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateFormData()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // APIに送信するデータを準備
      const updateData = {
        name: formData.name,
        nameKana: formData.nameKana,
        representativeNameLast: formData.representativeNameLast,
        representativeNameFirst: formData.representativeNameFirst,
        representativeNameLastKana: formData.representativeNameLastKana,
        representativeNameFirstKana: formData.representativeNameFirstKana,
        representativePhone: formData.representativePhone,
        email: formData.email,
        postalCode: formData.postalCode,
        prefecture: formData.prefecture,
        city: formData.city,
        address1: formData.address1,
        address2: formData.address2,
        status: formData.status,
      };

      const response = await fetch(`/api/merchants/${merchantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        console.log('会社更新データ:', formData);
        alert('会社の更新が完了しました。');
        // 成功時の処理（実際の実装では適切なページにリダイレクト）
      } else {
        const errorData = await response.json();
        console.error('更新エラー:', errorData);
        alert(`更新中にエラーが発生しました: ${errorData.message || '不明なエラー'}`);
      }
      
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
              <h1 className="text-2xl font-bold text-gray-900">会社編集</h1>
              <p className="text-gray-600">
                会社ID: {merchantId}
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
            
            <div className="space-y-6">
              {/* 会社名 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  会社名 <span className="text-red-500">*</span>
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
                  placeholder="会社名を入力"
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
                  placeholder="会社名（カナ）を入力"
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
                {errors.representativePhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.representativePhone}</p>
                )}
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
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
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
                  <p className="text-sm text-gray-500">{getCharacterCount('email', 255)}</p>
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
                    onClick={handleAddressSearch}
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

              {/* ステータス */}
              <div className="w-60">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  ステータス <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="registering">登録中</option>
                  <option value="collection_requested">資料収集中</option>
                  <option value="approval_pending">承認待ち</option>
                  <option value="promotional_materials_preparing">広告資料準備中</option>
                  <option value="promotional_materials_shipping">広告資料配送中</option>
                  <option value="operating">営業中</option>
                  <option value="suspended">停止中</option>
                  <option value="terminated">終了</option>
                </select>
                <div className="mt-1 flex justify-between">
                  {errors.status && (
                    <p className="text-sm text-red-600">{errors.status}</p>
                  )}
                </div>
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
