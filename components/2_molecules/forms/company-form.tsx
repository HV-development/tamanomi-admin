import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import type { CreateCompanyFormData, EditCompanyFormData } from '@/types/company';
import { Company } from '@/types/company';
import { createCompanySchema, editCompanySchema } from '@/validations/company-validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, FileText, Phone, User } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { InputField, SelectField, TextareaField } from './form-field';

const BUSINESS_TYPE_OPTIONS = [
  { value: 'medical', label: '医療' },
  { value: 'nursing', label: '介護' },
  { value: 'welfare', label: '福祉' },
  { value: 'education', label: '教育' },
  { value: 'other', label: 'その他' },
];

// 共通のフォームデータ型
type CompanyFormData = CreateCompanyFormData | EditCompanyFormData;

interface CompanyFormProps {
  // 編集モードの場合は既存の会社データを渡す
  initialData?: Company;
  onSubmit: (data: CompanyFormData) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
  className?: string;
  mode?: 'create' | 'edit';
}

export function CompanyForm({
  initialData,
  onSubmit,
  loading = false,
  submitLabel,
  className,
  mode = 'create',
}: CompanyFormProps) {
  // モードに応じてスキーマを選択
  const schema = mode === 'edit' ? editCompanySchema : createCompanySchema;
  const defaultSubmitLabel = mode === 'edit' ? '更新' : '登録';

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      nameKana: '',
      corporateNumber: '',
      address: '',
      phoneNumber: '',
      email: '',
      representativeName: '',
      representativePosition: '',
      businessType: '',
      establishedDate: '',
      capital: '',
      employeeCount: 0,
      notes: '',
    },
  });

  // 編集モードで初期データが変更されたらフォームを更新
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      form.reset({
        name: initialData.name || '',
        nameKana: initialData.nameKana || '',
        corporateNumber: initialData.corporateNumber || '',
        address: initialData.address || '',
        phoneNumber: initialData.phoneNumber || '',
        email: initialData.email || '',
        representativeName: initialData.representativeName || '',
        representativePosition: initialData.representativePosition || '',
        businessType: initialData.businessType || '',
        establishedDate: initialData.establishedDate || '',
        capital: initialData.capital || '',
        employeeCount: initialData.employeeCount || 0,
        notes: initialData.notes || '',
      });
    }
  }, [initialData, form, mode]);

  const handleSubmit = async (data: CompanyFormData) => {
    try {
      await onSubmit(data);
      if (mode === 'create') {
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
              <Building2 className="h-5 w-5" />
              基本情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField name="name" label="会社名" required placeholder="株式会社サンプル" />

              <InputField
                name="nameKana"
                label="会社名（カナ）"
                required
                placeholder="カブシキガイシャサンプル"
              />

              <InputField
                name="corporateNumber"
                label="法人番号"
                placeholder="1234567890123"
                description="13桁の数字（任意）"
              />

              <SelectField
                name="businessType"
                label="事業種別"
                required
                options={BUSINESS_TYPE_OPTIONS}
              />

              <InputField name="establishedDate" label="設立日" type="date" />
            </div>

            <div className="space-y-2">
              <InputField name="address" label="住所" required placeholder="東京都渋谷区..." />
            </div>
          </CardContent>
        </Card>

        {/* 連絡先情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              連絡先情報
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField name="phoneNumber" label="電話番号" required placeholder="03-1234-5678" />

              <InputField
                name="email"
                label="メールアドレス"
                required
                type="email"
                placeholder="info@example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* 代表者情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              代表者情報
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                name="representativeName"
                label="代表者名"
                required
                placeholder="山田太郎"
              />

              <InputField name="representativePosition" label="役職" placeholder="代表取締役" />
            </div>
          </CardContent>
        </Card>

        {/* その他情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              その他情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField name="capital" label="資本金" placeholder="1000万円" />

              <InputField
                name="employeeCount"
                label="従業員数"
                type="number"
                placeholder="100"
                min="1"
              />
            </div>

            <TextareaField
              name="notes"
              label="備考"
              placeholder="その他の情報があれば入力してください"
              rows={4}
            />
          </CardContent>
        </Card>

        {/* フォームアクション */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => form.reset()} disabled={loading}>
            リセット
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? '処理中...' : submitLabel || defaultSubmitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
