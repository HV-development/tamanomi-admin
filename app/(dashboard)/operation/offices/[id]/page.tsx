'use client';

import { ClickableStatCard } from '@/components/1_atoms/cards/clickable-stat-card';
import { FacilityManagersModal } from '@/components/2_molecules/modals/facility-managers-modal';
import { StaffModal } from '@/components/2_molecules/modals/staff-modal';
import { UsersModal } from '@/components/2_molecules/modals/users-modal';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useFacilityManagersByOffice } from '@/hooks/use-facility-managers';
import { useOffice } from '@/hooks/use-offices';
import { useStaffByOffice } from '@/hooks/use-staff';
import { useUsersByOffice } from '@/hooks/use-users';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Edit,
  Globe,
  Heart,
  Mail,
  MapPin,
  Phone,
  UserCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { use, useState } from 'react';
import { toast } from 'sonner';

interface OfficeDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const getStatusBadge = (status: string) => {
  const variants = {
    active: { label: '稼働中', className: 'bg-green-100 text-green-800' },
    inactive: { label: '停止中', className: 'bg-gray-100 text-gray-800' },
    suspended: { label: '一時停止', className: 'bg-yellow-100 text-yellow-800' },
    disabled: { label: '利用停止', className: 'bg-red-100 text-red-800' },
  };

  const config = variants[status as keyof typeof variants] || variants.active;
  return <Badge className={config.className}>{config.label}</Badge>;
};

const getServiceTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'visiting-nursing': '訪問看護',
    'day-service': 'デイサービス',
    'home-help': '訪問介護',
    'care-management': '居宅介護支援',
    'group-home': 'グループホーム',
    rehabilitation: 'リハビリテーション',
  };
  return labels[type] || type;
};

const formatOperatingHours = (
  hours: Record<string, { isOpen: boolean; openTime?: string; closeTime?: string }>
) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = ['月', '火', '水', '木', '金', '土', '日'];

  return days.map((day, index) => {
    const dayHours = hours[day];
    return {
      day: dayLabels[index],
      isOpen: dayHours.isOpen,
      time: dayHours.isOpen ? `${dayHours.openTime} - ${dayHours.closeTime}` : '休業',
    };
  });
};

