'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import type { User } from '@/types/user';
import { userFormSchema, type UserFormData } from '@/validations/user-validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Heart, Save } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { InputField, SelectField, TextareaField } from './form-field';

const STATUS_OPTIONS = [
  { value: 'active', label: '利用中' },
  { value: 'inactive', label: '休止中' },
  { value: 'discharged', label: '退所' },
  { value: 'deceased', label: '死亡' },
];

const GENDER_OPTIONS = [
  { value: 'male', label: '男性' },
  { value: 'female', label: '女性' },
  { value: 'other', label: 'その他' },
];

const CARE_LEVEL_OPTIONS = [
  { value: 'support1', label: '要支援1' },
  { value: 'support2', label: '要支援2' },
  { value: 'care1', label: '要介護1' },
  { value: 'care2', label: '要介護2' },
  { value: 'care3', label: '要介護3' },
  { value: 'care4', label: '要介護4' },
  { value: 'care5', label: '要介護5' },
];

interface UserFormProps {
  user?: User | null;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
}

export function UserForm({ user, onSubmit, onCancel, loading = false, className }: UserFormProps) {
  const isEditMode = !!user;

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      nameKana: '',
      birthDate: '',
      gender: 'male',
      age: 0,
      phoneNumber: '',
      address: '',
      careLevel: undefined,
      insuranceNumber: '',
      startDate: '',
      status: 'active',
      emergencyContact: {
        name: '',
        relationship: '',
        phoneNumber: '',
        address: '',
      },
      medicalHistory: '',
      allergies: [],
      medications: [],
      notes: '',
    },
  });

  // 編集モードで初期データが変更されたらフォームを更新
  useEffect(() => {
    if (isEditMode && user) {
      form.reset({
        name: user.name || '',
        nameKana: user.nameKana || '',
        birthDate: user.birthDate || '',
        gender: user.gender || 'male',
        age: user.age || 0,
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        careLevel: user.careLevel,
        insuranceNumber: user.insuranceNumber || '',
        startDate: user.startDate || '',
        status: user.status || 'active',
        emergencyContact: {
          name: user.emergencyContact?.name || '',
          relationship: user.emergencyContact?.relationship || '',
          phoneNumber: user.emergencyContact?.phoneNumber || '',
          address: user.emergencyContact?.address || '',
        },
        medicalHistory: user.medicalHistory || '',
        allergies: user.allergies || [],
        medications: user.medications || [],
        notes: user.notes || '',
      });
    }
  }, [user, form, isEditMode]);

  const handleSubmit = async (data: UserFormData) => {
    try {
      await onSubmit(data);
      if (!isEditMode) {
        form.reset();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={cn('space-y-6', className)}>
        {/* 基本情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              基本情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField name="name" label="氏名" required placeholder="例: 田中 太郎" />

              <InputField
                name="nameKana"
                label="フリガナ"
                required
                placeholder="例: タナカ タロウ"
              />

              <InputField name="birthDate" label="生年月日" type="date" required />

              <InputField name="age" label="年齢" type="number" required min={0} max={120} />

              <SelectField name="gender" label="性別" options={GENDER_OPTIONS} required />

              <InputField
                name="phoneNumber"
                label="電話番号"
                type="tel"
                placeholder="例: 090-1234-5678"
              />

              <InputField name="address" label="住所" placeholder="例: 東京都渋谷区..." />

              <SelectField name="careLevel" label="要介護度" options={CARE_LEVEL_OPTIONS} />

              <InputField
                name="insuranceNumber"
                label="保険証番号"
                required
                placeholder="例: 12345678"
              />

              <InputField name="startDate" label="利用開始日" type="date" required />

              <SelectField name="status" label="ステータス" options={STATUS_OPTIONS} />
            </div>
          </CardContent>
        </Card>

        {/* 緊急連絡先 */}
        <Card>
          <CardHeader>
            <CardTitle>緊急連絡先</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                name="emergencyContact.name"
                label="氏名"
                required
                placeholder="例: 田中 花子"
              />

              <InputField
                name="emergencyContact.relationship"
                label="続柄"
                required
                placeholder="例: 長女"
              />

              <InputField
                name="emergencyContact.phoneNumber"
                label="電話番号"
                type="tel"
                required
                placeholder="例: 090-1234-5678"
              />

              <InputField
                name="emergencyContact.address"
                label="住所"
                placeholder="例: 東京都渋谷区..."
              />
            </div>
          </CardContent>
        </Card>

        {/* 医療情報 */}
        <Card>
          <CardHeader>
            <CardTitle>医療情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextareaField
              name="medicalHistory"
              label="医療情報・特記事項"
              placeholder="アレルギー、服薬情報、既往歴等を記載してください"
              rows={4}
            />
          </CardContent>
        </Card>

        <TextareaField
          name="notes"
          label="備考"
          placeholder="その他特記事項があれば記載してください"
          rows={4}
        />

        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              キャンセル
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? '処理中...' : isEditMode ? '更新' : '登録'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
