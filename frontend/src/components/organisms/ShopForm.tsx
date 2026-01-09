'use client';

import dynamicImport from 'next/dynamic';
import { useParams } from 'next/navigation';
import Button from '@/components/atoms/Button';
import ToastContainer from '@/components/molecules/toast-container';
import ErrorMessage from '@/components/atoms/ErrorMessage';
import { useShopForm } from '@/hooks/useShopForm';
import { PREFECTURES, WEEKDAYS, HOLIDAY_SPECIAL_OPTIONS, SAITAMA_WARDS } from '@/lib/constants/japan';
import { SMOKING_OPTIONS, SERVICE_OPTIONS } from '@/lib/constants/shop';
import type { ExtendedShopCreateRequest } from '@/types/shop';

const MerchantSelectModal = dynamicImport(() => import('@/components/molecules/MerchantSelectModal'), {
  loading: () => null,
  ssr: false,
});

const PaymentMethodSelector = dynamicImport(() => import('@/components/molecules/PaymentMethodSelector'), {
  loading: () => null,
  ssr: false,
});

const SceneSelector = dynamicImport(() => import('@/components/molecules/SceneSelector'), {
  loading: () => null,
  ssr: false,
});

const ImageUploader = dynamicImport(() => import('@/components/molecules/ImageUploader'), {
  loading: () => null,
  ssr: false,
});

const AccountSection = dynamicImport(() => import('@/components/molecules/AccountSection'), {
  loading: () => null,
  ssr: false,
});

const QRCodeGenerator = dynamicImport(() => import('@/components/molecules/QRCodeGenerator'), {
  loading: () => null,
  ssr: false,
});

interface ShopFormProps {
  merchantId?: string;
}

