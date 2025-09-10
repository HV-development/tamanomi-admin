'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../templates/DashboardLayout';
import Button from '../atoms/Button';

interface UserFormData {
  nickname: string;
  email: string;
  postalCode: string;
  address: string;
  birthDate: string;
  gender: string;
  saitamaAppId: string;
}

// サンプルデータ（実際はAPIから取得）
const sampleUserData: Record<string, UserFormData> = {
  '1': {
    nickname: '田中太郎',
    email: 'tanaka@example.com',
    postalCode: '3300001',
    address: '埼玉県さいたま市浦和区高砂1-1-1',
    birthDate: '1990-05-15',
    gender: '1',
    saitamaAppId: 'SA001234',
  },
  '2': {
    nickname: '佐藤花子',
    email: 'sato@example.com',
    postalCode: '3300062',
    address: '埼玉県さいたま市浦和区仲町2-2-2',
    birthDate: '1985-08-22',
    gender: '2',
    saitamaAppId: 'SA005678',
  },
  '3': {
    nickname: '鈴木次郎',
    email: 'suzuki@example.com',
    postalCode: '3300043',
    address: '埼玉県さいたま市浦和区大東3-3-3',
    birthDate: '1995-12-03',
    gender: '1',
    saitamaAppId: 'SA009012',
  },
  '4': {
    nickname: '山田美咲',
    email: 'yamada@example.com',
    postalCode: '3300064',
    address: '埼玉県さいたま市浦和区岸町4-4-4',
    birthDate: '1992-03-18',
    gender: '2',
    saitamaAppId: 'SA003456',
  },
};

export default function UserEdit() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [formData, setFormData] = useState<UserFormData>({
    nickname: '',
    email: '',
    postalCode: '',
    address: '',
    birthDate: '',
    gender: '',
    saitamaAppId: '',
  });

  const [errors, setErrors] = useState<Partial<UserFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 実際はAPIからユーザーデータを取得
    const userData = sampleUserData[userId];
    if (userData) {
      setFormData(userData);
    }
    setIsLoading(false);
  }, [userId]);

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // リアルタイムバリデーション
    validateField(field, value);
  };

  const validateField = (field: keyof UserFormData, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'nickname':
        if (!value.trim()) {
          newErrors.nickname = '入力してください';
        } else {
          delete newErrors.nickname;
        }
        break;

      case 'email':
        if (!value.trim()) {
          newErrors.email = '入力してください';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'メールアドレスの形式が正しくありません';
        } else {
          delete newErrors.email;
        }
        break;

      case 'postalCode':
        if (!value.trim()) {
          newErrors.postalCode = '入力してください';
        } else if (value.length !== 7 || !/^\d{7}$/.test(value)) {
          newErrors.postalCode = '7桁で入力してください';
        } else {
          delete newErrors.postalCode;
        }
        break;

      case 'birthDate':
        if (!value.trim()) {
          newErrors.birthDate = '入力してください';
        } else if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          newErrors.birthDate = '日付の形式が正しくありません';
        } else {
          delete newErrors.birthDate;
        }
        break;

      case 'gender':
        if (!value) {
          newErrors.gender = '選択してください';
        } else {
          delete newErrors.gender;
        }
        break;
    }

    setErrors(newErrors);
  };

  const validateAllFields = (): boolean => {
    const newErrors: Partial<UserFormData> = {};

    // 必須チェック
    if (!formData.nickname.trim()) newErrors.nickname = '入力してください';
    if (!formData.email.trim()) newErrors.email = '入力してください';
    if (!formData.postalCode.trim()) newErrors.postalCode = '入力してください';
    if (!formData.birthDate.trim()) newErrors.birthDate = '入力してください';
    if (!formData.gender) newErrors.gender = '選択してください';

    // フォーマットチェック
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'メールアドレスの形式が正しくありません';
    }

    if (formData.postalCode && (formData.postalCode.length !== 7 || !/^\d{7}$/.test(formData.postalCode))) {
      newErrors.postalCode = '7桁で入力してください';
    }

    if (formData.birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(formData.birthDate)) {
      newErrors.birthDate = '日付の形式が正しくありません';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddressSearch = () => {
    // 郵便番号の存在チェック
    if (formData.postalCode.length !== 7) {
      alert('郵便番号を正しく入力してください（7桁の数字）');
      return;
    }

    fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${formData.postalCode}`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 200 && data.results && data.results.length > 0) {
          const result = data.results[0];
          const fullAddress = `${result.address1}${result.address2}${result.address3}`;
          setFormData(prev => ({
            ...prev,
            address: fullAddress
          }));
          alert('住所を取得しました');
        } else {
          const newErrors = { ...errors };
          newErrors.postalCode = '入力された郵便番号は存在しません';
          setErrors(newErrors);
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
    if (validateAllFields()) {
      // 編集確認画面に遷移
      const queryParams = new URLSearchParams({
        id: userId,
        nickname: formData.nickname,
        email: formData.email,
        postalCode: formData.postalCode,
        address: formData.address,
        birthDate: formData.birthDate,
        gender: formData.gender,
        saitamaAppId: formData.saitamaAppId,
      });
      
      router.push(`/users/${userId}/confirm?${queryParams.toString()}`);
    } else {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/users');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">データを読み込んでいます...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ページタイトル */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">ユーザー編集</h1>
            <p className="text-gray-600">
              ユーザー情報を編集します
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

        {/* 編集フォーム */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-6">
            {/* ニックネーム */}
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
                ニックネーム <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nickname"
                placeholder="ニックネームを入力"
                value={formData.nickname}
                onChange={(e) => handleInputChange('nickname', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.nickname ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.nickname && (
                <p className="mt-1 text-sm text-red-500">{errors.nickname}</p>
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
                placeholder="メールアドレスを入力"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
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

            {/* 住所 */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                住所 <span className="text-red-500">*</span>
              </label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                {formData.address || '住所検索結果を表示'}
              </div>
            </div>

            {/* 生年月日 */}
            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
                生年月日 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="birthDate"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.birthDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.birthDate && (
                <p className="mt-1 text-sm text-red-500">{errors.birthDate}</p>
              )}
            </div>

            {/* 性別 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                性別 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="1"
                    checked={formData.gender === '1'}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="mr-2 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">男性</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="2"
                    checked={formData.gender === '2'}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="mr-2 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">女性</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="3"
                    checked={formData.gender === '3'}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="mr-2 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">未回答</span>
                </label>
              </div>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-500">{errors.gender}</p>
              )}
            </div>

            {/* さいたま市みんなのアプリID */}
            <div>
              <label htmlFor="saitamaAppId" className="block text-sm font-medium text-gray-700 mb-2">
                さいたま市みんなのアプリID
              </label>
              <input
                type="text"
                id="saitamaAppId"
                placeholder="アプリIDを入力"
                value={formData.saitamaAppId}
                onChange={(e) => handleInputChange('saitamaAppId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* アクションボタン */}
            <div className="flex justify-center space-x-4 pt-6">
              <Button
                variant="outline"
                size="lg"
                onClick={handleCancel}
                className="px-8"
              >
                キャンセル
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8"
              >
                {isSubmitting ? '処理中...' : '変更内容を確認する'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}