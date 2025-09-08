'use client';

import { ClickableStatCard } from '@/components/1_atoms/cards/clickable-stat-card';
import { StatCard } from '@/components/1_atoms/cards/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGroupStats } from '@/hooks/use-groups';
import { useTeamStats } from '@/hooks/use-teams';
import {
  Activity,
  AlertCircle,
  Calendar,
  FileText,
  MessageSquare,
  TrendingUp,
  UserCheck,
  Users,
  UsersIcon,
} from 'lucide-react';

export default function FacilityDashboardPage() {
  const { data: groupStats } = useGroupStats();
  const { data: teamStats } = useTeamStats();

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">事業所管理者ダッシュボード</h1>
        <p className="text-muted-foreground">事業所の運営状況と重要な指標をご確認いただけます。</p>
      </div>

      {/* 統計カード */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ClickableStatCard
          title="利用者数"
          value="48"
          description="+2 今月"
          icon={Users}
          onClick={() => (window.location.href = '/facility/residents')}
        />
        <ClickableStatCard
          title="職員数"
          value="15"
          description="+1 今月"
          icon={UserCheck}
          onClick={() => (window.location.href = '/facility/staff')}
        />
        <ClickableStatCard
          title="グループ数"
          value={groupStats?.activeGroups?.toString() || '0'}
          description={`総${groupStats?.totalGroups || 0}グループ`}
          icon={UsersIcon}
          onClick={() => (window.location.href = '/facility/settings/groups')}
        />
        <ClickableStatCard
          title="チーム数"
          value={teamStats?.activeTeams?.toString() || '0'}
          description={`総${teamStats?.totalTeams || 0}チーム`}
          icon={UsersIcon}
          onClick={() => (window.location.href = '/facility/settings/teams')}
        />
      </div>

      {/* 追加の統計カード */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="今日の記録数" value="127" icon={FileText} />
        <StatCard
          title="未読連絡"
          value="3"
          icon={MessageSquare}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
        <StatCard
          title="総メンバー数"
          value={(groupStats?.totalMembers || 0).toString()}
          icon={Users}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
      </div>

      {/* メインコンテンツエリア */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 最近の活動 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              最近の活動
            </CardTitle>
            <CardDescription>過去24時間の主な活動履歴</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-medium">田中様のバイタル記録が更新されました</p>
                <p className="text-xs text-muted-foreground">2時間前</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="h-2 w-2 bg-blue-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-medium">新しい職員が登録されました</p>
                <p className="text-xs text-muted-foreground">4時間前</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="h-2 w-2 bg-orange-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-medium">月次研修の参加者募集が開始されました</p>
                <p className="text-xs text-muted-foreground">6時間前</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 今日の予定・アラート */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              今日の予定・アラート
            </CardTitle>
            <CardDescription>確認が必要な項目</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-800">閾値超過アラート</p>
                <p className="text-xs text-orange-600">山田様の血圧が設定値を超えています</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">職員研修</p>
                <p className="text-xs text-muted-foreground">14:00 - 16:00 会議室A</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <FileText className="h-4 w-4 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">月次レポート作成</p>
                <p className="text-xs text-muted-foreground">締切: 今日中</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 月次サマリー */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            月次サマリー
          </CardTitle>
          <CardDescription>今月の運営指標</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-green-600">98.5%</div>
              <p className="text-sm text-muted-foreground">記録完了率</p>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">87.2%</div>
              <p className="text-sm text-muted-foreground">職員出席率</p>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">4.8</div>
              <p className="text-sm text-muted-foreground">満足度スコア</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