export default function ShopForm({ merchantId: propMerchantId }: ShopFormProps = {}) {
  const params = useParams();
  const merchantIdFromParams = params.id as string;

  const {
    formData,
    selectedScenes,
    customSceneText,
    selectedCreditBrands,
    customCreditText,
    selectedQrBrands,
    customQrText,
    selectedHolidays,
    customHolidayText,
    selectedServices,
    genres,
    scenes,
    merchantName,
    isLoading,
    isSubmitting,
    isMerchantModalOpen,
    error,
    validationErrors,
    hasExistingAccount,
    existingImages,
    imagePreviews,
    qrCodeUrl,
    qrCodeLoading,
    isEdit,
    shopId,
    isMerchantAccount,
    isShopAccount,
    isSearchingAddress,
    handleInputChange,
    handleFieldBlur,
    handleMerchantSelect,
    handleCopyFromMerchant,
    handleZipcodeSearch,
    handleCoordinatesPaste,
    openGoogleMapsForAddress,
    handleSubmit,
    handleCancel,
    handleLoadQrCode,
    setIsMerchantModalOpen,
    setSelectedScenes,
    setCustomSceneText,
    setSelectedCreditBrands,
    setCustomCreditText,
    setSelectedQrBrands,
    setCustomQrText,
    setSelectedHolidays,
    setCustomHolidayText,
    setSelectedServices,
    handleImageSelect,
    handleRemoveImage,
    handleRemoveExistingImage,
    setValidationErrors,
    setTouchedFields,
    toasts,
    removeToast,
    showSuccess,
  } = useShopForm({ merchantId: propMerchantId || merchantIdFromParams });

  if (error) {
    return (
      <div className="space-y-6">
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-red-600">{error}</div>
          <Button variant="secondary" onClick={handleCancel} className="mt-4">
            店舗一覧に戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      {/* 加盟店選択モーダル */}
      <MerchantSelectModal
        isOpen={isMerchantModalOpen}
        onClose={() => setIsMerchantModalOpen(false)}
        onSelect={handleMerchantSelect}
        selectedMerchantId={formData.merchantId}
      />

      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? '店舗編集' : '新規店舗登録'}
        </h1>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-500">データを読み込み中...</p>
          </div>
        </div>
      ) : (
        <form
          noValidate
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* 基本情報 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
            <div className="space-y-4">
              {/* shopアカウントの場合は事業者名セクションを非表示 */}
              {!isShopAccount && (
                <div className="w-full" data-field="merchantId">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    事業者名 <span className="text-red-500">*</span>
                  </label>
                  {isMerchantAccount ? (
                    // 事業者アカウントの場合は事業者名を固定表示（親事業者からコピーボタン付き）
                    <div>
                      <div className="text-gray-900 mb-2">
                        {merchantName || '読み込み中...'}
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyFromMerchant}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        親事業者からコピー
                      </button>
                    </div>
                  ) : merchantName ? (
                    <div>
                      <div className="text-gray-900 mb-2">
                        {merchantName}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsMerchantModalOpen(true)}
                          className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                          title="事業者を変更"
                        >
                          事業者を変更
                        </button>
                        <button
                          type="button"
                          onClick={handleCopyFromMerchant}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          親事業者からコピー
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsMerchantModalOpen(true);
                            setTouchedFields((prev: Record<string, boolean>) => ({
                              ...prev,
                              merchantId: true,
                            }));
                            setValidationErrors((prev: Record<string, string>) => {
                              const newErrors = { ...prev };
                              delete newErrors.merchantId;
                              return newErrors;
                            });
                          }}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                          title="事業者を選択"
                        >
                          事業者を選択
                        </button>
                        <button
                          type="button"
                          onClick={handleCopyFromMerchant}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          親事業者からコピー
                        </button>
                      </div>
                      <ErrorMessage message={validationErrors.merchantId} />
                    </div>
                  )}
                </div>
              )}

              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  店舗名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  onBlur={(e) => handleFieldBlur('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.name
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  maxLength={100}
                  required
                />
                <ErrorMessage message={validationErrors.name} field="name" />
                <p className="mt-1 text-xs text-gray-500 text-right">
                  {formData.name.length} / 100文字
                </p>
              </div>

              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  店舗名（カナ）
                </label>
                <input
                  type="text"
                  name="nameKana"
                  value={formData.nameKana}
                  onChange={(e) => handleInputChange('nameKana', e.target.value)}
                  onBlur={(e) => handleFieldBlur('nameKana', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.nameKana
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  maxLength={100}
                  placeholder="例: タマノミショクドウ"
                />
                <ErrorMessage message={validationErrors.nameKana} />
                <p className="mt-1 text-xs text-gray-500 text-right">
                  {(formData.nameKana || '').length} / 100文字
                </p>
              </div>

              <div className="w-1/4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  店舗電話番号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    handleInputChange('phone', value);
                  }}
                  onBlur={(e) => handleFieldBlur('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.phone
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  required
                  placeholder="例: 0312345678（ハイフンなし）"
                  maxLength={11}
                />
                <ErrorMessage message={validationErrors.phone} />
              </div>

              {/* 郵便番号と住所検索 */}
              <div className="flex gap-4">
                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    郵便番号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      handleInputChange('postalCode', value);
                    }}
                    onBlur={(e) => handleFieldBlur('postalCode', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleZipcodeSearch();
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.postalCode
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    placeholder="1234567"
                    maxLength={7}
                    required
                  />
                  <ErrorMessage message={validationErrors.postalCode} />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  都道府県 <span className="text-red-500">*</span>
                </label>
                <select
                  name="prefecture"
                  value={formData.prefecture}
                  onChange={(e) => handleInputChange('prefecture', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.prefecture
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  required
                >
                  <option value="">都道府県を選択</option>
                  {PREFECTURES.map(pref => (
                    <option key={pref} value={pref}>{pref}</option>
                  ))}
                </select>
                <ErrorMessage message={validationErrors.prefecture} />
              </div>

              {/* 市区町村 */}
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  市区町村 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.city
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  placeholder="市区町村を入力してください"
                  required
                />
                <ErrorMessage message={validationErrors.city} />
              </div>

              {/* 番地以降 */}
              <div className="max-w-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  番地以降 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address1"
                  value={formData.address1}
                  onChange={(e) => handleInputChange('address1', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.address1
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  placeholder="番地以降を入力してください"
                  required
                />
                <ErrorMessage message={validationErrors.address1} />
              </div>

              {/* 建物名 / 部屋番号 */}
              <div className="max-w-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  建物名 / 部屋番号
                </label>
                <input
                  type="text"
                  value={formData.address2}
                  onChange={(e) => handleInputChange('address2', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="建物名 / 部屋番号を入力してください（任意）"
                />
              </div>

              {/* 対象エリア */}
              <div className="max-w-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  対象エリア
                </label>
                <div className="flex flex-wrap gap-3">
                  {SAITAMA_WARDS.map((area) => (
                    <label key={area} className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="area"
                        value={area}
                        checked={formData.area === area}
                        onChange={(e) => handleInputChange('area', e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{area}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 緯度・経度 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  緯度・経度 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 items-start">
                  <div className="w-48">
                    <input
                      type="text"
                      name="latitude"
                      value={formData.latitude}
                      onChange={(e) => handleInputChange('latitude', e.target.value)}
                      onBlur={(e) => handleFieldBlur('latitude', e.target.value)}
                      onPaste={handleCoordinatesPaste}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.latitude
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      placeholder="緯度（例: 35.681236）"
                      required
                    />
                    <ErrorMessage message={validationErrors.latitude} field="latitude" />
                  </div>
                  <div className="w-48">
                    <input
                      type="text"
                      name="longitude"
                      value={formData.longitude}
                      onChange={(e) => handleInputChange('longitude', e.target.value)}
                      onBlur={(e) => handleFieldBlur('longitude', e.target.value)}
                      onPaste={handleCoordinatesPaste}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.longitude
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      placeholder="経度（例: 139.767125）"
                      required
                    />
                    <ErrorMessage message={validationErrors.longitude} field="longitude" />
                  </div>
                  <button
                    type="button"
                    onClick={openGoogleMapsForAddress}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
                  >
                    地図で確認
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <p className="font-semibold mb-1">座標取得手順：</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>「地図で確認」ボタンをクリック</li>
                    <li>Google Mapで<span className="font-semibold text-gray-700">検索ボタンをクリック</span>してピンを表示</li>
                    <li>地図上で場所を右クリック → 緯度経度をコピー</li>
                    <li>緯度または経度欄に貼り付け（カンマ区切りで自動的に分割されます）</li>
                  </ol>
                </div>
                {formData.latitude && formData.longitude && (
                  <div className="mt-2">
                    <a
                      href={`https://www.google.com/maps/@${formData.latitude},${formData.longitude},21z/data=!3m1!1e3`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      入力された座標をGoogle Mapで確認
                    </a>
                  </div>
                )}
              </div>

              {/* ステータス（編集時のみ表示） */}
              {isEdit && (
                <div className="w-64">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ステータス
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="registering">登録中</option>
                    <option value="collection_requested">情報収集依頼済み</option>
                    <option value="approval_pending">承認待ち</option>
                    <option value="promotional_materials_preparing">宣材準備中</option>
                    <option value="promotional_materials_shipping">宣材発送中</option>
                    <option value="operating">営業中</option>
                    <option value="suspended">停止中</option>
                    <option value="terminated">終了</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* ジャンル */}
          <div className="bg-white rounded-lg shadow p-6" data-field="genreId">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ジャンル <span className="text-red-500">*</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {genres.map((genre) => (
                <label
                  key={genre.id}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="genreId"
                    value={genre.id}
                    checked={formData.genreId === genre.id}
                    onChange={(e) => handleInputChange('genreId', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    required
                  />
                  <span className="text-sm text-gray-700">{genre.name}</span>
                </label>
              ))}
            </div>
            <ErrorMessage message={validationErrors.genreId} field="genreId" />
          </div>

          {/* 利用シーン */}
          <SceneSelector
            scenes={scenes}
            selectedScenes={selectedScenes}
            customSceneText={customSceneText}
            validationErrors={validationErrors}
            onScenesChange={setSelectedScenes}
            onCustomTextChange={setCustomSceneText}
            onValidationErrorChange={(field, error) => {
              setValidationErrors(prev => {
                const newErrors = { ...prev };
                if (error === null) {
                  delete newErrors[field];
                } else {
                  newErrors[field] = error;
                }
                return newErrors;
              });
            }}
          />

          {/* 店舗紹介・詳細情報 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">店舗紹介・詳細情報</h2>
            <div className="space-y-6">
              {/* 店舗紹介説明 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  店舗紹介説明
                </label>
                <textarea
                  name="description"
                  value={formData.description ?? ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  maxLength={500}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.description
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  placeholder="例：アットホームな雰囲気の居酒屋です。新鮮な魚介類と地元の食材を使った料理が自慢です。"
                />
                <ErrorMessage message={validationErrors.description} />
                <p className="mt-1 text-xs text-gray-500 text-right">
                  {formData.description?.length || 0} / 500文字
                </p>
              </div>

              {/* 詳細情報 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  詳細情報
                </label>
                <textarea
                  name="details"
                  value={formData.details ?? ''}
                  onChange={(e) => handleInputChange('details', e.target.value)}
                  rows={6}
                  maxLength={1000}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.details
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  placeholder="【営業時間】&#10;ランチ: 11:30-14:00（L.O. 13:30）&#10;ディナー: 17:00-23:00（L.O. 22:00）&#10;&#10;【予算】&#10;ランチ: ¥1,000〜¥1,500&#10;ディナー: ¥3,000〜¥5,000"
                />
                <ErrorMessage message={validationErrors.details} />
                <p className="mt-1 text-xs text-gray-500 text-right">
                  {formData.details?.length || 0} / 1000文字
                </p>
              </div>

              {/* 定休日 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  定休日
                </label>
                <div className="flex flex-wrap gap-4">
                  {WEEKDAYS.map((day) => (
                    <label key={day} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedHolidays.includes(day)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedHolidays([...selectedHolidays, day]);
                          } else {
                            setSelectedHolidays(selectedHolidays.filter(h => h !== day));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{day === '祝日' ? day : `${day}曜日`}</span>
                    </label>
                  ))}
                </div>
                {/* 特殊オプション（不定休・その他） */}
                <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-gray-200">
                  {HOLIDAY_SPECIAL_OPTIONS.map((option) => (
                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedHolidays.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedHolidays([...selectedHolidays, option]);
                          } else {
                            setSelectedHolidays(selectedHolidays.filter(h => h !== option));
                            if (option === 'その他') {
                              setCustomHolidayText('');
                              setValidationErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.customHolidayText;
                                return newErrors;
                              });
                            }
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {/* 「その他」選択時のテキスト入力 */}
                {selectedHolidays.includes('その他') && (
                  <div className="mt-3">
                    <input
                      type="text"
                      name="customHolidayText"
                      value={customHolidayText}
                      onChange={(e) => {
                        setCustomHolidayText(e.target.value);
                        if (e.target.value.trim()) {
                          setValidationErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.customHolidayText;
                            return newErrors;
                          });
                        }
                      }}
                      placeholder="例: 年末年始、お盆休み、第2・4水曜日など"
                      maxLength={100}
                      className={`w-full max-w-md px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.customHolidayText
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                        }`}
                    />
                    <ErrorMessage message={validationErrors.customHolidayText} />
                    <p className="mt-1 text-xs text-gray-500 text-right max-w-md">
                      {customHolidayText.length} / 100文字
                    </p>
                  </div>
                )}
              </div>

              {/* ホームページURL（任意） */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ホームページURL
                </label>
                <input
                  type="url"
                  name="homepageUrl"
                  value={formData.homepageUrl || ''}
                  onChange={(e) => handleInputChange('homepageUrl', e.target.value)}
                  onBlur={(e) => handleFieldBlur('homepageUrl', e.target.value)}
                  placeholder="https://example.com"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.homepageUrl
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                    }`}
                />
                <ErrorMessage message={validationErrors.homepageUrl} field="homepageUrl" />
              </div>

              {/* クーポン利用時間（任意、開始・終了） */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  クーポン利用時間
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    name="couponUsageStart"
                    value={formData.couponUsageStart || ''}
                    onChange={(e) => handleInputChange('couponUsageStart', e.target.value)}
                    onBlur={(e) => handleFieldBlur('couponUsageStart', e.target.value)}
                    className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.couponUsageStart
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                      }`}
                  />
                  <span className="text-gray-500">〜</span>
                  <input
                    type="time"
                    name="couponUsageEnd"
                    value={formData.couponUsageEnd || ''}
                    onChange={(e) => handleInputChange('couponUsageEnd', e.target.value)}
                    onBlur={(e) => handleFieldBlur('couponUsageEnd', e.target.value)}
                    className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.couponUsageEnd
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                      }`}
                  />
                </div>
                {(validationErrors.couponUsageStart || validationErrors.couponUsageEnd) && (
                  <ErrorMessage
                    message={validationErrors.couponUsageStart || validationErrors.couponUsageEnd}
                    field="couponUsage"
                  />
                )}
                <p className="mt-1 text-xs text-gray-500">両方入力するか、両方未入力にしてください</p>
              </div>

              {/* クーポン利用可能曜日 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  クーポン利用可能曜日
                </label>
                <div className="flex flex-wrap gap-3">
                  {WEEKDAYS.filter(d => d !== '祝日').map((day) => (
                    <label key={day} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.couponUsageDays?.includes(day) || false}
                        onChange={(e) => {
                          const current = formData.couponUsageDays?.split(',').filter(Boolean) || [];
                          const updated = e.target.checked
                            ? [...current, day]
                            : current.filter(d => d !== day);
                          handleInputChange('couponUsageDays', updated.join(','));
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{day}曜日</span>
                    </label>
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-500">クーポンを利用できる曜日を選択してください（任意）</p>
              </div>

              {/* 喫煙タイプ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  喫煙タイプ <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-4">
                  {SMOKING_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="smokingType"
                        value={opt.value}
                        checked={formData.smokingType === opt.value}
                        onChange={(e) => handleInputChange('smokingType', e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
                <ErrorMessage message={validationErrors.smokingType} field="smokingType" />
              </div>

              {/* サービス情報 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  サービス情報
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {SERVICE_OPTIONS.map((service) => (
                    <label key={service} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        value={service}
                        checked={selectedServices.includes(service)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedServices([...selectedServices, service]);
                          } else {
                            setSelectedServices(selectedServices.filter(s => s !== service));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{service}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 決済情報 */}
          <PaymentMethodSelector
            paymentCash={formData.paymentCash ?? false}
            paymentSaicoin={formData.paymentSaicoin ?? false}
            paymentTamapon={formData.paymentTamapon ?? false}
            selectedCreditBrands={selectedCreditBrands}
            customCreditText={customCreditText}
            selectedQrBrands={selectedQrBrands}
            customQrText={customQrText}
            validationErrors={validationErrors}
            onPaymentChange={(field, value) => handleInputChange(field, value)}
            onCreditBrandsChange={setSelectedCreditBrands}
            onCreditTextChange={setCustomCreditText}
            onQrBrandsChange={setSelectedQrBrands}
            onQrTextChange={setCustomQrText}
            onValidationErrorChange={(field, error) => {
              setValidationErrors(prev => {
                const newErrors = { ...prev };
                if (error === null) {
                  delete newErrors[field];
                } else {
                  newErrors[field] = error;
                }
                return newErrors;
              });
            }}
          />

          {/* 店舗画像 */}
          <ImageUploader
            imagePreviews={imagePreviews}
            existingImages={existingImages}
            maxImages={3}
            onImageSelect={handleImageSelect}
            onRemoveImage={handleRemoveImage}
            onRemoveExistingImage={handleRemoveExistingImage}
          />

          {/* QRコード表示（編集モードのみ） */}
          {isEdit && shopId && (
            <QRCodeGenerator
              qrCodeLoading={qrCodeLoading}
              qrCodeUrl={qrCodeUrl || ''}
              shopId={shopId}
              showSuccess={showSuccess}
              onLoadRequest={handleLoadQrCode}
            />
          )}

          {/* 担当者情報 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">担当者情報</h2>
            <div className="space-y-4">
              {/* 担当者名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  担当者名
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName || ''}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  onBlur={(e) => handleFieldBlur('contactName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.contactName
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  placeholder="担当者名を入力してください (任意)"
                  maxLength={100}
                />
                <ErrorMessage message={validationErrors.contactName} />
                <p className="mt-1 text-xs text-gray-500 text-right">
                  {(formData.contactName || '').length} / 100文字
                </p>
              </div>

              {/* 担当者電話番号 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  担当者電話番号
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    handleInputChange('contactPhone', value);
                  }}
                  onBlur={(e) => handleFieldBlur('contactPhone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.contactPhone
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  placeholder="担当者電話番号を入力してください (任意)"
                  maxLength={11}
                />
                <ErrorMessage message={validationErrors.contactPhone} />
              </div>

              {/* 担当者メールアドレス */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  担当者メールアドレス
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail || ''}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  onBlur={(e) => handleFieldBlur('contactEmail', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.contactEmail
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  placeholder="担当者メールアドレスを入力してください (任意)"
                />
                <ErrorMessage message={validationErrors.contactEmail} />
              </div>
            </div>
          </div>

          {/* アカウント発行 / 店舗用アカウント情報 */}
          <AccountSection
            isEdit={isEdit}
            hasExistingAccount={hasExistingAccount}
            createAccount={formData.createAccount ?? false}
            accountEmail={formData.accountEmail || ''}
            password={formData.password || ''}
            validationErrors={validationErrors}
            onCreateAccountChange={(value) => handleInputChange('createAccount', value)}
            onAccountEmailChange={(value) => handleInputChange('accountEmail', value)}
            onPasswordChange={(value) => handleInputChange('password', value)}
            onValidationErrorChange={(field, error) => {
              setValidationErrors(prev => {
                const newErrors = { ...prev };
                if (error === null) {
                  delete newErrors[field];
                } else {
                  newErrors[field] = error;
                }
                return newErrors;
              });
            }}
            onFieldBlur={(field, value) => handleFieldBlur(field as keyof ExtendedShopCreateRequest, value)}
            onDeleteAccountChange={isShopAccount ? undefined : (deleteAccount) => {
              if (deleteAccount) {
                handleInputChange('createAccount', false);
              }
            }}
          />

          {/* ボタン */}
          <div className="flex justify-center items-center">
            <div className="flex space-x-3">
              <Button type="button" variant="outline" onClick={handleCancel}>
                キャンセル
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? '処理中...' : (isEdit ? '更新内容を確認する' : '登録内容を確認する')}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
