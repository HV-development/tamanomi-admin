import { useCallback } from 'react';
import { z } from 'zod';
import { shopCreateRequestSchema, shopUpdateRequestSchema, isValidKana } from '@hv-development/schemas';
import type { ExtendedShopCreateRequest } from '@/types/shop';

interface UseShopValidationOptions {
  formData: ExtendedShopCreateRequest;
  touchedFields: Record<string, boolean>;
  isEdit: boolean;
  setValidationErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export function useShopValidation({
  formData,
  touchedFields,
  isEdit,
  setValidationErrors,
}: UseShopValidationOptions) {
  const validateField = useCallback((field: keyof ExtendedShopCreateRequest, value: string | boolean | number | undefined, currentFormData?: ExtendedShopCreateRequest, currentTouchedFields?: Record<string, boolean>) => {
    // 最新のformDataを使用（引数で渡された場合はそれを使用、そうでない場合はformDataを使用）
    const latestFormData = currentFormData || formData;
    // 最新のtouchedFieldsを使用（引数で渡された場合はそれを使用、そうでない場合はtouchedFieldsを使用）
    const latestTouchedFields = currentTouchedFields || touchedFields;
    
    // クーポン利用時間の特殊なバリデーション（開始・終了をセットで入力）
    if (field === 'couponUsageStart' || field === 'couponUsageEnd') {
      const start = (field === 'couponUsageStart' ? (typeof value === 'string' ? value : '') : (latestFormData.couponUsageStart || ''));
      const end = (field === 'couponUsageEnd' ? (typeof value === 'string' ? value : '') : (latestFormData.couponUsageEnd || ''));
      const hasStart = !!start;
      const hasEnd = !!end;
      if ((hasStart && !hasEnd) || (!hasStart && hasEnd)) {
        const msg = 'クーポン利用時間は開始・終了をセットで入力してください';
        setValidationErrors(prev => ({ ...prev, couponUsageStart: msg, couponUsageEnd: msg }));
      } else {
        setValidationErrors(prev => {
          const ne = { ...prev } as Record<string, string>;
          delete ne.couponUsageStart;
          delete ne.couponUsageEnd;
          return ne;
        });
      }
      return; // ここで終了（下の単項目処理は行わない）
    }

    // Zodスキーマベースのバリデーション（部分オブジェクトで検証）
    const schema = isEdit ? shopUpdateRequestSchema : shopCreateRequestSchema;
    
    // ZodEffectsの内部スキーマ（ZodObject）にアクセス
    // instanceOfチェックがうまく動作しない場合があるため、constructor.nameと_defプロパティでチェック
    let baseSchema: any = schema;
    let unwrapCount = 0;
    const maxUnwrapAttempts = 10; // 無限ループ防止
    
    while (unwrapCount < maxUnwrapAttempts) {
      // ZodEffectsかどうかを複数の方法でチェック
      // _def.typeNameが'ZodEffects'か、または_defにschemaプロパティがあるか
      const isZodEffects = 
        baseSchema instanceof z.ZodEffects || 
        baseSchema?.constructor?.name === 'ZodEffects' ||
        baseSchema?._def?.typeName === 'ZodEffects' ||
        (baseSchema?._def && 'schema' in baseSchema._def);
      
      if (isZodEffects && baseSchema?._def?.schema) {
        baseSchema = baseSchema._def.schema;
        unwrapCount++;
      } else {
        break;
      }
    }
    
    let errorMessage = '';

    // 値が空文字列の場合、nullまたはundefinedに変換して検証
    let valueToValidate: unknown = value;
    if (typeof value === 'string' && value.trim().length === 0) {
      // オプショナルフィールドの場合はundefined、nullableの場合はnull
      if (field === 'homepageUrl' || (field as string) === 'couponUsageStart' || (field as string) === 'couponUsageEnd') {
        valueToValidate = null;
      } else if (field !== 'name' && field !== 'phone' && field !== 'postalCode' && field !== 'latitude' && field !== 'longitude' && field !== 'nameKana') {
        valueToValidate = undefined;
      }
      // nameKanaは空文字列の場合もバリデーションをスキップする（オプショナル）
    }

    // Zodスキーマでバリデーション実行
    // instanceofチェックがうまく動作しない場合があるため、shapeプロパティの存在で確認
    if (!baseSchema || !baseSchema.shape) {
      return;
    }

    let fieldSchema: any = baseSchema.shape[field as keyof typeof baseSchema.shape];
    if (!fieldSchema) {
      return; // スキーマに存在しないフィールドはスキップ
    }
    
    // ZodOptional、ZodNullable、ZodEffectsをアンラップして実際のスキーマを取得
    let unwrappedFieldSchema = fieldSchema;
    const maxFieldUnwrapAttempts = 10;
    let fieldUnwrapAttempt = 0;
    
    while (unwrappedFieldSchema && fieldUnwrapAttempt < maxFieldUnwrapAttempts) {
      // 次のスキーマを取得
      if (unwrappedFieldSchema?._def?.innerType) {
        unwrappedFieldSchema = unwrappedFieldSchema._def.innerType;
      } else if (unwrappedFieldSchema?._def?.schema) {
        unwrappedFieldSchema = unwrappedFieldSchema._def.schema;
      } else {
        break;
      }
      
      fieldUnwrapAttempt++;
      
      // ZodOptional、ZodNullable、ZodEffects以外になったら終了
      if (!(unwrappedFieldSchema instanceof z.ZodOptional ||
            unwrappedFieldSchema instanceof z.ZodNullable ||
            unwrappedFieldSchema instanceof z.ZodEffects ||
            unwrappedFieldSchema?.constructor?.name === 'ZodOptional' ||
            unwrappedFieldSchema?.constructor?.name === 'ZodNullable' ||
            unwrappedFieldSchema?.constructor?.name === 'ZodEffects')) {
        break;
      }
    }
    fieldSchema = unwrappedFieldSchema;

    // 必須チェック（latestTouchedFieldsに基づく条件付き）
    const isRequiredField = field === 'name' || field === 'phone' || field === 'postalCode' || field === 'latitude' || field === 'longitude';
    const isEmpty = !value || (typeof value === 'string' && value.trim().length === 0);
    
    try {
      // 必須フィールドで空の場合、latestTouchedFieldsをチェック
      if (isRequiredField && isEmpty) {
        if (latestTouchedFields[field]) {
          // 空文字列でZodスキーマを検証してエラーメッセージを取得
          try {
            fieldSchema.parse('');
          } catch (err) {
            // instanceofチェックが失敗する場合があるため、errorsプロパティで判定
            if (err instanceof z.ZodError || ((err as any)?.errors && Array.isArray((err as any).errors))) {
              errorMessage = ((err as any).errors[0]?.message) || '入力エラーです';
            }
          }
        }
        // latestTouchedFieldsでない場合はエラーなし（初期表示時はエラーを表示しない）
      } else if (isRequiredField && !isEmpty) {
        // 必須フィールドで値がある場合はZodスキーマで検証
        try {
          fieldSchema.parse(valueToValidate);
        } catch (err) {
          if (err instanceof z.ZodError || ((err as any)?.errors && Array.isArray((err as any).errors))) {
            errorMessage = ((err as any).errors[0]?.message) || '入力エラーです';
          }
        }
      } else if (field === 'accountEmail') {
        // アカウント発行時のみ必須
        if (latestFormData.createAccount && isEmpty) {
          if (latestTouchedFields[field]) {
            // 空文字列でZodスキーマを検証してエラーメッセージを取得
            try {
              fieldSchema.parse('');
            } catch (err) {
              if (err instanceof z.ZodError) {
                errorMessage = err.errors[0]?.message || '入力エラーです';
              }
            }
          }
        } else if (!isEmpty && typeof value === 'string' && value.trim().length > 0) {
          // 値がある場合はZodスキーマで検証
          try {
            fieldSchema.parse(valueToValidate);
          } catch (err) {
            if (err instanceof z.ZodError) {
              errorMessage = err.errors[0]?.message || '入力エラーです';
            }
          }
        }
      } else if (field === 'nameKana') {
        // 店舗名カナのバリデーション（オプショナル、入力がある場合のみ）
        if (typeof value === 'string' && value.trim().length > 0) {
          // カタカナチェック
          if (!isValidKana(value)) {
            errorMessage = '店舗名（カナ）は全角カタカナで入力してください';
          } else {
            // Zodスキーマで検証（最大文字数など）
            try {
              fieldSchema.parse(value);
            } catch (err) {
              if (err instanceof z.ZodError || ((err as any)?.errors && Array.isArray((err as any).errors))) {
                errorMessage = ((err as any).errors[0]?.message) || '入力エラーです';
              }
            }
          }
        }
        // 空文字列の場合はバリデーションをスキップ（オプショナルフィールド）
      } else {
        // その他のフィールドは値がある場合のみZodスキーマで検証
        if (valueToValidate !== undefined && valueToValidate !== null && valueToValidate !== '') {
          // 元のフィールドスキーマ（ZodOptionalなど）でバリデーションを実行してエラーメッセージを取得
          try {
            const originalFieldSchema = baseSchema.shape[field as keyof typeof baseSchema.shape];
            originalFieldSchema.parse(valueToValidate);
          } catch (err) {
            if (err instanceof z.ZodError || ((err as any)?.errors && Array.isArray((err as any).errors))) {
              const errors = (err as any).errors;
              const firstError = errors?.[0];
              
              // エラーメッセージを取得（カスタムメッセージがあればそれを使用）
              errorMessage = firstError?.message || '入力エラーです';
              
              // もしエラーメッセージが英語のままの場合は、日本語メッセージに置き換える
              if (errorMessage === 'Invalid url' && field === 'homepageUrl') {
                errorMessage = '有効なURLを入力してください';
              }
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        errorMessage = error.errors[0]?.message || '入力エラーです';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
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
  }, [formData, touchedFields, isEdit, setValidationErrors]);

  return { validateField };
}