export default function OfficeDetailPage({ params }: OfficeDetailPageProps) {
  const { id } = use(params);
  const { office, loading, error } = useOffice(id);
  const {
    data: managers,
    loading: managersLoading,
    error: managersError,
    requestPasswordReset,
    deleteManager,
    updateManager,
    updateStatus: updateManagerStatus,
  } = useFacilityManagersByOffice(id);
  const {
    data: staff,
    loading: staffLoading,
    error: staffError,
    deleteStaff,
    updateStaff,
    updateStatus: updateStaffStatus,
  } = useStaffByOffice(id);
  const {
    data: users,
    loading: usersLoading,
    error: usersError,
    deleteUser,
    updateUser,
    updateStatus: updateUserStatus,
  } = useUsersByOffice(id);
  const [showManagersModal, setShowManagersModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);

  const handlePasswordReset = async (managerId: string) => {
    try {
      const result = await requestPasswordReset(managerId);
      toast.success(result.message);
      return result;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'パスワード再発行に失敗しました');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !office) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/operation/offices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">事業所が見つかりません</h1>
            <p className="text-muted-foreground">
              指定された事業所は存在しないか、削除されています
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">事業所の詳細を取得できませんでした</p>
            <Button asChild>
              <Link href="/operation/offices">事業所一覧に戻る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const operatingHours = formatOperatingHours(
    office.operatingHours as unknown as Record<
      string,
      { isOpen: boolean; openTime?: string; closeTime?: string }
    >
  );
  const capacityRate = Math.round((office.currentUsers / office.capacity) * 100);

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/operation/offices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                {office.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{office.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-muted-foreground text-sm">{office.companyName}</p>
                {getStatusBadge(office.status)}
              </div>
            </div>
          </div>
        </div>
        <Button asChild>
          <Link href={`/operation/offices/${office.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            編集
          </Link>
        </Button>
      </div>

      {/* 統計カード */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ClickableStatCard
          title="管理者"
          value={managers.length}
          description="名"
          icon={UserCheck}
          onClick={() => setShowManagersModal(true)}
        />

        <ClickableStatCard
          title="職員"
          value={staff.length}
          description="名"
          icon={Users}
          onClick={() => setShowStaffModal(true)}
        />

        <ClickableStatCard
          title="利用者"
          value={users.length}
          description={`/ ${office.capacity} 名`}
          icon={Heart}
          onClick={() => setShowUsersModal(true)}
        />

        <ClickableStatCard
          title="稼働率"
          value={`${capacityRate}%`}
          description="定員に対する利用率"
          icon={Building2}
        />
      </div>

      {/* 管理者モーダル */}
      <FacilityManagersModal
        open={showManagersModal}
        onOpenChange={setShowManagersModal}
        officeName={office.name}
        managers={managers}
        loading={managersLoading}
        error={managersError}
        onPasswordReset={handlePasswordReset}
        onDelete={deleteManager}
        onEdit={async (managerId, data) => {
          await updateManager(managerId, data);
        }}
        onStatusToggle={async (managerId, status) => {
          await updateManagerStatus(managerId, status);
        }}
      />

      {/* 職員モーダル */}
      <StaffModal
        open={showStaffModal}
        onOpenChange={setShowStaffModal}
        officeName={office.name}
        staff={staff}
        loading={staffLoading}
        error={staffError}
        onDelete={deleteStaff}
        onEdit={async (staffId, data) => {
          await updateStaff(staffId, data);
        }}
        onStatusToggle={async (staffId, status) => {
          await updateStaffStatus(staffId, status);
        }}
      />

      {/* 利用者モーダル */}
      <UsersModal
        open={showUsersModal}
        onOpenChange={setShowUsersModal}
        officeName={office.name}
        users={users}
        loading={usersLoading}
        error={usersError}
        onDelete={deleteUser}
        onEdit={async (userId, data) => {
          await updateUser(userId, data);
        }}
        onStatusToggle={async (userId, status) => {
          await updateUserStatus(userId, status);
        }}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 基本情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              基本情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">住所</p>
                  <p className="text-sm text-muted-foreground">{office.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">サービス種別</p>
                  <Badge variant="outline">{getServiceTypeLabel(office.serviceType)}</Badge>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">開設日</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(office.establishedDate).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </div>

              {office.managerName && (
                <div className="flex items-center gap-3">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">管理者</p>
                    <p className="text-sm text-muted-foreground">{office.managerName}</p>
                  </div>
                </div>
              )}
            </div>

            {office.description && (
              <>
                <Separator />
                <div>
                  <p className="font-medium mb-2">事業所の説明</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {office.description}
                  </p>
                </div>
              </>
            )}
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
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">電話番号</p>
                <p className="text-sm text-muted-foreground">{office.phoneNumber}</p>
              </div>
            </div>

            {office.faxNumber && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">FAX番号</p>
                  <p className="text-sm text-muted-foreground">{office.faxNumber}</p>
                </div>
              </div>
            )}

            {office.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">メールアドレス</p>
                  <p className="text-sm text-muted-foreground">{office.email}</p>
                </div>
              </div>
            )}

            {office.website && (
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">ウェブサイト</p>
                  <a
                    href={office.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {office.website}
                  </a>
                </div>
              </div>
            )}
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
            <div className="space-y-2">
              {operatingHours.map((day, index) => (
                <div key={index} className="flex items-center justify-between py-1">
                  <span className="font-medium">{day.day}曜日</span>
                  <span
                    className={`text-sm ${day.isOpen ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    {day.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
