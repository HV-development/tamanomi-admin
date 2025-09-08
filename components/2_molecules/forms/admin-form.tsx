'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import type { Admin } from '@/types/admin';
import { adminFormSchema, type AdminFormData } from '@/validations/admin-validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { InputField, SelectField, TextareaField } from './form-field';

const STATUS_OPTIONS = [
  { value: 'active', label: '有効' },
  { value: 'inactive', label: '無効' },
];

interface AdminFormProps {
  admin?: Admin | null;
  onSubmit: (data: AdminFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  className?: string;
}

export function AdminForm({
  admin,
  onSubmit,
  onCancel,
  loading = false,
  className,
}: AdminFormProps) {
  const isEditMode = !!admin;

  const form = useForm<AdminFormData>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      name: '',
      nameKana: '',
      email: '',
      phoneNumber: '',
      status: 'active',
      department: '',
      notes: '',
    },
  });

  // 編集モードで初期データが変更されたらフォームを更新
  useEffect(() => {
    if (isEditMode && admin) {
      form.reset({
        name: admin.name || '',
        nameKana: admin.nameKana || '',
        email: admin.email || '',
        phoneNumber: admin.phoneNumber || '',
        status: admin.status || 'active',
        department: admin.department || '',
        notes: admin.notes || '',
      });
    }
  }, [admin, form, isEditMode]);

  const handleSubmit = async (data: AdminFormData) => {
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
              <User className="h-5 w-5" />
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

              <InputField name="department" label="部署" placeholder="例: 管理部" />

              <SelectField name="status" label="ステータス" options={STATUS_OPTIONS} />
            </div>

            <TextareaField
              name="notes"
              label="備考"
              placeholder="特記事項があれば記載してください"
              rows={4}
            />

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                キャンセル
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? '処理中...' : isEditMode ? '更新' : '登録'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
