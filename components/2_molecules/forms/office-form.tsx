import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { Company } from '@/types/company';
import type { CreateOfficeFormData, EditOfficeFormData } from '@/types/office';
import { Office } from '@/types/office';
import { createOfficeSchema, editOfficeSchema } from '@/validations/office-validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Clock, FileText, Phone } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { InputField, SelectField, TextareaField } from './form-field';

const STATUS_OPTIONS = [
  { value: 'active', label: '稼働中' },
  { value: 'inactive', label: '停止中' },
  { value: 'suspended', label: '一時停止' },
];

const DEFAULT_OPERATING_HOURS = {
  monday: { isOpen: false, openTime: '', closeTime: '' },
  tuesday: { isOpen: false, openTime: '', closeTime: '' },
  wednesday: { isOpen: false, openTime: '', closeTime: '' },
  thursday: { isOpen: false, openTime: '', closeTime: '' },
  friday: { isOpen: false, openTime: '', closeTime: '' },
  saturday: { isOpen: false, openTime: '', closeTime: '' },
  sunday: { isOpen: false, openTime: '', closeTime: '' },
};

// 共通のフォームデータ型
type OfficeFormData = CreateOfficeFormData | EditOfficeFormData;

interface OfficeFormProps {
  companies: Company[];
  // 編集モードの場合は既存の事業所データを渡す
  initialData?: Office;
  onSubmit: (data: OfficeFormData) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
  className?: string;
  mode?: 'create' | 'edit';
}

export function OfficeForm({
  companies,
  initialData,
  onSubmit,
  loading = false,
  submitLabel,
  className,
  mode = 'create',
}: OfficeFormProps) {
  // モードに応じてスキーマを選択
  const schema = mode === 'edit' ? editOfficeSchema : createOfficeSchema;
  const defaultSubmitLabel = mode === 'edit' ? '更新' : '登録';

  const form = useForm<OfficeFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      companyId: '',
      address: '',
      phoneNumber: '',
      email: '',
      establishedDate: '',
      capacity: 1,
      managerId: '',
      operatingHours: DEFAULT_OPERATING_HOURS,
      services: [],
      status: 'active',
      notes: '',
    },
  });

  // 編集モードで初期データが変更されたらフォームを更新
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      form.reset({
        name: initialData.name || '',
        companyId: initialData.companyId || '',
        address: initialData.address || '',
        phoneNumber: initialData.phoneNumber || '',
        email: initialData.email || '',
        establishedDate: initialData.establishedDate || '',
        capacity: initialData.capacity || 1,
        managerId: initialData.managerId || '',
        operatingHours: initialData.operatingHours || DEFAULT_OPERATING_HOURS,
        services: [],
        status: initialData.status || 'active',
        notes: initialData.description || '',
      });
    }
  }, [initialData, form, mode]);

  const handleSubmit = async (data: OfficeFormData) => {
    try {
      await onSubmit(data);
      if (mode === 'create') {
        form.reset();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const companyOptions = companies.map((company) => ({
    value: company.id,
    label: company.name,
  }));

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
              <InputField name="name" label="事業所名" required placeholder="サンプル事業所" />

              <SelectField
                name="companyId"
                label="法人"
                required
                options={companyOptions}
                placeholder="法人を選択してください"
              />

              <InputField name="establishedDate" label="開設日" required type="date" />

              <InputField
                name="capacity"
                label="定員"
                required
                type="number"
                placeholder="50"
                min="1"
                max="9999"
              />

              <SelectField name="status" label="ステータス" options={STATUS_OPTIONS} />
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
                type="email"
                placeholder="info@example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* 営業時間 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              営業時間
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(DEFAULT_OPERATING_HOURS).map(([day, hours]) => (
                <div key={day} className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`${day}-open`}
                      // @ts-ignore - Dynamic path access for operatingHours
                      checked={form.watch(`operatingHours.${day}.isOpen`)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        // @ts-ignore - Dynamic path access for operatingHours
                        form.setValue(`operatingHours.${day}.isOpen`, checked);
                        if (!checked) {
                          // @ts-ignore - Dynamic path access for operatingHours
                          form.setValue(`operatingHours.${day}.openTime`, '');
                          // @ts-ignore - Dynamic path access for operatingHours
                          form.setValue(`operatingHours.${day}.closeTime`, '');
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={`${day}-open`} className="text-sm font-medium capitalize">
                      {day === 'monday' && '月曜日'}
                      {day === 'tuesday' && '火曜日'}
                      {day === 'wednesday' && '水曜日'}
                      {day === 'thursday' && '木曜日'}
                      {day === 'friday' && '金曜日'}
                      {day === 'saturday' && '土曜日'}
                      {day === 'sunday' && '日曜日'}
                    </label>
                  </div>
                  {/* @ts-ignore - Dynamic path access for operatingHours */}
                  {form.watch(`operatingHours.${day}.isOpen`) && (
                    <div className="grid grid-cols-2 gap-2">
                      <InputField
                        name={`operatingHours.${day}.openTime`}
                        label="開店時間"
                        type="time"
                        className="col-span-1"
                      />
                      <InputField
                        name={`operatingHours.${day}.closeTime`}
                        label="閉店時間"
                        type="time"
                        className="col-span-1"
                      />
                    </div>
                  )}
                </div>
              ))}
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
          <CardContent>
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
