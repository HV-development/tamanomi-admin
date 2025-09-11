'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '../templates/DashboardLayout';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import { 
  validateRequired, 
  validateMaxLength, 
  validatePostalCode, 
  validatePhone, 
  validateUrl, 
  validateStoreCode 
} from '../../utils/validation';

interface StoreFormData {
  storeName: string;
  storeDescription: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
  building: string;
  phone: string;
  homepage: string;
  genre: string;
  storeCode: string;
}

const prefectures = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

const genres = [
  '居酒屋', 'レストラン', 'カフェ', 'ファストフード', 'ラーメン店',
  '焼肉店', '寿司店', 'イタリアン', 'フレンチ', '中華料理',
  'その他'
];

export default function StoreRegistration() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<StoreFormData>({
    storeName: '',
    storeDescription: '',
    postalCode: '',
    prefecture: '',
    city: '',
    address: '',
    building: '',
    phone: '',
    homepage: '',
    genre: '',
    storeCode: '',
  });

  const [errors, setErrors] = useState<Partial<StoreFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // URLパラメータから値を取得してフォームに設定
    if (searchParams) {
      const urlData = {
        storeName: searchParams.get('storeName') || '',
        storeDescription: searchParams.get('storeDescription') || '',
        postalCode: searchParams.get('postalCode') || '',
        prefecture: searchParams.get('prefecture') || '',
        city: searchParams.get('city') || '',
        address: searchParams.get('address') || '',
        building: searchParams.get('building') || '',
        phone: searchParams.get('phone') || '',
        homepage: searchParams.get('homepage') || '',
        genre: searchParams.get('genre') || '',
        storeCode: searchParams.get('storeCode') || '',
      };
      
      // いずれかの値が存在する場合のみフォームデータを更新
      if (Object.values(urlData).some(value => value !== '')) {
        setFormData(urlData);
      }
    }
  }, [searchParams]);

  const handleInputChange = (field: keyof StoreFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // リアルタイムバリデーション（input時）
    validateField(field, value);
  };

  const validateField = (field: keyof StoreFormData, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'storeName':
        const storeNameError = validateRequired(value, '店舗名') || validateMaxLength(value, 30, '店舗名');
        if (storeNameError) {
          newErrors.storeName = storeNameError;
        } else {
          delete newErrors.storeName;
        }
        break;

      case 'storeDescription':
        const descriptionError = validateRequired(value, '店舗紹介内容') || validateMaxLength(value, 100, '店舗紹介内容');
        if (descriptionError) {
          newErrors.storeDescription = descriptionError;
        } else {
          delete newErrors.storeDescription;
        }
        break;

      case 'postalCode':
        const postalCodeError = validateRequired(value, '郵便番号') || validatePostalCode(value);
        if (postalCodeError) {
          newErrors.postalCode = postalCodeError;
        } else {
          delete newErrors.postalCode;
        }
        break;

      case 'prefecture':
        const prefectureError = validateRequired(value, '都道府県');
        if (prefectureError) {
          newErrors.prefecture = prefectureError;
        } else {
          delete newErrors.prefecture;
        }
        break;

      case 'city':
        const cityError = validateRequired(value, '市区町村') || validateMaxLength(value, 20, '市区町村');
        if (cityError) {
          newErrors.city = cityError;
        } else {
          delete newErrors.city;
        }
        break;

      case 'address':
        const addressError = validateRequired(value, '番地以降') || validateMaxLength(value, 100, '番地以降');
        if (addressError) {
          newErrors.address = addressError;
        } else {
          delete newErrors.address;
        }
        break;

      case 'building':
        const buildingError = validateRequired(value, '建物名') || validateMaxLength(value, 100, '建物名');
        if (buildingError) {
          newErrors.building = buildingError;
        } else {
          delete newErrors.building;
        }
        break;

      case 'phone':
        const phoneError = validateRequired(value, '電話番号') || validatePhone(value);
        if (phoneError) {
          newErrors.phone = phoneError;
        } else {
          delete newErrors.phone;
        }
        break;

      case 'homepage':
        const homepageError = validateMaxLength(value, 255, 'ホームページ') || validateUrl(value);
        if (homepageError) {
          newErrors.homepage = homepageError;
        } else {
          delete newErrors.homepage;
        }
        break;

      case 'genre':
        const genreError = validateRequired(value, 'ジャンル');
        if (genreError) {
          newErrors.genre = genreError;
        } else {
          delete newErrors.genre;
        }
        break;

      case 'storeCode':
        const storeCodeError = validateRequired(value, '店舗CD') || validateStoreCode(value);
        if (storeCodeError) {
          newErrors.storeCode = storeCodeError;
        } else {
          delete newErrors.storeCode;
        }
        break;
    }

    setErrors(newErrors);
  };

  const validateAllFields = (): boolean => {
    const newErrors: Partial<StoreFormData> = {};

    // 必須チェック
    const storeNameError = validateRequired(formData.storeName, '店舗名') || validateMaxLength(formData.storeName, 30, '店舗名');
    if (storeNameError) newErrors.storeName = storeNameError;

    const descriptionError = validateRequired(formData.storeDescription, '店舗紹介内容') || validateMaxLength(formData.storeDescription, 100, '店舗紹介内容');
    if (descriptionError) newErrors.storeDescription = descriptionError;

    const postalCodeError = validateRequired(formData.postalCode, '郵便番号') || validatePostalCode(formData.postalCode);
    if (postalCodeError) newErrors.postalCode = postalCodeError;

    const prefectureError = validateRequired(formData.prefecture, '都道府県');
    if (prefectureError) newErrors.prefecture = prefectureError;

    const cityError = validateRequired(formData.city, '市区町村') || validateMaxLength(formData.city, 20, '市区町村');
    if (cityError) newErrors.city = cityError;

    const addressError = validateRequired(formData.address, '番地以降') || validateMaxLength(formData.address, 100, '番地以降');
    if (addressError) newErrors.address = addressError;

    const buildingError = validateRequired(formData.building, '建物名') || validateMaxLength(formData.building, 100, '建物名');
    if (buildingError) newErrors.building = buildingError;

    const phoneError = validateRequired(formData.phone, '電話番号') || validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    const homepageError = validateMaxLength(formData.homepage, 255, 'ホームページ') || validateUrl(formData.homepage);
    if (homepageError) newErrors.homepage = homepageError;

    const genreError = validateRequired(formData.genre, 'ジャンル');
    if (genreError) newErrors.genre = genreError;

    const storeCodeError = validateRequired(formData.storeCode, '店舗CD') || validateStoreCode(formData.storeCode);
    if (storeCodeError) newErrors.storeCode = storeCodeError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = (): boolean => {
    return validateAllFields();
  };

  const clearFieldError = (field: keyof StoreFormData) => {
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAddressSearch = () => {
    // 郵便番号の存在チェック
    // zipcloudのAPIを使用して住所検索
    if (formData.postalCode.length !== 7) {
      alert('郵便番号を正しく入力してください（7桁の数字）');
      return;
    }

    fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${formData.postalCode}`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 200 && data.results && data.results.length > 0) {
          const result = data.results[0];
          setFormData(prev => ({
            ...prev,
            prefecture: result.address1,
            city: result.address2,
            address: result.address3
          }));
          alert('住所を取得しました');
        } else {
          alert('該当する住所が見つかりませんでした');
        }
      })
      .catch(error => {
        console.error('住所検索エラー:', error);
        alert('住所検索に失敗しました');
      });
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    if (validateForm()) {
      // 登録内容確認画面に遷移
      const queryParams = new URLSearchParams({
        storeName: formData.storeName,
        storeDescription: formData.storeDescription,
        postalCode: formData.postalCode,
        prefecture: formData.prefecture,
        city: formData.city,
        address: formData.address,
        building: formData.building,
        phone: formData.phone,
        homepage: formData.homepage,
        genre: formData.genre,
        storeCode: formData.storeCode,
      });
      
      window.location.href = `/stores/confirm?${queryParams.toString()}`;
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ページタイトル */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">店舗新規登録</h1>
            <p className="text-gray-600">
              新しい加盟店舗を登録します
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

        {/* 登録フォーム */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-6">
            {/* 店舗名 */}
            <div>
              <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-2">
                店舗名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="storeName"
                placeholder="店舗名を入力（最大30文字）"
                value={formData.storeName}
                onChange={(e) => handleInputChange('storeName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.storeName ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={30}
              />
              {errors.storeName && (
                <p className="mt-1 text-sm text-red-500">{errors.storeName}</p>
              )}
            </div>

            {/* 店舗紹介内容 */}
            <div>
              <label htmlFor="storeDescription" className="block text-sm font-medium text-gray-700 mb-2">
                店舗紹介内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="storeDescription"
                placeholder="店舗紹介内容を入力（最大100文字）"
                value={formData.storeDescription}
                onChange={(e) => handleInputChange('storeDescription', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.storeDescription ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={3}
                maxLength={100}
              />
              {errors.storeDescription && (
                <p className="mt-1 text-sm text-red-500">{errors.storeDescription}</p>
              )}
            </div>

            {/* 郵便番号と住所検索 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                  郵便番号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="postalCode"
                  placeholder="1234567（7桁の数字）"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value.replace(/\D/g, ''))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.postalCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                  maxLength={7}
                />
                {errors.postalCode && (
                  <p className="mt-1 text-sm text-red-500">{errors.postalCode}</p>
                )}
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={handleAddressSearch}
                  className="w-full"
                  disabled={formData.postalCode.length !== 7}
                >
                  住所検索
                </Button>
              </div>
            </div>

            {/* 都道府県 */}
            <div>
              <label htmlFor="prefecture" className="block text-sm font-medium text-gray-700 mb-2">
                都道府県 <span className="text-red-500">*</span>
              </label>
              <select
                id="prefecture"
                value={formData.prefecture}
                onChange={(e) => handleInputChange('prefecture', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.prefecture ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">都道府県を選択してください</option>
                {prefectures.map((pref) => (
                  <option key={pref} value={pref}>{pref}</option>
                ))}
              </select>
              {errors.prefecture && (
                <p className="mt-1 text-sm text-red-500">{errors.prefecture}</p>
              )}
            </div>

            {/* 市区町村 */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                市区町村 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                placeholder="市区町村を入力（最大20文字）"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={20}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-500">{errors.city}</p>
              )}
            </div>

            {/* 番地以降 */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                番地以降 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address"
                placeholder="番地以降を入力（最大100文字）"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={100}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-500">{errors.address}</p>
              )}
            </div>

            {/* 建物名 */}
            <div>
              <label htmlFor="building" className="block text-sm font-medium text-gray-700 mb-2">
                建物名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="building"
                placeholder="建物名を入力（最大100文字）"
                value={formData.building}
                onChange={(e) => handleInputChange('building', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.building ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={100}
              />
              {errors.building && (
                <p className="mt-1 text-sm text-red-500">{errors.building}</p>
              )}
            </div>

            {/* 電話番号 */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                電話番号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="phone"
                placeholder="電話番号を入力（最大12文字）"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={12}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* ホームページ */}
            <div>
              <label htmlFor="homepage" className="block text-sm font-medium text-gray-700 mb-2">
                ホームページ
              </label>
              <input
                type="url"
                id="homepage"
                placeholder="https://example.com（URL形式、最大255文字）"
                value={formData.homepage}
                onChange={(e) => handleInputChange('homepage', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.homepage ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={255}
              />
              {errors.homepage && (
                <p className="mt-1 text-sm text-red-500">{errors.homepage}</p>
              )}
            </div>

            {/* ジャンル */}
            <div>
              <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
                ジャンル <span className="text-red-500">*</span>
              </label>
              <select
                id="genre"
                value={formData.genre}
                onChange={(e) => handleInputChange('genre', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.genre ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">ジャンルを選択してください</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
              {errors.genre && (
                <p className="mt-1 text-sm text-red-500">{errors.genre}</p>
              )}
            </div>

            {/* 店舗CD */}
            <div>
              <label htmlFor="storeCode" className="block text-sm font-medium text-gray-700 mb-2">
                店舗CD <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="storeCode"
                placeholder="ABC123（3-6文字の大文字英語または数字）"
                value={formData.storeCode}
                onChange={(e) => handleInputChange('storeCode', e.target.value.toUpperCase())}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.storeCode ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={6}
              />
              {errors.storeCode && (
                <p className="mt-1 text-sm text-red-500">{errors.storeCode}</p>
              )}
            </div>

            {/* 登録ボタン */}
            <div className="flex justify-center pt-6">
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8"
              >
                {isSubmitting ? '処理中...' : '登録内容を確認する'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}