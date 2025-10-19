'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/atoms/Button';
import ToastContainer from '@/components/molecules/toast-container';
import MerchantSelectModal from '@/components/molecules/MerchantSelectModal';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/contexts/auth-context';
import type { ShopCreateRequest } from '@hv-development/schemas';
import { shopCreateRequestSchema, shopUpdateRequestSchema, isValidEmail, isValidPhone, isValidPostalCode, isValidKana } from '@hv-development/schemas';
import { CREDIT_CARD_BRANDS, QR_PAYMENT_SERVICES } from '@/lib/constants/payment';

// 都道府県リスト
const prefectures = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
  '岐阜県', '静岡県', '愛知県', '三重県',
  '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県',
  '沖縄県'
];

interface Merchant {
  id: string;
  name: string;
  applications?: string[];
  account: {
    email: string;
  };
}

interface ShopDataResponse extends ShopCreateRequest {
  accountEmail?: string;
  merchant?: {
    id: string;
    name: string;
  };
  images?: string[];
}

interface Genre {
  id: string;
  name: string;
  sortOrder: number;
}

interface Scene {
  id: string;
  name: string;
  sortOrder: number;
}

interface ImagePreview {
  file: File;
  url: string;
}

interface ShopFormProps {
  merchantId?: string;
}

// エラーメッセージコンポーネント
const ErrorMessage = ({ message, field }: { message?: string; field?: string }) => {
  // デバッグ用：エラーメッセージが渡された時のみログ出力
  if (message) {
    console.log(`🔴 ErrorMessage表示 [${field || 'unknown'}]:`, message);
  }
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-600">{message}</p>;
};

