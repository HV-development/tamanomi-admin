'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/contexts/auth-context';
import type { ShopCreateRequest, UseShopFormOptions, UseShopFormReturn } from '@hv-development/schemas';
import { shopCreateRequestSchema, shopUpdateRequestSchema, isValidEmail, isValidPhone, isValidPostalCode, isValidKana } from '@hv-development/schemas';
import { useAddressSearch, applyAddressSearchResult } from '@/hooks/use-address-search';
import { useShopValidation } from '@/hooks/useShopValidation';
import { useImageUpload } from '@/hooks/useImageUpload';
import { compressImageFile } from '@/utils/imageUtils';
import type { Merchant, ShopDataResponse, Genre, Scene, ExtendedShopCreateRequest } from '@/types/shop';
import type { ToastData } from '@/components/molecules/toast-container';

// 具体的な型パラメータを使用した型エイリアス
export type UseShopFormReturnTyped = UseShopFormReturn<
  ExtendedShopCreateRequest,
  Merchant,
  Genre,
  Scene,
  ToastData
>;

const collectAccountEmailEntries = (data: unknown): Array<{ shopId: string; email: string }> => {
  const entries: Array<{ shopId: string; email: string }> = [];
  const appendFromArray = (shops: Array<{ id?: unknown; accountEmail?: unknown }>) => {
    shops.forEach((shop) => {
      if (shop && typeof shop === 'object') {
        const id = typeof shop.id === 'string' ? shop.id : null;
        const email = typeof shop.accountEmail === 'string' ? shop.accountEmail : null;
        if (id && email) {
          entries.push({ shopId: id, email });
        }
      }
    });
  };

  if (Array.isArray(data)) {
    appendFromArray(data as Array<{ id?: string; accountEmail?: string }>);
    return entries;
  }

  if (data && typeof data === 'object') {
    const raw = data as { shops?: unknown; data?: unknown };
    if (Array.isArray(raw.shops)) {
      appendFromArray(raw.shops as Array<{ id?: string; accountEmail?: string }>);
    }
    if (raw.data && typeof raw.data === 'object') {
      const inner = raw.data as { shops?: unknown };
      if (Array.isArray(inner.shops)) {
        appendFromArray(inner.shops as Array<{ id?: string; accountEmail?: string }>);
      }
    }
  }

  return entries;
};

