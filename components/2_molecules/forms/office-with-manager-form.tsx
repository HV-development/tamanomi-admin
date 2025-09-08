import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Company } from '@/types/company';
import type { OfficeWithManagerRegistration } from '@/types/facility-manager';
import { officeWithManagerSchema } from '@/validations/facility-manager-validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { InputField, SelectField, TextareaField } from './form-field';

const SERVICE_TYPE_OPTIONS = [
  { value: 'visiting-nursing', label: '訪問看護' },
  { value: 'day-service', label: 'デイサービス' },
  { value: 'home-help', label: 'ホームヘルプ' },
  { value: 'care-management', label: 'ケアマネジメント' },
  { value: 'group-home', label: 'グループホーム' },
  { value: 'rehabilitation', label: 'リハビリテーション' },
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

interface OfficeWithManagerFormProps {
  companies: Company[];
  onSubmit: (data: OfficeWithManagerRegistration) => Promise<void>;
  loading?: boolean;
  className?: string;
}

export function OfficeWithManagerForm({
  companies,
  onSubmit,
  loading = false,
  className,
}: OfficeWithManagerFormProps) {
  const form = useForm<OfficeWithManagerRegistration>({
    resolver: zodResolver(officeWithManagerSchema),
    defaultValues: {
      office: {
        name: '',
        companyId: '',
        address: '',
        phoneNumber: '',
        faxNumber: '',
        email: '',
        website: '',
        serviceType: 'day-service',
        establishedDate: '',
        capacity: 10,
        description: '',
        operatingHours: DEFAULT_OPERATING_HOURS,
        services: [],
        notes: '',
      },
      manager: {
        name: '',
        nameKana: '',
        email: '',
        phoneNumber: '',
        position: '',
        notes: '',
      },
    },
  });

  const companyOptions = companies.map((company) => ({
    value: company.id,
    label: company.name,
  }));

  const handleSubmit = async (data: OfficeWithManagerRegistration) => {
    await onSubmit(data);
  };

  return (
    <div className={cn('space-y-6', className)}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* 事業所情報セクション */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                事業所情報
              </CardTitle>
              <CardDescription>新規登録する事業所の基本情報を入力してください。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  control={form.control}
                  name="office.name"
                  label="事業所名"
                  placeholder="例: ○○デイサービスセンター"
                  required
                />
                <SelectField
                  control={form.control}
                  name="office.companyId"
                  label="法人"
                  placeholder="法人を選択してください"
                  options={companyOptions}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  control={form.control}
                  name="office.serviceType"
                  label="サービス種別"
                  options={SERVICE_TYPE_OPTIONS}
                  required
                />
                <InputField
                  control={form.control}
                  name="office.capacity"
                  label="定員"
                  type="number"
                  placeholder="10"
                  required
                />
              </div>

              <InputField
                control={form.control}
                name="office.address"
                label="住所"
                placeholder="例: 東京都新宿区○○1-2-3"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField
                  control={form.control}
                  name="office.phoneNumber"
                  label="電話番号"
                  placeholder="例: 03-1234-5678"
                  required
                />
                <InputField
                  control={form.control}
                  name="office.faxNumber"
                  label="FAX番号"
                  placeholder="例: 03-1234-5679"
                />
                <InputField
                  control={form.control}
                  name="office.email"
                  label="メールアドレス"
                  type="email"
                  placeholder="例: info@example.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  control={form.control}
                  name="office.website"
                  label="ウェブサイト"
                  placeholder="例: https://example.com"
                />
                <InputField
                  control={form.control}
                  name="office.establishedDate"
                  label="開設日"
                  type="date"
                  required
                />
              </div>

              <TextareaField
                control={form.control}
                name="office.description"
                label="事業所の説明"
                placeholder="事業所の特徴やサービス内容について記載してください"
                rows={3}
              />

              <TextareaField
                control={form.control}
                name="office.notes"
                label="備考"
                placeholder="その他特記事項があれば記載してください"
                rows={2}
              />
            </CardContent>
          </Card>

          {/* 管理者情報セクション */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                事業所管理者情報
              </CardTitle>
              <CardDescription>
                事業所管理者のアカウント情報を入力してください。登録後、自動でパスワードが発行されます。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  control={form.control}
                  name="manager.name"
                  label="管理者名"
                  placeholder="例: 田中 太郎"
                  required
                />
                <InputField
                  control={form.control}
                  name="manager.nameKana"
                  label="管理者名（カナ）"
                  placeholder="例: タナカ タロウ"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  control={form.control}
                  name="manager.email"
                  label="メールアドレス（ログインID）"
                  type="email"
                  placeholder="例: manager@example.com"
                  required
                />
                <InputField
                  control={form.control}
                  name="manager.phoneNumber"
                  label="電話番号"
                  placeholder="例: 090-1234-5678"
                  required
                />
              </div>

              <InputField
                control={form.control}
                name="manager.position"
                label="役職"
                placeholder="例: 管理者、施設長"
              />

              <TextareaField
                control={form.control}
                name="manager.notes"
                label="備考"
                placeholder="管理者に関する特記事項があれば記載してください"
                rows={2}
              />
            </CardContent>
          </Card>

          <Separator />

          <div className="flex justify-end gap-3">
            <Button type="submit" disabled={loading} size="lg">
              {loading ? '登録中...' : '事業所と管理者を登録'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
