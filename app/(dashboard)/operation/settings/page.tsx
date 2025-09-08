import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, List, Edit } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">設定</h1>
        <Button asChild>
          <Link href="/operation/admins/register">
            <Plus className="mr-2 h-4 w-4" />
            運営者登録
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">運営者登録</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>新しい運営者を登録</CardDescription>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link href="/operation/admins/register">登録</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">運営者一覧</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>登録済み運営者の一覧</CardDescription>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link href="/operation/admins">一覧表示</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">運営者編集</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>運営者情報の編集</CardDescription>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link href="/operation/admins/edit">編集</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