export function useShopForm({ merchantId: propMerchantId }: UseShopFormOptions = {}): UseShopFormReturnTyped {
  const params = useParams();
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const auth = useAuth();

  // アカウントタイプ判定
  const isMerchantAccount = useMemo(
    () => auth?.user?.accountType === 'merchant',
    [auth?.user?.accountType]
  );

  const isAdminAccount = useMemo(
    () => auth?.user?.accountType === 'admin',
    [auth?.user?.accountType]
  );

  const isShopAccount = useMemo(
    () => auth?.user?.accountType === 'shop',
    [auth?.user?.accountType]
  );

  // shopIdの取得（編集時のみ存在）
  const shopId = useMemo(
    () => (params.shopId || (!propMerchantId ? params.id : undefined)) as string | undefined,
    [params.shopId, params.id, propMerchantId]
  );

  const merchantIdFromParams = useMemo(
    () => params.id as string,
    [params.id]
  );

  const isEdit = useMemo(() => !!shopId, [shopId]);

  // merchantIdの決定（props > URLパラメータ）
  const merchantId = useMemo(
    () => propMerchantId || merchantIdFromParams,
    [propMerchantId, merchantIdFromParams]
  );

  const returnToParam = searchParamsHook?.get('returnTo') || null;
  const decodedReturnTo = useMemo(() => {
    if (!returnToParam) return null;
    try {
      const decoded = decodeURIComponent(returnToParam);
      return decoded.startsWith('/') ? decoded : `/${decoded}`;
    } catch {
      return returnToParam.startsWith('/') ? returnToParam : `/${returnToParam}`;
    }
  }, [returnToParam]);

  const fallbackRedirect = useMemo(() => {
    if (decodedReturnTo) {
      return decodedReturnTo;
    }
    if (isMerchantAccount && merchantId) {
      return `/merchants/${merchantId}/shops`;
    }
    return '/shops';
  }, [decodedReturnTo, isMerchantAccount, merchantId]);

  const [formData, setFormData] = useState<ExtendedShopCreateRequest>({
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
    smokingType: undefined,
    homepageUrl: '',
    couponUsageStart: '',
    couponUsageEnd: '',
    couponUsageDays: '',
    paymentSaicoin: false,
    paymentTamapon: false,
    paymentCash: true,
    paymentCredit: '',
    paymentCode: '',
    area: '',
    status: 'registering',
    createAccount: false,
    password: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
  });

  const [selectedScenes, setSelectedScenes] = useState<string[]>([]);
  const [customSceneText, setCustomSceneText] = useState<string>('');
  const [selectedCreditBrands, setSelectedCreditBrands] = useState<string[]>([]);
  const [customCreditText, setCustomCreditText] = useState<string>('');
  const [selectedQrBrands, setSelectedQrBrands] = useState<string[]>([]);
  const [customQrText, setCustomQrText] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customServicesText, setCustomServicesText] = useState<string>('');
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [selectedMerchantDetails, setSelectedMerchantDetails] = useState<Merchant | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [merchantName, setMerchantName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMerchantModalOpen, setIsMerchantModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const [existingAccountEmails, setExistingAccountEmails] = useState<Array<{ shopId: string; email: string }>>([]);
  const [originalAccountEmail, setOriginalAccountEmail] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [qrCodeLoading, setQrCodeLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [hasExistingAccount, setHasExistingAccount] = useState(false);

  const {
    imagePreviews,
    existingImages,
    setExistingImages,
    handleImageSelect,
    handleRemoveImage,
    handleRemoveExistingImage,
  } = useImageUpload({ maxImages: 3 });

  const [selectedHolidays, setSelectedHolidays] = useState<string[]>([]);
  const [customHolidayText, setCustomHolidayText] = useState<string>('');

  const { validateField } = useShopValidation({
    formData,
    touchedFields,
    isEdit,
    setValidationErrors,
  });

  const isAccountEmailDuplicate = useCallback((email: string): boolean => {
    const normalized = email.trim().toLowerCase();
    return existingAccountEmails.some((entry) => {
      if (entry.email.trim().toLowerCase() !== normalized) {
        return false;
      }
      if (isEdit && shopId) {
        return entry.shopId !== shopId;
      }
      return true;
    });
  }, [existingAccountEmails, isEdit, shopId]);

  const { isSearching: isSearchingAddress, searchAddress } = useAddressSearch(
    (result) => {
      setFormData(prev => {
        const addressResult = applyAddressSearchResult(prev, result);
        return {
          ...prev,
          ...addressResult
        };
      });
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.prefecture;
        delete newErrors.city;
        delete newErrors.address1;
        return newErrors;
      });
      showSuccess('住所を取得しました');
    },
    (error) => {
      showError(error);
    }
  );

  // データ取得
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const promises: Promise<unknown>[] = [];

        let myMerchantPromise: Promise<unknown> | null = null;
        if (isMerchantAccount) {
          myMerchantPromise = apiClient.getMyMerchant();
          promises.push(myMerchantPromise);
        }

        let merchantsPromise: Promise<unknown> | null = null;
        if (isAdminAccount) {
          merchantsPromise = apiClient.getMerchants();
          promises.push(merchantsPromise);
        }

        const genresPromise = apiClient.getGenres();
        const scenesPromise = apiClient.getScenes();
        promises.push(genresPromise, scenesPromise);

        let shopPromise: Promise<unknown> | null = null;
        if (isEdit && shopId) {
          shopPromise = apiClient.getShop(shopId);
          promises.push(shopPromise);
        }

        const results = await Promise.allSettled(promises);
        if (!isMounted) return;

        let resultIndex = 0;
        let merchantsArray: Merchant[] = [];

        if (isMerchantAccount && myMerchantPromise) {
          const result = results[resultIndex++];
          if (result.status === 'fulfilled') {
            const myMerchantData = result.value;
            if (myMerchantData && typeof myMerchantData === 'object' && 'data' in myMerchantData && myMerchantData.data) {
              const merchant = myMerchantData.data as Merchant;
              if (!merchantId) {
                setFormData((prev) => ({
                  ...prev,
                  merchantId: merchant.id,
                }));
              }
              setMerchantName(merchant.name);
              setMerchants([merchant]);
              setSelectedMerchantDetails(merchant);
            }
          } else {
            console.error('事業者情報の取得に失敗しました:', result.reason);
            showError('事業者情報の取得に失敗しました');
          }
        }

        if (isAdminAccount && merchantsPromise) {
          const result = results[resultIndex++];
          if (result.status === 'fulfilled') {
            const merchantsData = result.value;
            if (Array.isArray(merchantsData)) {
              merchantsArray = merchantsData as Merchant[];
            } else if (merchantsData && typeof merchantsData === 'object') {
              if ('data' in merchantsData && merchantsData.data && typeof merchantsData.data === 'object' && 'merchants' in merchantsData.data) {
                merchantsArray = ((merchantsData.data as { merchants: Merchant[] }).merchants || []) as Merchant[];
              } else if ('merchants' in merchantsData) {
                merchantsArray = ((merchantsData as { merchants: Merchant[] }).merchants || []) as Merchant[];
              }
            }
            setMerchants(merchantsArray);
          } else {
            console.error('加盟店一覧の取得に失敗しました:', result.reason);
            showError('加盟店一覧の取得に失敗しました');
          }
        }

        const genresResult = results[resultIndex++];
        if (genresResult.status === 'fulfilled') {
          const genresData = genresResult.value;
          const genresArray = Array.isArray(genresData) ? genresData : (genresData as { genres: unknown[] }).genres || [];
          setGenres(genresArray);
        } else {
          console.error('ジャンル一覧の取得に失敗しました:', genresResult.reason);
          showError('ジャンル一覧の取得に失敗しました');
        }

        const scenesResult = results[resultIndex++];
        if (scenesResult.status === 'fulfilled') {
          const scenesData = scenesResult.value;
          const scenesArray = Array.isArray(scenesData) ? scenesData : (scenesData as { scenes: unknown[] }).scenes || [];
          setScenes(scenesArray);
        } else {
          console.error('利用シーン一覧の取得に失敗しました:', scenesResult.reason);
          showError('利用シーン一覧の取得に失敗しました');
        }

        if (isEdit && isMounted && shopId && shopPromise) {
          const shopResult = results[resultIndex++];
          if (shopResult.status !== 'fulfilled') {
            throw new Error('店舗データの取得に失敗しました');
          }
          const rawShopData = shopResult.value as { data?: ShopDataResponse } | ShopDataResponse;
          const shopData = (rawShopData && typeof rawShopData === 'object' && 'data' in rawShopData && rawShopData.data)
            ? rawShopData.data
            : rawShopData as ShopDataResponse;

          if (isMounted) {
            const finalMerchantId = merchantId || shopData.merchantId;
            const accountEmail = shopData.accountEmail;
            setHasExistingAccount(!!accountEmail);
            setOriginalAccountEmail(accountEmail ?? null);

            const rawPaymentApps = (shopData as { paymentApps?: Record<string, boolean> | string }).paymentApps;
            const paymentAppsData = typeof rawPaymentApps === 'string'
              ? (() => { try { return JSON.parse(rawPaymentApps); } catch { return null; } })()
              : rawPaymentApps;
            const paymentSaicoinValue = paymentAppsData?.saicoin ?? shopData.paymentSaicoin ?? false;
            const paymentTamaponValue = paymentAppsData?.tamapon ?? shopData.paymentTamapon ?? false;

            const contactName = shopData.contactName ?? '';
            const contactPhone = shopData.contactPhone ?? '';
            const contactEmail = shopData.contactEmail ?? '';

            // shopDataをスプレッドした後、明示的に担当者情報を設定（上書きを防ぐため）
            const formDataToSet = {
              ...shopData,
              merchantId: finalMerchantId,
              createAccount: !!accountEmail,
              latitude: shopData.latitude ? String(shopData.latitude) : '',
              longitude: shopData.longitude ? String(shopData.longitude) : '',
              paymentSaicoin: paymentSaicoinValue,
              paymentTamapon: paymentTamaponValue,
              area: shopData.area ?? '',
              // descriptionとdetailsがnullの場合は空文字列に変換
              description: shopData.description ?? '',
              details: shopData.details ?? '',
              // servicesがnullの場合はundefinedに変換（型の互換性のため）
              services: shopData.services ?? undefined,
            };

            // 担当者情報を明示的に設定（shopDataに含まれていても上書き）
            setFormData({
              ...formDataToSet,
              contactName,
              contactPhone,
              contactEmail,
            });

            // 担当者情報フィールドが空の場合は、エラーを削除
            setValidationErrors((prev) => {
              const newErrors = { ...prev };
              if (!contactName || contactName.trim().length === 0) {
                delete newErrors.contactName;
              }
              if (!contactPhone || contactPhone.trim().length === 0) {
                delete newErrors.contactPhone;
              }
              if (!contactEmail || contactEmail.trim().length === 0) {
                delete newErrors.contactEmail;
              }
              return newErrors;
            });

            setTouchedFields({
              name: true,
              accountEmail: !!accountEmail,
              phone: true,
              postalCode: true,
            });

            const merchantFromShop = shopData.merchant;
            if (merchantFromShop?.name) {
              setMerchantName(merchantFromShop.name);
            }
            if (merchantFromShop) {
              setSelectedMerchantDetails(merchantFromShop as Merchant);
            } else if (finalMerchantId) {
              const merchant = merchantsArray.find((m) => m.id === finalMerchantId);
              if (merchant) {
                setSelectedMerchantDetails(merchant);
              }
            }

            if (shopData.images && Array.isArray(shopData.images)) {
              const validImages = shopData.images.filter((img) => img && typeof img === 'string' && img.length > 0);
              setExistingImages(validImages);
            }

            const shopDataWithPayment = shopData as ShopCreateRequest & { paymentCredit?: { brands: string[]; other?: string }; paymentCode?: string };
            const creditValue = shopDataWithPayment.paymentCredit;
            if (creditValue) {
              if (typeof creditValue === 'object' && creditValue.brands) {
                const brands = [...creditValue.brands];
                if (creditValue.other) {
                  brands.push('その他');
                  setCustomCreditText(creditValue.other);
                }
                setSelectedCreditBrands(brands);
              } else if (typeof creditValue === 'string') {
                const brands = creditValue.split(',').map((b: string) => b.trim());
                setSelectedCreditBrands(brands);
              }
            }

            const qrValue = shopDataWithPayment.paymentCode;
            if (qrValue) {
              if (typeof qrValue === 'object' && qrValue.services) {
                const services = [...qrValue.services];
                if (qrValue.other) {
                  services.push('その他');
                  setCustomQrText(qrValue.other);
                }
                setSelectedQrBrands(services);
              } else if (typeof qrValue === 'string') {
                const services = qrValue.split(',').map((s: string) => s.trim());
                setSelectedQrBrands(services);
              }
            }

            const holidaysValue = (shopData as ShopCreateRequest).holidays;
            if (holidaysValue && holidaysValue.trim()) {
              const holidayItems = holidaysValue.split(',').map(h => h.trim());
              const holidays: string[] = [];
              let customText = '';

              holidayItems.forEach(item => {
                if (item.startsWith('その他:')) {
                  holidays.push('その他');
                  customText = item.substring('その他:'.length);
                } else {
                  holidays.push(item);
                }
              });

              setSelectedHolidays(holidays);
              setCustomHolidayText(customText);
            }

            const shopDataWithScenes = shopData as ShopCreateRequest & { sceneIds?: string[]; customSceneText?: string };
            if (shopDataWithScenes.sceneIds && Array.isArray(shopDataWithScenes.sceneIds)) {
              setSelectedScenes(shopDataWithScenes.sceneIds);
            }
            if (shopDataWithScenes.customSceneText) {
              setCustomSceneText(shopDataWithScenes.customSceneText);
            }

            // サービス情報の設定（paymentAppsと同じ形式: Record<string, boolean>）
            const shopDataWithServices = shopData as ShopCreateRequest & { services?: Record<string, boolean> | string | null };
            let servicesValue: Record<string, boolean> | string | null | undefined = shopDataWithServices.services;
            
            // nullやundefinedの場合は空配列に設定
            if (servicesValue === null || servicesValue === undefined) {
              setSelectedServices([]);
              setCustomServicesText('');
            } else {
              // 文字列の場合はJSON.parseしてオブジェクトに変換
              if (typeof servicesValue === 'string') {
                try {
                  // 空文字列の場合はnullに変換
                  if (servicesValue.trim() === '') {
                    servicesValue = null;
                  } else {
                    const parsed = JSON.parse(servicesValue) as Record<string, boolean>;
                    servicesValue = parsed;
                  }
                } catch (e) {
                  console.error('[useShopForm] ❌ servicesのパース失敗:', {
                    error: e,
                    '元の値': servicesValue,
                    '元の型': typeof servicesValue
                  });
                  servicesValue = null;
                }
              }
              
              // オブジェクトの場合（nullチェックも含む）
              if (servicesValue !== null && servicesValue !== undefined && typeof servicesValue === 'object' && !Array.isArray(servicesValue)) {
                // Record<string, boolean>形式から配列に変換
                const servicesObj = servicesValue as Record<string, boolean>;
                const servicesArray: string[] = [];
                Object.keys(servicesObj).forEach(key => {
                  if (servicesObj[key] === true) {
                    if (key === 'その他') {
                      // 「その他」の場合は、customServicesTextを設定する必要があるが、
                      // Record形式ではテキストを保存できないため、キーとして保存されていると仮定
                      servicesArray.push('その他');
                    } else {
                      servicesArray.push(key);
                    }
                  }
                });
                setSelectedServices(servicesArray);
              } else {
                setSelectedServices([]);
                setCustomServicesText('');
              }
            }
            if (isMounted) {
              setIsLoading(false);
            }
          }
        } else if (merchantId && merchantsArray.length > 0 && isMounted) {
          const merchant = merchantsArray.find(m => m.id === merchantId);
          if (merchant) {
            setMerchantName(merchant.name);
          }
          if (isMounted) {
            setIsLoading(false);
          }
        } else {
          if (isMounted) {
            setIsLoading(false);
          }
        }

        (async () => {
          try {
            const shopsResponse = await apiClient.getShops('limit=1000');
            if (isMounted) {
              setExistingAccountEmails(collectAccountEmailEntries(shopsResponse));
            }
          } catch (_error) {
            // スキップ
          }
        })();
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        if (isMounted) {
          setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
          showError('データの取得に失敗しました');
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [shopId, isEdit, merchantId, showError, isMerchantAccount, isAdminAccount]);

  useEffect(() => {
    if (formData.merchantId && merchants.length > 0) {
      const merchant = merchants.find(m => m.id === formData.merchantId) as Merchant;
      if (merchant) {
        setMerchantName(merchant.name);
        setSelectedMerchantDetails(merchant);
      }
    }
  }, [formData.merchantId, merchants]);

  const handleMerchantSelect = useCallback(async (merchant: Merchant) => {
    setFormData(prev => ({
      ...prev,
      merchantId: merchant.id,
    }));
    setMerchantName(merchant.name);
    setTouchedFields(prev => ({
      ...prev,
      merchantId: true,
    }));
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.merchantId;
      return newErrors;
    });
    setIsMerchantModalOpen(false);

    const existingMerchant = merchants.find(m => m.id === merchant.id);
    if (existingMerchant) {
      setSelectedMerchantDetails(existingMerchant);
    } else {
      try {
        const response = await apiClient.getMerchant(merchant.id) as { data?: Merchant } | Merchant;
        const merchantDetails = (response && typeof response === 'object' && 'data' in response && response.data)
          ? response.data as Merchant
          : response as Merchant;
        if (merchantDetails && merchantDetails.id) {
          setSelectedMerchantDetails(merchantDetails);
          setMerchants(prev => [...prev, merchantDetails]);
        }
      } catch (error) {
        console.error('事業者詳細の取得に失敗しました:', error);
      }
    }
  }, [merchants]);

  const handleCopyFromMerchant = useCallback(() => {
    const merchant = selectedMerchantDetails?.id === formData.merchantId
      ? selectedMerchantDetails
      : merchants.find(m => m.id === formData.merchantId);

    if (merchant) {
      setFormData(prev => ({
        ...prev,
        name: merchant.name,
        nameKana: merchant.nameKana || '',
        postalCode: merchant.postalCode || '',
        prefecture: merchant.prefecture || '',
        city: merchant.city || '',
        address1: merchant.address1 || '',
        address2: merchant.address2 || ''
      }));
    }
  }, [selectedMerchantDetails, formData.merchantId, merchants]);

  const handleInputChange = useCallback((field: keyof ExtendedShopCreateRequest, value: string | number | boolean) => {
    let updatedFormData: ExtendedShopCreateRequest;
    let updatedTouchedFields: Record<string, boolean>;
    
    setFormData((prevFormData) => {
      updatedFormData = {
        ...prevFormData,
        [field]: value,
      };
      return updatedFormData;
    });
    
    setTouchedFields((prevTouchedFields) => {
      updatedTouchedFields = {
        ...prevTouchedFields,
        [field]: true,
      };

      // 担当者情報フィールドが空文字列の場合は、エラーを明示的に削除
      if ((field === 'contactName' || field === 'contactPhone' || field === 'contactEmail') &&
        (value === '' || value === null || value === undefined || (typeof value === 'string' && value.trim().length === 0))) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
        return updatedTouchedFields;
      }

      // validateField を呼び出す（updatedFormData と updatedTouchedFields を渡す）
      validateField(field, value, updatedFormData, updatedTouchedFields);

      return updatedTouchedFields;
    });
  }, [validateField]);

  const handleFieldBlur = useCallback((field: keyof ExtendedShopCreateRequest, value: string | boolean | number | undefined) => {
    const updatedTouchedFields = {
      ...touchedFields,
      [field]: true,
    };
    setTouchedFields(updatedTouchedFields);

    // 担当者情報フィールドが空文字列の場合は、エラーを明示的に削除
    if ((field === 'contactName' || field === 'contactPhone' || field === 'contactEmail') &&
      (value === '' || value === null || value === undefined || (typeof value === 'string' && value.trim().length === 0))) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      return;
    }

    validateField(field, value, formData, updatedTouchedFields);
  }, [touchedFields, formData, validateField, setValidationErrors]);

  const handleZipcodeSearch = useCallback(async () => {
    await searchAddress(formData.postalCode);
  }, [searchAddress, formData.postalCode]);

  const handleCoordinatesPaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.includes(',')) {
      e.preventDefault();
      const parts = pastedText.split(',').map(part => part.trim());
      if (parts.length === 2) {
        const [lat, lng] = parts;
        setFormData({
          ...formData,
          latitude: lat,
          longitude: lng
        });
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.latitude;
          delete newErrors.longitude;
          return newErrors;
        });
        showSuccess('緯度経度を設定しました');
      }
    }
  }, [formData, showSuccess]);

  const openGoogleMapsForAddress = useCallback(() => {
    const latitude = formData.latitude ? String(formData.latitude).trim() : '';
    const longitude = formData.longitude ? String(formData.longitude).trim() : '';

    if (latitude && longitude) {
      const url = `https://www.google.com/maps/@${latitude},${longitude},21z/data=!3m1!1e3`;
      window.open(url, '_blank', 'noopener,noreferrer');
      showSuccess('Google Mapで座標のピンを最大ズームで表示しました。');
      return;
    }

    const _postalCode = formData.postalCode?.trim();
    const prefecture = formData.prefecture?.trim();
    const city = formData.city?.trim();
    const address1 = formData.address1?.trim();
    const address2 = formData.address2?.trim();

    if (!prefecture && !city && !address1) {
      showError('住所または緯度経度を入力してください');
      return;
    }

    const addressParts = [
      _postalCode ? `〒${_postalCode}` : '',
      prefecture,
      city,
      address1,
      address2,
    ].filter(Boolean);

    const address = addressParts.join(' ');
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}&zoom=21`;
    window.open(url, '_blank', 'noopener,noreferrer');
    showSuccess('Google Mapを最大ズームで開きました。住所が自動的に検索されます。');
  }, [formData, showSuccess, showError]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const isCreditOtherSelected = selectedCreditBrands.includes('その他');
      const isQrOtherSelected = selectedQrBrands.includes('その他');
      const isServicesOtherSelected = selectedServices.includes('その他');
      const otherScene = scenes.find(s => s.name === 'その他');
      const isOtherSceneSelected = otherScene && selectedScenes.includes(otherScene.id);

      const paymentCreditJson = selectedCreditBrands.length > 0 ? {
        brands: selectedCreditBrands.filter(b => b !== 'その他'),
        ...(isCreditOtherSelected && customCreditText && { other: customCreditText })
      } : null;

      const paymentCodeJson = selectedQrBrands.length > 0 ? {
        services: selectedQrBrands.filter(s => s !== 'その他'),
        ...(isQrOtherSelected && customQrText && { other: customQrText })
      } : null;

      // servicesをpaymentAppsと同じ形式（Record<string, boolean>）に変換
      const servicesJson = selectedServices.length > 0 ? (() => {
        const servicesRecord: Record<string, boolean> = {};
        selectedServices.filter(s => s !== 'その他').forEach(service => {
          servicesRecord[service] = true;
        });
        // 「その他」がある場合は、otherキーにテキストを保存（paymentApps形式に合わせる）
        if (isServicesOtherSelected && customServicesText) {
          servicesRecord['その他'] = true;
          // カスタムテキストは別のフィールドに保存するか、キー名に含める
          // ここでは、paymentApps形式に合わせて、そのままbooleanとして保存
        }
        return servicesRecord;
      })() : null;

      const isHolidayOtherSelected = selectedHolidays.includes('その他');
      const holidaysForSubmit = selectedHolidays.map(h => {
        if (h === 'その他' && customHolidayText.trim()) {
          return `その他:${customHolidayText.trim()}`;
        }
        return h;
      }).join(',');

      // formDataからservicesを除外してから、正しい形式のservicesを設定
      const { services: _formDataServices, ...formDataWithoutServices } = formData;
      const dataToValidate = {
        ...formDataWithoutServices,
        accountEmail: formData.accountEmail || null,
        holidays: holidaysForSubmit,
        paymentCredit: paymentCreditJson,
        paymentCode: paymentCodeJson,
        // サービス情報をpaymentCreditと同じ形式で送信
        services: servicesJson,
        couponUsageStart: formData.couponUsageStart && formData.couponUsageStart.trim() !== '' ? formData.couponUsageStart : null,
        couponUsageEnd: formData.couponUsageEnd && formData.couponUsageEnd.trim() !== '' ? formData.couponUsageEnd : null,
      };

      const customErrors: Record<string, string> = {};

      if (!formData.name || formData.name.trim().length === 0) {
        customErrors.name = '店舗名は必須です';
      } else if (formData.name.length > 100) {
        customErrors.name = '店舗名は100文字以内で入力してください';
      }

      if (formData.nameKana && formData.nameKana.length > 100) {
        customErrors.nameKana = '店舗名（カナ）は100文字以内で入力してください';
      } else if (formData.nameKana && formData.nameKana.trim().length > 0 && !isValidKana(formData.nameKana)) {
        customErrors.nameKana = '店舗名（カナ）は全角カタカナで入力してください';
      }

      if (!formData.phone || formData.phone.trim().length === 0) {
        customErrors.phone = '電話番号は必須です';
      } else if (!isValidPhone(formData.phone)) {
        customErrors.phone = '有効な電話番号を入力してください（10-11桁の数字）';
      }

      if (!formData.postalCode || formData.postalCode.trim().length === 0) {
        customErrors.postalCode = '郵便番号は必須です';
      } else if (!isValidPostalCode(formData.postalCode)) {
        customErrors.postalCode = '郵便番号は7桁の数字で入力してください';
      }

      if (!formData.prefecture || formData.prefecture.trim().length === 0) {
        customErrors.prefecture = '都道府県を選択してください';
      }

      if (!formData.city || formData.city.trim().length === 0) {
        customErrors.city = '市区町村は必須です';
      }

      if (!formData.address1 || formData.address1.trim().length === 0) {
        customErrors.address1 = '番地以降は必須です';
      }

      if (!formData.latitude || String(formData.latitude).trim().length === 0) {
        customErrors.latitude = '緯度は必須です';
      }

      if (!formData.longitude || String(formData.longitude).trim().length === 0) {
        customErrors.longitude = '経度は必須です';
      }

      if (!formData.genreId || formData.genreId.trim().length === 0) {
        customErrors.genreId = 'ジャンルを選択してください';
      }

      if (!formData.smokingType || String(formData.smokingType).trim().length === 0) {
        customErrors.smokingType = '喫煙タイプを選択してください';
      }

      if (!isMerchantAccount && (!formData.merchantId || formData.merchantId.trim().length === 0)) {
        customErrors.merchantId = '事業者を選択してください';
      }

      const hasCouponStart = !!(formData.couponUsageStart && formData.couponUsageStart.trim().length > 0);
      const hasCouponEnd = !!(formData.couponUsageEnd && formData.couponUsageEnd.trim().length > 0);
      if (hasCouponStart && !hasCouponEnd) {
        customErrors.couponUsageEnd = 'クーポン利用時間の終了時刻を入力してください';
      } else if (!hasCouponStart && hasCouponEnd) {
        customErrors.couponUsageStart = 'クーポン利用時間の開始時刻を入力してください';
      }

      if (formData.createAccount) {
        const trimmedAccountEmail = formData.accountEmail?.trim() ?? '';
        if (trimmedAccountEmail.length === 0) {
          customErrors.accountEmail = 'メールアドレスは必須です';
        } else if (!isValidEmail(trimmedAccountEmail)) {
          customErrors.accountEmail = '有効なメールアドレスを入力してください';
        } else if (isAccountEmailDuplicate(trimmedAccountEmail) && trimmedAccountEmail.toLowerCase() !== (originalAccountEmail ?? '').toLowerCase()) {
          customErrors.accountEmail = 'このメールアドレスは既に使用されています';
        }

        if (!isEdit && (!formData.password || formData.password.trim().length === 0)) {
          customErrors.password = 'パスワードは必須です';
        } else if (!isEdit && formData.password && formData.password.length < 8) {
          customErrors.password = 'パスワードは8文字以上で入力してください';
        }
      }

      if (formData.description && formData.description.length > 500) {
        customErrors.description = '店舗紹介説明は500文字以内で入力してください';
      }

      if (formData.details && formData.details.length > 1000) {
        customErrors.details = '詳細情報は1000文字以内で入力してください';
      }

      if (isCreditOtherSelected && (!customCreditText || customCreditText.trim().length === 0)) {
        customErrors.customCreditText = 'その他のクレジットカードブランド名を入力してください';
      } else if (isCreditOtherSelected && customCreditText && customCreditText.length > 100) {
        customErrors.customCreditText = 'その他のクレジットカードブランド名は100文字以内で入力してください';
      }

      if (isQrOtherSelected && (!customQrText || customQrText.trim().length === 0)) {
        customErrors.customQrText = 'その他のQRコード決済サービス名を入力してください';
      } else if (isQrOtherSelected && customQrText && customQrText.length > 100) {
        customErrors.customQrText = 'その他のQRコード決済サービス名は100文字以内で入力してください';
      }

      if (isOtherSceneSelected && (!customSceneText || customSceneText.trim().length === 0)) {
        customErrors.customSceneText = '具体的な利用シーンを入力してください';
      } else if (isOtherSceneSelected && customSceneText && customSceneText.length > 100) {
        customErrors.customSceneText = '具体的な利用シーンは100文字以内で入力してください';
      }

      if (isHolidayOtherSelected && (!customHolidayText || customHolidayText.trim().length === 0)) {
        customErrors.customHolidayText = 'その他の定休日の内容を入力してください';
      } else if (isHolidayOtherSelected && customHolidayText && customHolidayText.length > 100) {
        customErrors.customHolidayText = 'その他の定休日は100文字以内で入力してください';
      }

      // 担当者情報のバリデーション
      if (formData.contactName && formData.contactName.length > 100) {
        customErrors.contactName = '担当者名は100文字以内で入力してください';
      }

      if (formData.contactPhone && formData.contactPhone.trim().length > 0 && !isValidPhone(formData.contactPhone)) {
        customErrors.contactPhone = '有効な電話番号を入力してください（10-11桁の数字）';
      }

      if (formData.contactEmail && formData.contactEmail.trim().length > 0) {
        if (!isValidEmail(formData.contactEmail)) {
          customErrors.contactEmail = '有効なメールアドレスを入力してください';
        } else if (formData.contactEmail.length > 255) {
          customErrors.contactEmail = 'メールアドレスは255文字以内で入力してください';
        }
      }

      if (Object.keys(customErrors).length > 0) {
        setValidationErrors(customErrors);
        showError('入力内容に誤りがあります。各項目を確認してください。');
        setIsSubmitting(false);

        setTimeout(() => {
          const firstErrorField = Object.keys(customErrors)[0];
          if (firstErrorField) {
            const errorElement = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
            if (errorElement) {
              const fieldContainer = errorElement.closest('div') as HTMLElement;
              if (fieldContainer) {
                fieldContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
              } else {
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
              errorElement.focus();
            } else {
              const errorSection = document.querySelector(`[data-field="${firstErrorField}"]`) as HTMLElement;
              if (errorSection) {
                errorSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
          }
        }, 100);

        return;
      }

      const schema = isEdit ? shopUpdateRequestSchema : shopCreateRequestSchema;
      
      // dataToValidateからservicesを明示的に設定
      const { services: _dataToValidateServices, ...dataToValidateWithoutServices } = dataToValidate;
      // servicesJsonがnullの場合はundefinedに変換（Zodスキーマのoptional()はundefinedを期待）
      const servicesForValidation = servicesJson === null ? undefined : servicesJson;
      let dataForZodValidation: ExtendedShopCreateRequest & { applications?: string[] } = { 
        ...dataToValidateWithoutServices,
        services: servicesForValidation, // 明示的にservicesを設定
      } as ExtendedShopCreateRequest & { applications?: string[] };
      if ('applications' in dataForZodValidation) {
        delete (dataForZodValidation as Record<string, unknown>).applications;
      }
      if (!formData.createAccount) {
        const { password: _password, ...rest } = dataForZodValidation;
        dataForZodValidation = { ...rest, accountEmail: null };
      }

      // Zodのスキーマ側でservicesが配列形式を期待するケースがあり、
      // Record<string, boolean>を渡すと`services.services`でinvalid_typeになるため、
      // バリデーション時はいったんservicesを除外する（servicesはオプショナルなので削除してもスキーマ上はOK）。
      const { services: _servicesForSubmit, ...dataForZodValidationWithoutServices } = dataForZodValidation;
      const validationResult = schema.safeParse(dataForZodValidationWithoutServices);

      if (!validationResult.success) {
        const zodErrors: Record<string, string> = {};
        validationResult.error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!zodErrors[path]) {
            zodErrors[path] = err.message;
          }
        });


        setValidationErrors(zodErrors);
        showError('入力内容に誤りがあります。各項目を確認してください。');
        setIsSubmitting(false);
        return;
      }

      const selectedGenre = genres.find(g => g.id === formData.genreId);

      // blob:URLをdata:URLに変換（CSPエラーを回避するため）
      // sessionStorageの容量制限を考慮して、画像を圧縮してからdata:URLに変換
      const convertBlobToDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      // imagePreviewsのblob:URLをdata:URLに変換（圧縮してから変換）
      const imagePreviewDataUrls = await Promise.all(
        imagePreviews.map(async (preview) => {
          // 既にdata:URLの場合はそのまま返す
          if (preview.url.startsWith('data:')) {
            return preview.url;
          }
          // blob:URLの場合はFileオブジェクトを圧縮してからdata:URLを生成
          try {
            // 画像を圧縮（sessionStorageの容量を節約するため、小さめに圧縮）
            const compressedFile = await compressImageFile(preview.file, {
              maxBytes: 500 * 1024, // 500KB以下に圧縮（sessionStorage用）
              maxWidth: 1280,
              maxHeight: 1280,
              initialQuality: 0.7,
              minQuality: 0.5,
              qualityStep: 0.1,
            });
            return await convertBlobToDataUrl(compressedFile);
          } catch (error) {
            console.error('画像のdata:URL変換に失敗しました:', error);
            // 変換に失敗した場合は元のURLを返す（エラーになる可能性があるが、とりあえず保存）
            return preview.url;
          }
        })
      );

      const confirmData = {
        ...formData,
        shopId: shopId || null,
        isEdit,
        merchantName,
        genreName: selectedGenre?.name || '',
        selectedScenes,
        customSceneText: isOtherSceneSelected ? customSceneText : '',
        selectedHolidays,
        customHolidayText: isHolidayOtherSelected ? customHolidayText : '',
        selectedCreditBrands,
        customCreditText: isCreditOtherSelected ? customCreditText : '',
        selectedQrBrands,
        customQrText: isQrOtherSelected ? customQrText : '',
        selectedServices,
        customServicesText: isServicesOtherSelected ? customServicesText : '',
        holidaysForSubmit,
        paymentCreditJson,
        paymentCodeJson,
        servicesJson,
        existingImages,
        imagePreviews: imagePreviewDataUrls, // data:URLに変換したURLを保存
        hasExistingAccount,
        fallbackRedirect,
        sceneNames: scenes.reduce((acc, s) => ({ ...acc, [s.id]: s.name }), {} as Record<string, string>),
        contactName: formData.contactName || null,
        contactPhone: formData.contactPhone || null,
        contactEmail: formData.contactEmail || null,
      };

      try {
        sessionStorage.setItem('shopConfirmData', JSON.stringify(confirmData));
      } catch (error) {
        console.error('sessionStorageへの保存に失敗しました:', error);
        showError('データの保存に失敗しました。もう一度お試しください。');
        setIsSubmitting(false);
        return;
      }

      if (isEdit && shopId) {
        router.push(`/shops/${shopId}/confirm`);
      } else {
        router.push('/shops/confirm');
      }
    } catch (err: unknown) {
      const error = err as Error & {
        response?: {
          status?: number;
          data?: { message?: string } | null;
        };
      };

      const isConflict = error?.response?.status === 409;
      const conflictMessage =
        error?.response?.data && typeof error.response.data === 'object'
          ? (error.response.data as { message?: string }).message
          : undefined;

      if (isConflict) {
        const message = conflictMessage || error?.message || 'このメールアドレスは既に使用されています';
        setTouchedFields((prev) => ({
          ...prev,
          accountEmail: true,
        }));
        setValidationErrors((prev) => ({
          ...prev,
          accountEmail: message,
        }));
        showError(message);
      } else {
        showError('エラーが発生しました');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    selectedCreditBrands,
    selectedQrBrands,
    customCreditText,
    customQrText,
    scenes,
    selectedScenes,
    customSceneText,
    selectedHolidays,
    customHolidayText,
    selectedServices, // サービス情報を依存配列に追加
    formData,
    isEdit,
    shopId,
    genres,
    merchantName,
    existingImages,
    imagePreviews,
    hasExistingAccount,
    fallbackRedirect,
    isMerchantAccount,
    isAccountEmailDuplicate,
    originalAccountEmail,
    router,
    setValidationErrors,
    showError,
  ]);

  const handleCancel = useCallback(() => {
    router.push(fallbackRedirect);
  }, [router, fallbackRedirect]);

  const handleLoadQrCode = useCallback(async () => {
    if (!shopId) return;

    try {
      setQrCodeLoading(true);
      const qrCodeData = await apiClient.getShopQrCodeUrl(shopId);
      if (qrCodeData && typeof qrCodeData === 'object' && 'qr_code_url' in qrCodeData) {
        setQrCodeUrl((qrCodeData as { qr_code_url: string }).qr_code_url);
      }
    } catch (error) {
      console.error('QRコードURL取得エラー:', error);
      showError('QRコードの取得に失敗しました');
    } finally {
      setQrCodeLoading(false);
    }
  }, [shopId, showError]);

  return {
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
    customServicesText,
    setCustomServicesText,
    merchants,
    selectedMerchantDetails,
    genres,
    scenes,
    merchantName,
    isLoading,
    isSubmitting,
    isMerchantModalOpen,
    error,
    validationErrors,
    touchedFields,
    hasExistingAccount,
    existingImages,
    imagePreviews,
    qrCodeUrl,
    qrCodeLoading,
    isEdit,
    shopId,
    isMerchantAccount,
    isAdminAccount,
    isShopAccount,
    fallbackRedirect,
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
  };
}

