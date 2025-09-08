import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Building2, Settings2, Users } from 'lucide-react';
import Link from 'next/link';

export default function OperationDashboardPage() {
  return (
    <div className="space-y-6">
      {/* 統計カード */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card x-chunk="dashboard-01-chunk-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総事業所数</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">前月比 +20.1%</p>
          </CardContent>
        </Card>
        <Card x-chunk="dashboard-01-chunk-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ケアマネージャー数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">前月比 +180.1%</p>
          </CardContent>
        </Card>
        <Card x-chunk="dashboard-01-chunk-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アクティブユーザー</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">前月比 +19%</p>
          </CardContent>
        </Card>
        <Card x-chunk="dashboard-01-chunk-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">システム設定</CardTitle>
            <Settings2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">設定項目数</p>
          </CardContent>
        </Card>
      </div>

      {/* メインコンテンツ */}
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>最近の活動</CardTitle>
              <CardDescription>システム内での最近の活動状況</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                  <Building2 className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">新しい事業所が登録されました</p>
                  <p className="text-sm text-muted-foreground">2時間前</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    ケアマネージャーが追加されました
                  </p>
                  <p className="text-sm text-muted-foreground">4時間前</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100">
                  <Settings2 className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">システム設定が更新されました</p>
                  <p className="text-sm text-muted-foreground">1日前</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card x-chunk="dashboard-01-chunk-5">
          <CardHeader>
            <CardTitle>クイックアクション</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link href="/operation/offices/register" className="block">
              <div className="flex items-center space-x-4 rounded-md border p-4 transition-colors hover:bg-accent">
                <Building2 className="h-5 w-5" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">事業所の追加</p>
                  <p className="text-sm text-muted-foreground">新しい事業所を登録</p>
                </div>
              </div>
            </Link>
            <Link href="/operation/admins/register" className="block">
              <div className="flex items-center space-x-4 rounded-md border p-4 transition-colors hover:bg-accent">
                <Users className="h-5 w-5" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">管理者の追加</p>
                  <p className="text-sm text-muted-foreground">新しい管理者を登録</p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
