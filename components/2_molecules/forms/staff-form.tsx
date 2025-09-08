'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import type { Staff } from '@/types/staff';
import { staffFormSchema, type StaffFormData } from '@/validations/staff-validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Users } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { InputField, SelectField, TextareaField } from './form-field';

const STATUS_OPTIONS = [
  { value: 'active', label: '在職' },
  { value: 'inactive', label: '退職' },
  { value: 'on-leave', label: '休職中' },
  { value: 'terminated', label: '解雇' },
];

const ROLE_OPTIONS = [
  { value: 'nurse', label: '看護師' },
  { value: 'care-worker', label: '介護福祉士' },
  { value: 'physical-therapist', label: '理学療法士' },
  { value: 'occupational-therapist', label: '作業療法士' },
  { value: 'speech-therapist', label: '言語聴覚士' },
  { value: 'social-worker', label: '社会福祉士' },
  { value: 'nutritionist', label: '栄養士' },
  { value: 'admin', label: '事務員' },
  { value: 'other', label: 'その他' },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'full-time', label: '正社員' },
  { value: 'part-time', label: 'パート' },
  { value: 'contract', label: '契約社員' },
  { value: 'temporary', label: '派遣' },
];

const QUALIFICATION_OPTIONS = [
  { value: '看護師', label: '看護師' },
  { value: '介護福祉士', label: '介護福祉士' },
  { value: '理学療法士', label: '理学療法士' },
  { value: '作業療法士', label: '作業療法士' },
  { value: '言語聴覚士', label: '言語聴覚士' },
  { value: '社会福祉士', label: '社会福祉士' },
  { value: '栄養士', label: '栄養士' },
  { value: 'ケアマネジャー', label: 'ケアマネジャー' },
  { value: 'ヘルパー2級', label: 'ヘルパー2級' },
  { value: '初任者研修', label: '初任者研修' },
];

interface StaffFormProps {
  staff?: Staff | null;
  onSubmit: (data: StaffFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
}

export function StaffForm({
  staff,
  onSubmit,
  onCancel,
  loading = false,
  className,
}: StaffFormProps) {
  const isEditMode = !!staff;

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      name: '',
      nameKana: '',
      email: '',
      phoneNumber: '',
      role: 'care-worker',
      position: '',
      employmentType: 'full-time',
      qualifications: [],
      hireDate: '',
      status: 'active',
      notes: '',
    },
  });

  // 編集モードで初期データが変更されたらフォームを更新
  useEffect(() => {
    if (isEditMode && staff) {
      form.reset({
        name: staff.name || '',
        nameKana: staff.nameKana || '',
        email: staff.email || '',
        phoneNumber: staff.phoneNumber || '',
        role: staff.role || 'care-worker',
        position: staff.position || '',
        employmentType: staff.employmentType || 'full-time',
        qualifications: staff.qualifications || [],
        hireDate: staff.hireDate || '',
        status: staff.status || 'active',
        notes: staff.notes || '',
      });
    }
  }, [staff, form, isEditMode]);

  const handleSubmit = async (data: StaffFormData) => {
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
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

              <InputField
                name="email"
                label="メールアドレス"
                required
                type="email"
                placeholder="例: tanaka@example.com"
              />

              <InputField
                name="phoneNumber"
                label="電話番号"
                required
                type="tel"
                placeholder="例: 090-1234-5678"
              />

              <SelectField name="role" label="職種" options={ROLE_OPTIONS} required />

              <InputField name="position" label="役職" placeholder="例: 主任" />

              <SelectField
                name="employmentType"
                label="雇用形態"
                options={EMPLOYMENT_TYPE_OPTIONS}
                required
              />

              <InputField name="hireDate" label="入職日" type="date" required />

              <SelectField name="status" label="ステータス" options={STATUS_OPTIONS} />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">資格</label>
              <div className="text-sm text-gray-600 mb-2">保有資格（複数選択可）</div>
              <div className="grid grid-cols-2 gap-2">
                {QUALIFICATION_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={option.value}
                      {...form.register('qualifications')}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <TextareaField
              name="notes"
              label="備考"
              placeholder="特記事項があれば記載してください"
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
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