export default function ShopForm({ merchantId: propMerchantId }: ShopFormProps = {}) {
  const params = useParams();
  const router = useRouter();
  const auth = useAuth();
  
  // 会社アカウントかどうかを判定
  const isMerchantAccount = auth?.user?.accountType === 'merchant';
  
  // shopIdの取得（編集時のみ存在）
  // /merchants/[id]/shops/[shopId]/edit -> params.shopId
  // /shops/[id]/edit -> params.id（merchantId未指定の場合）
  const shopId = (params.shopId || (!propMerchantId ? params.id : undefined)) as string | undefined;
  const merchantIdFromParams = params.id as string;
  const isEdit = !!shopId;
  
  // merchantIdの決定（props > URLパラメータ）
  const merchantId = propMerchantId || merchantIdFromParams;
  
  const [formData, setFormData] = useState<ShopCreateRequest>({
    merchantId: merchantId || '',
    genreId: '',
    accountEmail: '',
    name: '',
    nameKana: '',
    phone: '',
    postalCode: '',
    prefecture: '',
    city: '',
    address1: '',
    address2: '',
    address: '',
    latitude: '',
    longitude: '',
    description: '',
    details: '',
    holidays: '',
    smokingType: '',
    paymentSaicoin: false,
    paymentTamapon: false,
    paymentCash: true,
    paymentCredit: '',
    paymentCode: '',
    status: 'registering',
    applications: [],
    createAccount: false,
    password: '',
  });
  
  // 親Merchantのapplications
  const [merchantApplications, setMerchantApplications] = useState<string[]>([]);
  
  // 利用シーンの複数選択用
  const [selectedScenes, setSelectedScenes] = useState<string[]>([]);
  const [customSceneText, setCustomSceneText] = useState<string>('');
  
  // 決済方法の複数選択用
  const [selectedCreditBrands, setSelectedCreditBrands] = useState<string[]>([]);
  const [customCreditText, setCustomCreditText] = useState<string>('');
  const [selectedQrBrands, setSelectedQrBrands] = useState<string[]>([]);
  const [customQrText, setCustomQrText] = useState<string>('');
  
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [merchantName, setMerchantName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [isMerchantModalOpen, setIsMerchantModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toasts, removeToast, showSuccess, showError } = useToast();
  
  // バリデーションエラー用のステート
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // フィールドが触られたかを追跡（初期表示時は必須エラーを表示しない）
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  
  // デバッグ用：validationErrorsの変更を監視
  useEffect(() => {
    console.log('🔄 validationErrors更新:', validationErrors);
    console.log('🔄 エラー件数:', Object.keys(validationErrors).length);
    if (Object.keys(validationErrors).length > 0) {
      console.log('🔄 エラーキー:', Object.keys(validationErrors));
      console.log('🔄 エラー内容:', validationErrors);
    }
  }, [validationErrors]);
  
  // デバッグ用：merchantApplicationsの変更を監視
  useEffect(() => {
    console.log('📱 merchantApplications更新:', {
      length: merchantApplications.length,
      values: merchantApplications,
      shouldShow: merchantApplications.length > 1
    });
  }, [merchantApplications]);
  
  // 既存のアカウントがあるかどうか（API取得時の初期データで判定）
  const [hasExistingAccount, setHasExistingAccount] = useState(false);
  
  // 画像関連
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  
  // 定休日チェックボックス用
  const weekdays = ['月', '火', '水', '木', '金', '土', '日', '祝日'] as const;
  const [selectedHolidays, setSelectedHolidays] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 会社アカウントの場合、自分の会社情報を取得してmerchantIdと会社名を設定
        if (isMerchantAccount) {
          try {
            const myMerchantData = await apiClient.getMyMerchant();
            if (!isMounted) return;
            
            if (myMerchantData && typeof myMerchantData === 'object' && 'data' in myMerchantData && myMerchantData.data) {
              const merchant = myMerchantData.data as any;
              
              // merchantIdがまだ設定されていない場合のみ設定
              if (!merchantId) {
                setFormData(prev => ({
                  ...prev,
                  merchantId: merchant.id,
                  // 親が1つのapplicationの場合は自動設定
                  applications: merchant.applications?.length === 1 ? merchant.applications : []
                }));
              }
              // 会社名は常に設定
              setMerchantName(merchant.name);
              // 親のapplicationsを保存
              setMerchantApplications(merchant.applications || []);
            }
          } catch (error) {
            console.error('会社情報の取得に失敗しました:', error);
          }
        }
        
        // 加盟店一覧を取得（管理者アカウントの場合のみ）
        let merchantsArray: Merchant[] = [];
        if (!isMerchantAccount) {
          const merchantsData = await apiClient.getMerchants();
        
          // コンポーネントがアンマウントされている場合は処理を中断
          if (!isMounted) return;
          
          console.log('🏢 Merchants data received:', { 
            merchantsData, 
            isArray: Array.isArray(merchantsData),
            hasData: merchantsData && typeof merchantsData === 'object' && 'data' in merchantsData,
            hasMerchants: merchantsData && typeof merchantsData === 'object' && 'merchants' in merchantsData
          });
          
          if (Array.isArray(merchantsData)) {
            merchantsArray = merchantsData as Merchant[];
          } else if (merchantsData && typeof merchantsData === 'object') {
            // 新しいAPIレスポンス形式: {success: true, data: {merchants: [...], pagination: {...}}}
            if ('data' in merchantsData && merchantsData.data && typeof merchantsData.data === 'object' && 'merchants' in merchantsData.data) {
              merchantsArray = ((merchantsData.data as { merchants: Merchant[] }).merchants || []) as Merchant[];
            }
            // 古いAPIレスポンス形式: {merchants: [...], pagination: {...}}
            else if ('merchants' in merchantsData) {
              merchantsArray = ((merchantsData as { merchants: Merchant[] }).merchants || []) as Merchant[];
            }
          }
          
          console.log('🏢 Processed merchants array:', { 
            merchantsArray, 
            length: merchantsArray.length,
            firstMerchant: merchantsArray[0] || 'no merchants',
            firstMerchantApplications: merchantsArray[0]?.applications
          });
          
          setMerchants(merchantsArray);
        }
        
        // ジャンル一覧を取得
        const genresData = await apiClient.getGenres();
        if (!isMounted) return;
        
        const genresArray = Array.isArray(genresData) ? genresData : (genresData as { genres: unknown[] }).genres || [];
        setGenres(genresArray);
        
        // 利用シーン一覧を取得
        const scenesData = await apiClient.getScenes();
        if (!isMounted) return;
        
        const scenesArray = Array.isArray(scenesData) ? scenesData : (scenesData as { scenes: unknown[] }).scenes || [];
        setScenes(scenesArray);
        
        // 編集モードの場合は店舗データを取得
        if (isEdit && isMounted) {
          const shopData = await apiClient.getShop(shopId) as ShopDataResponse;
          console.log('📦 Shop data received:', shopData);
          console.log('🆔 Shop merchantId:', shopData.merchantId);
          
          if (isMounted) {
            // merchantIdがpropsで渡されている場合は上書きしない
            const finalMerchantId = merchantId || shopData.merchantId;
            console.log('🔑 Final merchant ID:', { merchantId, shopDataMerchantId: shopData.merchantId, finalMerchantId });
            
            // accountEmailが存在する場合、createAccountをtrueに設定
            const accountEmail = shopData.accountEmail;
            setHasExistingAccount(!!accountEmail); // 既存アカウントの有無を記録
            setFormData({
              ...shopData,
              merchantId: finalMerchantId,
              createAccount: !!accountEmail, // accountEmailが存在する場合はcreateAccountをtrueに
              // latitude/longitudeを文字列に変換
              latitude: shopData.latitude ? String(shopData.latitude) : '',
              longitude: shopData.longitude ? String(shopData.longitude) : '',
            });
            
            // 編集モード時は必須フィールドを最初から touched として設定
            // これにより、初期値を削除した際にエラーメッセージが表示される
            setTouchedFields({
              name: true,
              accountEmail: !!accountEmail, // アカウント発行時のみ
              phone: true,
              postalCode: true,
            });
            
            // 加盟店名を設定（APIレスポンスから直接取得）
            const merchantFromShop = shopData.merchant;
            console.log('🏢 Merchant from shop data:', merchantFromShop);
            
            if (merchantFromShop?.name) {
              // APIレスポンスにmerchant情報が含まれている場合はそれを使用
              setMerchantName(merchantFromShop.name);
              console.log('✅ Merchant name set from shop data:', merchantFromShop.name);
            } else {
              // fallback: merchants配列から検索
              const merchant = merchantsArray.find(m => m.id === finalMerchantId);
              console.log('🔍 Searching in merchants array:', { 
                finalMerchantId, 
                merchant, 
                merchantsCount: merchantsArray.length,
                allMerchantIds: merchantsArray.map(m => m.id)
              });
              if (merchant) {
                setMerchantName(merchant.name);
                console.log('✅ Merchant name set from array:', merchant.name);
              } else {
                console.error('❌ Merchant not found for ID:', finalMerchantId);
              }
            }
            
            // 既存画像の設定
            if (shopData.images && Array.isArray(shopData.images)) {
              const validImages = shopData.images.filter(img => img && typeof img === 'string' && img.length > 0);
              setExistingImages(validImages);
              console.log('🖼️ Setting existing images:', validImages);
              if (validImages.length !== shopData.images.length) {
                console.warn('⚠️ Some invalid images were filtered out:', shopData.images);
              }
            }
            
            // クレジットカードブランドの設定（JSON形式から読み込み）
            const shopDataWithPayment = shopData as ShopCreateRequest & { paymentCredit?: any; paymentCode?: any };
            const creditValue = shopDataWithPayment.paymentCredit;
            console.log('💳 Credit value from API:', creditValue);
            if (creditValue) {
              // JSONオブジェクトとして扱う
              if (typeof creditValue === 'object' && creditValue.brands) {
                const brands = [...creditValue.brands];
                if (creditValue.other) {
                  brands.push('その他');
                  setCustomCreditText(creditValue.other);
                }
                setSelectedCreditBrands(brands);
                console.log('💳 Credit brands set:', brands, 'custom:', creditValue.other);
              } else if (typeof creditValue === 'string') {
                // 旧形式（カンマ区切り）のフォールバック
                const brands = creditValue.split(',').map((b: string) => b.trim());
                setSelectedCreditBrands(brands);
              }
            }
            
            // QRコード決済の設定（JSON形式から読み込み）
            const qrValue = shopDataWithPayment.paymentCode;
            console.log('📱 QR value from API:', qrValue);
            if (qrValue) {
              // JSONオブジェクトとして扱う
              if (typeof qrValue === 'object' && qrValue.services) {
                const services = [...qrValue.services];
                if (qrValue.other) {
                  services.push('その他');
                  setCustomQrText(qrValue.other);
                }
                setSelectedQrBrands(services);
                console.log('📱 QR services set:', services, 'custom:', qrValue.other);
              } else if (typeof qrValue === 'string') {
                // 旧形式（カンマ区切り）のフォールバック
                const services = qrValue.split(',').map((s: string) => s.trim());
                setSelectedQrBrands(services);
              }
            }
            
            // 定休日の設定
            const holidaysValue = (shopData as ShopCreateRequest).holidays;
            if (holidaysValue && holidaysValue.trim()) {
              setSelectedHolidays(holidaysValue.split(',').map(h => h.trim()));
            }
            
            // 利用シーンの設定
            const shopDataWithScenes = shopData as ShopCreateRequest & { sceneIds?: string[]; customSceneText?: string };
            console.log('🎯 Scene data from API:', {
              sceneIds: shopDataWithScenes.sceneIds, 
              customSceneText: shopDataWithScenes.customSceneText,
              availableScenes: scenesArray.map(s => ({ id: s.id, name: s.name }))
            });
            if (shopDataWithScenes.sceneIds && Array.isArray(shopDataWithScenes.sceneIds)) {
              setSelectedScenes(shopDataWithScenes.sceneIds);
              console.log('✅ Selected scenes set:', shopDataWithScenes.sceneIds);
            } else {
              console.warn('⚠️ No sceneIds found in shop data');
            }
            
            // カスタム利用シーンテキストの設定
            if (shopDataWithScenes.customSceneText) {
              setCustomSceneText(shopDataWithScenes.customSceneText);
              console.log('✅ Custom scene text set:', shopDataWithScenes.customSceneText);
            }
            
            // 掲載サイト（applications）の設定
            const shopDataWithApplications = shopData as ShopCreateRequest & { applications?: string[] };
            if (shopDataWithApplications.applications && Array.isArray(shopDataWithApplications.applications)) {
              console.log('📱 Setting applications:', shopDataWithApplications.applications);
              // formDataのapplicationsはすでにsetFormDataで設定されているので、
              // 親会社のapplicationsも取得する
              if (merchantFromShop) {
                const parentMerchant = merchantsArray.find(m => m.id === finalMerchantId) as any;
                if (parentMerchant?.applications) {
                  setMerchantApplications(parentMerchant.applications);
                  console.log('📱 Parent merchant applications set:', parentMerchant.applications);
                }
              }
            }
          }
        } else if (merchantId && merchantsArray.length > 0 && isMounted) {
          // 新規作成モードで加盟店が指定されている場合
          const merchant = merchantsArray.find(m => m.id === merchantId);
          console.log('🏢 Setting merchant name (new mode):', { merchantId, merchant, merchantsCount: merchantsArray.length });
          if (merchant) {
            setMerchantName(merchant.name);
          }
        }
      } catch (err: unknown) {
        // アボート時のエラーは無視
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        
        if (isMounted) {
          console.error('Failed to fetch data:', err);
          setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
          showError('データの取得に失敗しました');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    // クリーンアップ: コンポーネントのアンマウント時または再実行時にリクエストをキャンセル
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [shopId, isEdit, merchantId, showError, isMerchantAccount]);

  // formData.merchantIdが変更されたときに加盟店名とaccountEmailを更新
  useEffect(() => {
    if (formData.merchantId && merchants.length > 0) {
      const merchant = merchants.find(m => m.id === formData.merchantId) as any;
      console.log('🔄 Updating merchant name from formData:', { 
        merchantId: formData.merchantId, 
        merchant, 
        merchantsCount: merchants.length,
        merchantApplications: merchant?.applications
      });
      if (merchant) {
        setMerchantName(merchant.name);
        // 親Merchantのapplicationsを設定
        const apps = merchant.applications || [];
        console.log('📱 Setting merchantApplications:', apps);
        setMerchantApplications(apps);
        // 親が1つのapplicationの場合は自動設定、複数の場合はリセット
        if (merchant.applications && merchant.applications.length === 1) {
          setFormData(prev => ({
            ...prev,
            applications: merchant.applications
          }));
        } else if (merchant.applications && merchant.applications.length > 1) {
          // 親が複数持つ場合は、現在選択されているアプリケーションが親のリストに含まれていない場合はリセット
          setFormData(prev => {
            const currentApp = prev.applications?.[0];
            if (currentApp && merchant.applications.includes(currentApp)) {
              // 現在の選択が有効な場合はそのまま
              return prev;
            }
            // 無効な場合はリセット
            return {
              ...prev,
              applications: []
            };
          });
        }
      }
    }
  }, [formData.merchantId, merchants]);

  // 加盟店選択ハンドラー
  const handleMerchantSelect = (merchant: Merchant) => {
    console.log('🏢 Merchant selected:', merchant);
    setFormData(prev => ({
      ...prev,
      merchantId: merchant.id,
    }));
    setMerchantName(merchant.name);
    // 会社を選択したことを記録
    setTouchedFields(prev => ({
      ...prev,
      merchantId: true,
    }));
    
    // 会社選択時のバリデーションエラーをクリア
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.merchantId;
      return newErrors;
    });
    
    setIsMerchantModalOpen(false);
  };

  const handleInputChange = (field: keyof ShopCreateRequest, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // フィールドが触られたことを記録（値が空でない、または既に触られている場合）
    if ((typeof value === 'string' && value.length > 0) || touchedFields[field]) {
      setTouchedFields((prev) => ({
        ...prev,
        [field]: true,
      }));
    }
    
    // 入力時にもバリデーションを実行
    validateField(field, value);
  };

  // onBlurイベントハンドラー（フィールドが触られたことを記録してバリデーション実行）
  const handleFieldBlur = (field: keyof ShopCreateRequest, value: string | boolean | number | undefined) => {
    // フィールドが触られたことを記録
    setTouchedFields((prev) => ({
      ...prev,
      [field]: true,
    }));
    
    // バリデーション実行
    validateField(field, value);
  };

  // 個別フィールドのバリデーション（入力時とblur時に実行）
  const validateField = (field: keyof ShopCreateRequest, value: string | boolean | number | undefined) => {
    let errorMessage = '';

    // フィールドごとのバリデーションロジック
    switch (field) {
      case 'name':
        // 必須チェックは触られたフィールドのみ
        if (touchedFields[field] && (!value || (typeof value === 'string' && value.trim().length === 0))) {
          errorMessage = '店舗名は必須です';
        } else if (typeof value === 'string' && value.length > 100) {
          errorMessage = '店舗名は100文字以内で入力してください';
        }
        break;

      case 'accountEmail':
        // アカウント発行時のみ必須
        if (formData.createAccount && !formData.accountEmail && touchedFields[field] && (!value || (typeof value === 'string' && value.trim().length === 0))) {
          errorMessage = 'メールアドレスは必須です';
        } else if (typeof value === 'string' && value.trim().length > 0 && !isValidEmail(value)) {
          errorMessage = '有効なメールアドレスを入力してください';
        }
        break;

      case 'phone':
        // 必須チェックは触られたフィールドのみ
        if (touchedFields[field] && (!value || (typeof value === 'string' && value.trim().length === 0))) {
          errorMessage = '電話番号は必須です';
        } else if (typeof value === 'string' && value.trim().length > 0 && !isValidPhone(value)) {
          errorMessage = '有効な電話番号を入力してください（10-11桁の数字）';
        }
        break;

      case 'postalCode':
        // 必須チェックは触られたフィールドのみ
        if (touchedFields[field] && (!value || (typeof value === 'string' && value.trim().length === 0))) {
          errorMessage = '郵便番号は必須です';
        } else if (typeof value === 'string' && value.trim().length > 0 && !isValidPostalCode(value)) {
          errorMessage = '郵便番号は7桁の数字で入力してください';
        }
        break;

      case 'nameKana':
        if (typeof value === 'string' && value.length > 100) {
          errorMessage = '店舗名（カナ）は100文字以内で入力してください';
        } else if (typeof value === 'string' && value.trim().length > 0 && !isValidKana(value)) {
          errorMessage = '店舗名（カナ）は全角カタカナで入力してください';
        }
        break;

      case 'description':
        if (typeof value === 'string' && value.length > 500) {
          errorMessage = '店舗紹介説明は500文字以内で入力してください';
        }
        break;

      case 'details':
        if (typeof value === 'string' && value.length > 1000) {
          errorMessage = '詳細情報は1000文字以内で入力してください';
        }
        break;

      case 'latitude':
        // 必須チェックは触られたフィールドのみ
        if (touchedFields[field] && (!value || (typeof value === 'string' && value.trim().length === 0))) {
          errorMessage = '緯度は必須です';
        }
        break;

      case 'longitude':
        // 必須チェックは触られたフィールドのみ
        if (touchedFields[field] && (!value || (typeof value === 'string' && value.trim().length === 0))) {
          errorMessage = '経度は必須です';
        }
        break;
    }

    // エラーメッセージの設定またはクリア
    if (errorMessage) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: errorMessage,
      }));
    } else {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 画像選択処理
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    console.log('🖼️ Selected files:', newFiles.length, newFiles.map(f => f.name));
    
    const totalImages = imagePreviews.length + existingImages.length + newFiles.length;
    console.log('📊 Total images:', { existing: existingImages.length, previews: imagePreviews.length, new: newFiles.length, total: totalImages });

    if (totalImages > 3) {
      showError('画像は最大3枚までアップロードできます');
      return;
    }

    const newPreviews: ImagePreview[] = [];
    newFiles.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        showError('画像ファイルのみアップロード可能です');
        return;
      }

      const url = URL.createObjectURL(file);
      newPreviews.push({ file, url });
    });

    console.log('✅ New previews created:', newPreviews.length);
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  // 画像削除処理（新規アップロード画像）
  const handleRemoveImage = (index: number) => {
    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index].url);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  // 既存画像削除処理
  const handleRemoveExistingImage = (index: number) => {
    const newExistingImages = [...existingImages];
    newExistingImages.splice(index, 1);
    setExistingImages(newExistingImages);
  };
  // 郵便番号から住所を検索（zipcloud API使用）
  const handleZipcodeSearch = async () => {
    if (!formData.postalCode || formData.postalCode.length !== 7) {
      showError('郵便番号を7桁で入力してください');
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
        
        // 自動入力されたフィールドのバリデーションエラーをクリア
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.prefecture;
          delete newErrors.city;
          delete newErrors.address1;
          return newErrors;
        });
        
        showSuccess('住所を取得しました');
      } else {
        showError('該当する住所が見つかりませんでした');
      }
    } catch (error) {
      console.error('住所検索エラー:', error);
      showError('住所検索に失敗しました');
    } finally {
      setIsSearchingAddress(false);
    }
  };

  // 緯度経度の貼り付けハンドラー（カンマ区切り対応）
  const handleCoordinatesPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    
    // カンマが含まれている場合は緯度経度として処理
    if (pastedText.includes(',')) {
      e.preventDefault(); // デフォルトの貼り付け動作を防ぐ
      
      const parts = pastedText.split(',').map(part => part.trim());
      if (parts.length === 2) {
        const [lat, lng] = parts;
        setFormData({
          ...formData,
          latitude: lat,
          longitude: lng
        });
        
        // 自動入力されたフィールドのバリデーションエラーをクリア
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.latitude;
          delete newErrors.longitude;
          return newErrors;
        });
        
        showSuccess('緯度経度を設定しました');
      }
    }
    // カンマがない場合は通常の貼り付け動作
  };

  // Google Mapで住所を開く（手動で緯度経度を確認）
  const openGoogleMapsForAddress = () => {
    const latitude = formData.latitude ? String(formData.latitude).trim() : '';
    const longitude = formData.longitude ? String(formData.longitude).trim() : '';
    
    // 緯度経度が両方入力されている場合は座標でピンを表示
    if (latitude && longitude) {
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      showSuccess('Google Mapで座標のピンを表示しました。');
      return;
    }
    
    // 緯度経度がない場合は住所で検索
    const _postalCode = formData.postalCode?.trim();
    const prefecture = formData.prefecture?.trim();
    const city = formData.city?.trim();
    const address1 = formData.address1?.trim();
    const address2 = formData.address2?.trim();
    
    if (!prefecture && !city && !address1) {
      showError('住所または緯度経度を入力してください');
      return;
    }
    
    // 住所を構築（郵便番号も含める）
    const addressParts = [
      _postalCode ? `〒${_postalCode}` : '',
      prefecture,
      city,
      address1,
      address2,
    ].filter(Boolean);
    
    const address = addressParts.join(' ');
    
    // Google Mapsで住所検索を開く（検索ボックスに入力された状態）
    const url = `https://www.google.com/maps?q=${encodeURIComponent(address)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    
    showSuccess('Google Mapを開きました。表示された検索ボタンをクリックしてピンを表示してください。');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 handleSubmit呼び出し開始');
    e.preventDefault();
    console.log('✅ preventDefault実行完了');
    
    try {
      console.log('✅ tryブロック開始');
      setIsSubmitting(true);
      console.log('✅ isSubmitting=true設定完了');
      
      // 送信前の総合バリデーション
      // クレジットカードとQRコードをJSON形式に変換
      const isCreditOtherSelected = selectedCreditBrands.includes('その他');
      const isQrOtherSelected = selectedQrBrands.includes('その他');
      
      const paymentCreditJson = selectedCreditBrands.length > 0 ? {
        brands: selectedCreditBrands.filter(b => b !== 'その他'),
        ...(isCreditOtherSelected && customCreditText && { other: customCreditText })
      } : null;
      
      const paymentCodeJson = selectedQrBrands.length > 0 ? {
        services: selectedQrBrands.filter(s => s !== 'その他'),
        ...(isQrOtherSelected && customQrText && { other: customQrText })
      } : null;
      
      const dataToValidate = {
        ...formData,
        // 空文字列の場合はnullに変換（zodのバリデーションに対応）
        accountEmail: formData.accountEmail || null,
        holidays: selectedHolidays.join(','),
        paymentCredit: paymentCreditJson,
        paymentCode: paymentCodeJson,
      };
      
      console.log('📝 バリデーション前のデータ:', dataToValidate);
      console.log('📧 accountEmail:', formData.accountEmail, '→', dataToValidate.accountEmail);
      console.log('🔍 formData全体:', formData);
      console.log('🔍 isMerchantAccount:', isMerchantAccount);
      console.log('🔍 isEdit:', isEdit);
      
      // Submit時は全フィールドのカスタムバリデーションを実行
      const customErrors: Record<string, string> = {};
      
      // 店舗名
      console.log('🔍 店舗名チェック:', { name: formData.name, isEmpty: !formData.name, isTrimEmpty: formData.name?.trim().length === 0 });
      if (!formData.name || formData.name.trim().length === 0) {
        console.log('❌ 店舗名エラー追加');
        customErrors.name = '店舗名は必須です';
      } else if (formData.name.length > 100) {
        customErrors.name = '店舗名は100文字以内で入力してください';
      }
      
      // 店舗名（カナ）
      if (formData.nameKana && formData.nameKana.length > 100) {
        customErrors.nameKana = '店舗名（カナ）は100文字以内で入力してください';
      } else if (formData.nameKana && formData.nameKana.trim().length > 0 && !isValidKana(formData.nameKana)) {
        customErrors.nameKana = '店舗名（カナ）は全角カタカナで入力してください';
      }
      
      // 電話番号
      console.log('🔍 電話番号チェック:', { phone: formData.phone, isEmpty: !formData.phone, isTrimEmpty: formData.phone?.trim().length === 0 });
      if (!formData.phone || formData.phone.trim().length === 0) {
        console.log('❌ 電話番号エラー追加');
        customErrors.phone = '電話番号は必須です';
      } else if (!isValidPhone(formData.phone)) {
        customErrors.phone = '有効な電話番号を入力してください（10-11桁の数字）';
      }
      
      // 郵便番号
      console.log('🔍 郵便番号チェック:', { postalCode: formData.postalCode, isEmpty: !formData.postalCode });
      if (!formData.postalCode || formData.postalCode.trim().length === 0) {
        console.log('❌ 郵便番号エラー追加');
        customErrors.postalCode = '郵便番号は必須です';
      } else if (!isValidPostalCode(formData.postalCode)) {
        customErrors.postalCode = '郵便番号は7桁の数字で入力してください';
      }
      
      // 都道府県
      console.log('🔍 都道府県チェック:', { prefecture: formData.prefecture, isEmpty: !formData.prefecture });
      if (!formData.prefecture || formData.prefecture.trim().length === 0) {
        console.log('❌ 都道府県エラー追加');
        customErrors.prefecture = '都道府県を選択してください';
      }
      
      // 市区町村
      console.log('🔍 市区町村チェック:', { city: formData.city, isEmpty: !formData.city });
      if (!formData.city || formData.city.trim().length === 0) {
        console.log('❌ 市区町村エラー追加');
        customErrors.city = '市区町村は必須です';
      }
      
      // 番地以降
      console.log('🔍 番地チェック:', { address1: formData.address1, isEmpty: !formData.address1 });
      if (!formData.address1 || formData.address1.trim().length === 0) {
        console.log('❌ 番地エラー追加');
        customErrors.address1 = '番地以降は必須です';
      }
      
      // 緯度
      console.log('🔍 緯度チェック:', { latitude: formData.latitude, isEmpty: !formData.latitude });
      if (!formData.latitude || String(formData.latitude).trim().length === 0) {
        console.log('❌ 緯度エラー追加');
        customErrors.latitude = '緯度は必須です';
      }

      // 経度
      console.log('🔍 経度チェック:', { longitude: formData.longitude, isEmpty: !formData.longitude });
      if (!formData.longitude || String(formData.longitude).trim().length === 0) {
        console.log('❌ 経度エラー追加');
        customErrors.longitude = '経度は必須です';
      }
      
      // ジャンル
      console.log('🔍 ジャンルチェック:', { genreId: formData.genreId, isEmpty: !formData.genreId });
      if (!formData.genreId || formData.genreId.trim().length === 0) {
        console.log('❌ ジャンルエラー追加');
        customErrors.genreId = 'ジャンルを選択してください';
      }
      
      // 会社（管理者アカウントの場合のみ）
      console.log('🔍 会社チェック:', { isMerchantAccount, merchantId: formData.merchantId, isEmpty: !formData.merchantId });
      if (!isMerchantAccount && (!formData.merchantId || formData.merchantId.trim().length === 0)) {
        console.log('❌ 会社エラー追加');
        customErrors.merchantId = '会社を選択してください';
      }
      
      // 掲載サイト（親会社が複数のアプリケーションを持つ場合）
      console.log('🔍 掲載サイトチェック:', { applications: formData.applications, merchantApplications, parentAppsLength: merchantApplications.length });
      if (merchantApplications.length > 1 && (!formData.applications || formData.applications.length === 0)) {
        console.log('❌ 掲載サイトエラー追加');
        customErrors.applications = '掲載サイトを選択してください';
      }
      
      // アカウント情報（アカウント発行時のみ）
      if (formData.createAccount) {
        if (!formData.accountEmail || formData.accountEmail.trim().length === 0) {
          customErrors.accountEmail = 'メールアドレスは必須です';
        } else if (!isValidEmail(formData.accountEmail)) {
          customErrors.accountEmail = '有効なメールアドレスを入力してください';
        }
        
        // 新規登録時のみパスワード必須
        if (!isEdit && (!formData.password || formData.password.trim().length === 0)) {
          customErrors.password = 'パスワードは必須です';
        } else if (!isEdit && formData.password && formData.password.length < 8) {
          customErrors.password = 'パスワードは8文字以上で入力してください';
        }
      }
      
      // 説明文
      if (formData.description && formData.description.length > 500) {
        customErrors.description = '店舗紹介説明は500文字以内で入力してください';
      }
      
      // 詳細情報
      if (formData.details && formData.details.length > 1000) {
        customErrors.details = '詳細情報は1000文字以内で入力してください';
      }
      
      // カスタムエラーがある場合は表示して終了
      if (Object.keys(customErrors).length > 0) {
        console.log('❌ カスタムバリデーションエラー:', customErrors);
        console.log('❌ エラー件数:', Object.keys(customErrors).length);
        console.log('❌ エラーキー:', Object.keys(customErrors));
        
        // エラーをstateに設定
        setValidationErrors(customErrors);
        showError('入力内容に誤りがあります。各項目を確認してください。');
        setIsSubmitting(false);
        
        // エラー設定後、次のレンダリングサイクルでスクロール
        setTimeout(() => {
          console.log('🔍 validationErrors設定後、スクロール実行');
          
          // 最初のエラー項目にスクロール
          const firstErrorField = Object.keys(customErrors)[0];
          if (firstErrorField) {
            console.log('🎯 最初のエラーフィールド:', firstErrorField);
            
            // フィールド名から対応するinput要素を探す
            const errorElement = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
            if (errorElement) {
              console.log('✅ エラー要素が見つかりました:', errorElement);
              
              // input要素の親要素（ラベルを含むコンテナ）を見つけてスクロール
              const fieldContainer = errorElement.closest('div') as HTMLElement;
              if (fieldContainer) {
                fieldContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
              } else {
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
              // フォーカスはinput要素に当てる
              errorElement.focus();
            } else {
              console.log('❌ name属性の要素が見つからない。data-field属性で検索:', firstErrorField);
              // name属性がない場合は、idやdata属性で検索
              const errorSection = document.querySelector(`[data-field="${firstErrorField}"]`) as HTMLElement;
              if (errorSection) {
                console.log('✅ data-field要素が見つかりました:', errorSection);
                errorSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
              } else {
                console.log('❌ data-field要素も見つかりませんでした');
              }
            }
          }
        }, 100);
        
        return;
      }
      
      // Zodバリデーションも実行（追加チェック用）
      const schema = isEdit ? shopUpdateRequestSchema : shopCreateRequestSchema;
      const validationResult = schema.safeParse(dataToValidate);
      
      if (!validationResult.success) {
        const zodErrors: Record<string, string> = {};
        validationResult.error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!zodErrors[path]) {
            zodErrors[path] = err.message;
          }
        });
        
        console.log('❌ Zodバリデーションエラー:', zodErrors);
        console.log('📝 送信しようとしたデータ:', dataToValidate);
        
        setValidationErrors(zodErrors);
        showError('入力内容に誤りがあります。各項目を確認してください。');
        setIsSubmitting(false);
        
        return;
      }
      
      // 画像をアップロード
      // 画像アップロード処理を関数化
      const uploadImages = async (targetShopId: string): Promise<string[]> => {
        console.log('📤 Starting image upload:', { count: imagePreviews.length, shopId: targetShopId });
        const uploadedImageUrls: string[] = [];
        
        if (imagePreviews.length > 0) {
          // 全画像で同じタイムスタンプを使用
          const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '').split('.')[0];
          console.log('📅 Using timestamp for all images:', timestamp);
          
          let index = 0;
          for (const preview of imagePreviews) {
            index++;
            console.log(`📤 Uploading image ${index}/${imagePreviews.length}:`, preview.file.name);
            
            const uploadFormData = new FormData();
            uploadFormData.append('image', preview.file);
            uploadFormData.append('type', 'shop');
            uploadFormData.append('merchantId', formData.merchantId);
            uploadFormData.append('shopId', targetShopId);
            uploadFormData.append('timestamp', timestamp); // 全画像で同じタイムスタンプを使用
            
            try {
              const response = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData,
              });
              
              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error(`❌ Upload failed for image ${index}:`, response.status, errorData);
                throw new Error('画像のアップロードに失敗しました');
              }
              
              const result = await response.json();
              console.log(`✅ Upload successful ${index}:`, result.url);
              uploadedImageUrls.push(result.url);
            } catch (uploadErr) {
              console.error(`❌ Image upload failed for ${index}:`, uploadErr);
              showError('画像のアップロードに失敗しました');
              throw uploadErr;
            }
          }
        }
        console.log('✅ All uploads complete:', uploadedImageUrls.length, 'images');
        return uploadedImageUrls;
      };
      
      let uploadedImageUrls: string[] = [];
      
      // 編集時のみ画像を先にアップロード
      if (isEdit && shopId) {
        uploadedImageUrls = await uploadImages(shopId);
      }
      
      // 住所フィールドを結合
      const fullAddress = [
        formData.prefecture,
        formData.city,
        formData.address1,
        formData.address2
      ].filter(Boolean).join('');
      
      // 画像URLを結合（既存画像 + 新規アップロード画像）
      const allImageUrls = [...existingImages, ...uploadedImageUrls];
      console.log('🖼️ All image URLs:', { existing: existingImages.length, uploaded: uploadedImageUrls.length, total: allImageUrls.length, urls: allImageUrls });
      
      // アカウントメールの設定
      let accountEmail: string | null | undefined;
      if (formData.createAccount) {
        // アカウント発行チェックがONの場合
        accountEmail = formData.accountEmail || null;
      } else {
        // アカウント発行チェックがOFFの場合はnullに設定（アカウント無効化）
        accountEmail = null;
      }
      
      // 「その他」シーンのIDを取得
      const otherScene = scenes.find(s => s.name === 'その他');
      const isOtherSceneSelected = otherScene && selectedScenes.includes(otherScene.id);
      
      // クレジットカードとQRコードをJSON形式で送信データに追加
      const submitData = {
        ...formData,
        accountEmail,
        address: fullAddress,  // 結合した住所
        // latitude/longitudeを文字列に変換
        latitude: formData.latitude ? String(formData.latitude) : undefined,
        longitude: formData.longitude ? String(formData.longitude) : undefined,
        images: allImageUrls,  // 画像削除時にも空配列を送信
        holidays: selectedHolidays.join(','),
        sceneIds: selectedScenes,  // 利用シーンの配列を追加
        customSceneText: isOtherSceneSelected ? customSceneText : undefined,  // 「その他」選択時のみ送信
        paymentCredit: paymentCreditJson,
        paymentCode: paymentCodeJson,
      };
      
      if (isEdit) {
        await apiClient.updateShop(shopId, submitData);
        showSuccess('店舗を更新しました');
      } else {
        // 新規作成時は店舗を先に作成
        const createdShop = await apiClient.createShop(submitData) as { id: string };
        
        // 作成された店舗のIDを使って画像をアップロード
        if (imagePreviews.length > 0 && createdShop?.id) {
          const newUploadedImageUrls = await uploadImages(createdShop.id);
          
          // 画像をアップロードした場合は店舗を更新
          if (newUploadedImageUrls.length > 0) {
            await apiClient.updateShop(createdShop.id, {
              images: newUploadedImageUrls,
            });
          }
        }
        
        showSuccess('店舗を作成しました');
      }
      
      // リダイレクト先を決定
      const redirectPath = merchantId ? `/merchants/${merchantId}/shops` : '/shops';
      router.push(redirectPath);
    } catch (err: unknown) {
      console.error('Failed to save shop:', err);
      showError(isEdit ? '店舗更新に失敗しました' : '店舗作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // リダイレクト先を決定
    const redirectPath = merchantId ? `/merchants/${merchantId}/shops` : '/shops';
    router.push(redirectPath);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

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

      <form 
        noValidate
        onSubmit={(e) => {
          console.log('📋 フォームのonSubmitイベント発火');
          handleSubmit(e);
        }} 
        className="space-y-6"
      >
        {/* 基本情報 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
          <div className="space-y-4">
            <div className="w-full" data-field="merchantId">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                会社名 <span className="text-red-500">*</span>
              </label>
              {isMerchantAccount ? (
                // 会社アカウントの場合は会社名を固定表示（設定ボタンなし）
                <div className="text-gray-900">
                  {merchantName || '読み込み中...'}
                </div>
              ) : (propMerchantId || merchantIdFromParams) ? (
                <div>
                  <div className="text-gray-900 mb-2">
                    {merchantName || '読み込み中...'}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMerchantModalOpen(true)}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                    title="会社を変更"
                  >
                    設定
                  </button>
                </div>
              ) : (
                <div>
                  {merchantName ? (
                    <div>
                      <div className="text-gray-900 mb-2">
                        {merchantName}
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsMerchantModalOpen(true)}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                        title="会社を変更"
                      >
                        設定
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMerchantModalOpen(true);
                        // モーダルを開いたことをタッチとして記録
                        setTouchedFields(prev => ({
                          ...prev,
                          merchantId: true,
                        }));
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                      title="会社を選択"
                    >
                      会社を選択
                    </button>
                  )}
                  <ErrorMessage message={validationErrors.merchantId} />
                </div>
              )}
            </div>
            
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  validationErrors.name 
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  validationErrors.nameKana 
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
                電話番号 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => {
                  // 数値のみ許可
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  handleInputChange('phone', value);
                }}
                onBlur={(e) => handleFieldBlur('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  validationErrors.phone 
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
                    // 数値のみ許可
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    handleInputChange('postalCode', value);
                  }}
                  onBlur={(e) => handleFieldBlur('postalCode', e.target.value)}
                  onKeyDown={(e) => {
                    // Enterキーが押された場合は住所検索を実行
                    if (e.key === 'Enter') {
                      e.preventDefault(); // フォーム送信を防ぐ
                      handleZipcodeSearch();
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    validationErrors.postalCode 
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  validationErrors.prefecture 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                required
              >
                <option value="">都道府県を選択</option>
                {prefectures.map(pref => (
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  validationErrors.city 
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  validationErrors.address1 
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
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      validationErrors.latitude 
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
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      validationErrors.longitude 
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
                    href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
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

        {/* 掲載サイト（親が複数持つ場合のみ表示） */}
        {merchantApplications.length > 1 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">掲載サイト <span className="text-red-500">*</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {merchantApplications.map((app) => (
                <label
                  key={app}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="application"
                    value={app}
                    checked={(formData.applications?.length === 1 && formData.applications[0] === app) || false}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        applications: [e.target.value as "tamanomi" | "nomoca_kagawa"]
                      }));
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {app === 'tamanomi' ? 'たまのみ' : app === 'nomoca_kagawa' ? 'のもかかがわ' : app}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              ※ 親会社で設定されたアプリケーションの中から1つ選択してください
            </p>
            <ErrorMessage message={validationErrors.applications} field="applications" />
          </div>
        )}

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
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">利用シーン（複数選択可）</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {scenes.map((scene) => (
              <label
                key={scene.id}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={scene.id}
                  checked={selectedScenes.includes(scene.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedScenes([...selectedScenes, scene.id]);
                    } else {
                      setSelectedScenes(selectedScenes.filter(id => id !== scene.id));
                      // 「その他」のチェックを外したらカスタムテキストもクリア
                      if (scene.name === 'その他') {
                        setCustomSceneText('');
                      }
                    }
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{scene.name}</span>
              </label>
            ))}
          </div>
          
          {/* 「その他」選択時のカスタムテキスト入力欄 */}
          {scenes.find(s => s.name === 'その他' && selectedScenes.includes(s.id)) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                具体的な利用シーン <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customSceneText}
                onChange={(e) => setCustomSceneText(e.target.value)}
                maxLength={100}
                placeholder="例：ビジネスミーティング、記念日など"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                「その他」を選択した場合は、具体的な利用シーンを入力してください（最大100文字）
              </p>
            </div>
          )}
        </div>

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
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                maxLength={500}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  validationErrors.description 
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
                value={formData.details}
                onChange={(e) => handleInputChange('details', e.target.value)}
                rows={6}
                maxLength={1000}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  validationErrors.details 
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
                {weekdays.map((day) => (
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
            </div>
            
            {/* 喫煙タイプ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                喫煙タイプ
              </label>
              <div className="flex flex-wrap gap-4">
                {['禁煙', '分煙', '喫煙可'].map((type) => (
                  <label key={type} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="smokingType"
                      value={type}
                      checked={formData.smokingType === type}
                      onChange={(e) => handleInputChange('smokingType', e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 決済情報 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">決済情報</h2>
          
          <div className="space-y-6">
            {/* 現金決済 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                現金決済
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentCash"
                    checked={formData.paymentCash === true}
                    onChange={() => handleInputChange('paymentCash', true)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900">可</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentCash"
                    checked={formData.paymentCash === false}
                    onChange={() => handleInputChange('paymentCash', false)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900">不可</span>
                </label>
              </div>
            </div>

            {/* さいコイン決済 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                さいコイン決済
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentSaicoin"
                    checked={formData.paymentSaicoin === true}
                    onChange={() => handleInputChange('paymentSaicoin', true)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900">可</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentSaicoin"
                    checked={formData.paymentSaicoin === false}
                    onChange={() => handleInputChange('paymentSaicoin', false)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900">不可</span>
                </label>
              </div>
            </div>

            {/* たまポン決済 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                たまポン決済
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentTamapon"
                    checked={formData.paymentTamapon === true}
                    onChange={() => handleInputChange('paymentTamapon', true)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900">可</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentTamapon"
                    checked={formData.paymentTamapon === false}
                    onChange={() => handleInputChange('paymentTamapon', false)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900">不可</span>
                </label>
              </div>
            </div>

            {/* クレジットカード決済 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                クレジットカード決済（複数選択可）
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {CREDIT_CARD_BRANDS.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={brand}
                      checked={selectedCreditBrands.includes(brand)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCreditBrands([...selectedCreditBrands, brand]);
                        } else {
                          setSelectedCreditBrands(selectedCreditBrands.filter(b => b !== brand));
                          // 「その他」のチェックを外したらカスタムテキストもクリア
                          if (brand === 'その他') {
                            setCustomCreditText('');
                          }
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{brand}</span>
                  </label>
                ))}
              </div>
              
              {/* 「その他」選択時のカスタムテキスト入力欄 */}
              {selectedCreditBrands.includes('その他') && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    その他のクレジットカードブランド <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customCreditText}
                    onChange={(e) => setCustomCreditText(e.target.value)}
                    maxLength={100}
                    placeholder="例：銀聯カード、Discoverなど"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    「その他」を選択した場合は、具体的なブランド名を入力してください（最大100文字）
                  </p>
                </div>
              )}
            </div>

            {/* QRコード決済 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QRコード決済（複数選択可）
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {QR_PAYMENT_SERVICES.map((service) => (
                  <label
                    key={service}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={service}
                      checked={selectedQrBrands.includes(service)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedQrBrands([...selectedQrBrands, service]);
                        } else {
                          setSelectedQrBrands(selectedQrBrands.filter(s => s !== service));
                          // 「その他」のチェックを外したらカスタムテキストもクリア
                          if (service === 'その他') {
                            setCustomQrText('');
                          }
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{service}</span>
                  </label>
                ))}
              </div>
              
              {/* 「その他」選択時のカスタムテキスト入力欄 */}
              {selectedQrBrands.includes('その他') && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    その他のQRコード決済サービス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customQrText}
                    onChange={(e) => setCustomQrText(e.target.value)}
                    maxLength={100}
                    placeholder="例：Alipay、WeChat Payなど"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    「その他」を選択した場合は、具体的なサービス名を入力してください（最大100文字）
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 店舗画像 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">店舗画像（最大3枚）</h2>
          <div className="space-y-4">
            {/* 既存画像の表示 */}
            {existingImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  現在登録されている画像
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {existingImages.map((imageUrl, index) => {
                    if (!imageUrl || typeof imageUrl !== 'string') {
                      console.warn('⚠️ Invalid image URL at index', index, ':', imageUrl);
                      return null;
                    }
                    console.log('🖼️ Rendering existing image:', imageUrl);
                    return (
                      <div key={index} className="relative group">
                        <div className="relative w-full aspect-[3/2] rounded-md overflow-hidden border border-gray-300 bg-gray-100">
                          <img
                            src={imageUrl}
                            alt={`店舗画像 ${index + 1}`}
                            className="absolute inset-0 w-full h-full object-cover"
                            onLoad={() => {
                              console.log('✅ Image loaded successfully:', imageUrl);
                            }}
                            onError={(e) => {
                              console.error('❌ 画像の読み込みに失敗しました:', imageUrl);
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                const errorMsg = document.createElement('div');
                                errorMsg.className = 'absolute inset-0 flex items-center justify-center text-xs text-red-500';
                                errorMsg.textContent = '画像を読み込めません';
                                parent.appendChild(errorMsg);
                              }
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 新規アップロード画像のプレビュー */}
            {imagePreviews.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  新しくアップロードする画像
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="relative w-full aspect-[3/2] rounded-md overflow-hidden border border-gray-300 bg-gray-100">
                        <img
                          src={preview.url}
                          alt={`プレビュー ${index + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 画像アップロードボタン */}
            {(imagePreviews.length + existingImages.length) < 3 && (
              <div>
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                    id="shop-image-upload"
                  />
                  <label
                    htmlFor="shop-image-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    画像を選択
                  </label>
                </label>
                <p className="mt-2 text-sm text-gray-500">
                  PNG, JPG, WEBP形式の画像をアップロードできます（残り {3 - (imagePreviews.length + existingImages.length)} 枚）
                </p>
              </div>
            )}
          </div>
        </div>

        {/* アカウント発行 / 店舗用アカウント情報 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {isEdit && hasExistingAccount ? '店舗用アカウント情報' : 'アカウント発行'}
          </h2>
          <div className="space-y-4">
            {/* アカウント未発行の場合：発行チェックボックスを表示 */}
            {!(isEdit && hasExistingAccount) && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="createAccount"
                    checked={!!formData.createAccount}
                    onChange={(e) => handleInputChange('createAccount', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="createAccount" className="text-sm font-medium text-gray-700">
                    店舗用アカウントを発行する
                  </label>
                </div>
                <p className="ml-6 text-xs text-gray-500">
                  ※ チェックを入れるとアカウントが発行され、店舗側でログインできるようになります
                </p>
              </div>
            )}
            
            {/* アカウント情報入力・表示 */}
            {(formData.createAccount || (isEdit && hasExistingAccount)) && (
              <>
                {/* メールアドレス */}
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス
                    {!(isEdit && hasExistingAccount) && <span className="text-red-500">*</span>}
                  </label>
                  {isEdit && hasExistingAccount ? (
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
                      {formData.accountEmail}
                    </div>
                  ) : (
                    <>
                      <input
                        type="email"
                        name="accountEmail"
                        value={formData.accountEmail || ''}
                        onChange={(e) => handleInputChange('accountEmail', e.target.value)}
                        onBlur={(e) => handleFieldBlur('accountEmail', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                          validationErrors.accountEmail 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        required={formData.createAccount && !formData.accountEmail}
                        placeholder="例: shop@example.com"
              />
              <ErrorMessage message={validationErrors.accountEmail} field="accountEmail" />
                    </>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    ※ このメールアドレスがログインIDになります
                  </p>
                </div>
                
                {/* パスワード設定 */}
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    パスワード
                    {!(isEdit && hasExistingAccount) && <span className="text-red-500">*</span>}
                    {isEdit && hasExistingAccount && '（変更する場合のみ）'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      validationErrors.password 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    required={formData.createAccount && !(isEdit && hasExistingAccount)}
                    placeholder={isEdit && hasExistingAccount ? '新しいパスワード（8文字以上）' : '8文字以上'}
                    minLength={8}
                  />
                  <ErrorMessage message={validationErrors.password} />
                  <p className="mt-1 text-xs text-gray-500">
                    {isEdit && hasExistingAccount 
                      ? '※ パスワードを変更しない場合は空欄のままにしてください'
                      : '※ メールアドレス宛にパスワード設定メールが送信されます'
                    }
                  </p>
                </div>
                
                {/* アカウント発行済みの場合：削除チェックボックスを表示 */}
                {isEdit && hasExistingAccount && (
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="deleteAccount"
                        checked={!formData.createAccount}
                        onChange={(e) => handleInputChange('createAccount', !e.target.checked)}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <label htmlFor="deleteAccount" className="text-sm font-medium text-red-600">
                        アカウントを削除する
                      </label>
                    </div>
                    <p className="ml-6 text-xs text-gray-500">
                      ※ チェックを入れるとアカウントが無効になり、店舗側でログインできなくなります
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ボタン */}
        <div className="flex justify-between items-center">
          {isEdit && (
            <Button 
              type="button" 
              variant="secondary"
              onClick={async () => {
                if (confirm('この店舗を削除しますか？この操作は取り消せません。')) {
                  try {
                    await apiClient.deleteShop(shopId);
                    showSuccess('店舗を削除しました');
                    const redirectPath = merchantId ? `/merchants/${merchantId}/shops` : '/shops';
                    router.push(redirectPath);
                  } catch (_error) {
                    showError('店舗削除に失敗しました');
                  }
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              削除
            </Button>
          )}
          <div className={`flex space-x-3 ${!isEdit ? 'ml-auto' : ''}`}>
            <Button type="button" variant="secondary" onClick={handleCancel}>
              キャンセル
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={isSubmitting}
              onClick={() => console.log('🔘 送信ボタンがクリックされました', { isSubmitting, isEdit })}
            >
              {isSubmitting ? '保存中...' : (isEdit ? '更新' : '作成')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
