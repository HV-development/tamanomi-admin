import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, List, Eye, Edit } from 'lucide-react';
import Link from 'next/link';

export default function CareManagersPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">ケアマネージャー管理</h1>
        <Button asChild>
          <Link href="/operation/care-managers/register">
            <Plus className="mr-2 h-4 w-4" />
            ケアマネージャー登録
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ケアマネージャー登録</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>新しいケアマネージャーを登録</CardDescription>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link href="/operation/care-managers/register">登録</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ケアマネージャー一覧</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>登録済みケアマネージャーの一覧</CardDescription>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link href="/operation/care-managers">一覧表示</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ケアマネージャー詳細</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>ケアマネージャーの詳細情報</CardDescription>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link href="/operation/care-managers/detail">詳細表示</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ケアマネージャー編集</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>ケアマネージャー情報の編集</CardDescription>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link href="/operation/care-managers/edit">編集</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
