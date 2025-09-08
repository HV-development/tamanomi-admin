import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Building, List, Eye, Edit } from 'lucide-react';
import Link from 'next/link';

export default function OfficesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">事業所管理</h1>
        <Button asChild>
          <Link href="/operation/offices/register">
            <Plus className="mr-2 h-4 w-4" />
            事業所登録
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">事業所登録</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>新しい事業所を登録します</CardDescription>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link href="/operation/offices/register">登録</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">事業所一覧</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>登録済み事業所の一覧</CardDescription>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link href="/operation/offices">一覧表示</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">事業所詳細</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>事業所の詳細情報</CardDescription>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link href="/operation/offices/detail">詳細表示</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">事業所編集</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>事業所情報の編集</CardDescription>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link href="/operation/offices/edit">編集</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">会社管理</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">会社登録</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>新しい会社を登録</CardDescription>
              <Button asChild className="w-full mt-4" variant="outline">
                <Link href="/operation/companies/register">登録</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">会社一覧</CardTitle>
              <List className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>登録済み会社の一覧</CardDescription>
              <Button asChild className="w-full mt-4" variant="outline">
                <Link href="/operation/companies">一覧表示</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">会社編集</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>会社情報の編集</CardDescription>
              <Button asChild className="w-full mt-4" variant="outline">
                <Link href="/operation/companies/edit">編集</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
