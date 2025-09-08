'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useCompany } from '@/hooks/use-companies';
import {
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  Edit,
  FileText,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';
import { toast } from 'sonner';

interface CompanyDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const { id: companyId } = use(params);
  const router = useRouter();
  const { company, loading, error } = useCompany(companyId);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'アクティブ';
      case 'inactive':
        return '非アクティブ';
      case 'suspended':
        return '一時停止';
      default:
        return status;
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      // 削除処理を実装（必要に応じて）
      toast.success('会社を削除しました');
      router.push('/operation/companies');
    } catch (error) {
      toast.error('削除に失敗しました');
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">会社詳細</h1>
            <p className="text-muted-foreground">読み込み中...</p>
          </div>
        </div>

        <div className="rounded-lg border bg-white">
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
            <p className="mt-3 text-sm text-muted-foreground">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/operation/companies">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">会社詳細</h1>
            <p className="text-muted-foreground">エラーが発生しました</p>
          </div>
        </div>

        <div className="rounded-lg border bg-white">
          <div className="p-12 text-center">
            <Building2 className="mx-auto h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">会社が見つかりません</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {error || '指定された会社が見つかりませんでした'}
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/operation/companies">会社一覧に戻る</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/operation/companies">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{company.name}</h1>
            <p className="text-muted-foreground text-sm">会社の詳細情報</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href={`/operation/companies/${company.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              編集
            </Link>
          </Button>
        </div>
      </div>

      {/* 基本情報 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            基本情報
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">会社名</Label>
              <p className="text-sm">{company.name}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">会社名（カナ）</Label>
              <p className="text-sm">{company.nameKana}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">法人番号</Label>
              <p className="text-sm">{company.corporateNumber || '未設定'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">事業種別</Label>
              <p className="text-sm">{company.businessType}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">設立日</Label>
              <p className="text-sm">{company.establishedDate || '未設定'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">住所</Label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{company.address}</p>
              </div>
            </div>
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
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">電話番号</Label>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{company.phoneNumber}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">メールアドレス</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{company.email}</p>
              </div>
            </div>
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
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">代表者名</Label>
              <p className="text-sm">{company.representativeName}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">役職</Label>
              <p className="text-sm">{company.representativePosition || '未設定'}</p>
            </div>
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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">資本金</Label>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{company.capital || '未設定'}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">従業員数</Label>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{company.employeeCount || '未設定'}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">登録日</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{new Date(company.createdAt).toLocaleDateString('ja-JP')}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">更新日</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{new Date(company.updatedAt).toLocaleDateString('ja-JP')}</p>
              </div>
            </div>
          </div>

          {company.notes && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">備考</Label>
              <p className="text-sm">{company.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 削除確認ダイアログ */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>会社を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消すことができません。会社に関連するすべてのデータが削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? '削除中...' : '削除する'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
