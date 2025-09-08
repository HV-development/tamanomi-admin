'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGroupStats } from '@/hooks/use-groups';
import { useTeamStats } from '@/hooks/use-teams';
import { ChevronRight, Crown, Settings, Users } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { data: groupStats } = useGroupStats();
  const { data: teamStats } = useTeamStats();

  const settingsCategories = [
    {
      title: '組織管理',
      description: '職員のグループとチームを管理',
      icon: Users,
      items: [
        {
          title: 'グループ管理',
          description: '職種別グループの作成・管理',
          href: '/facility/settings/groups',
          icon: Users,
          stats: `${groupStats?.activeGroups || 0}個のアクティブグループ`,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
        },
        {
          title: 'チーム管理',
          description: '業務チームの作成・管理',
          href: '/facility/settings/teams',
          icon: Crown,
          stats: `${teamStats?.activeTeams || 0}個のアクティブチーム`,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">設定</h1>
        <p className="text-muted-foreground">システムの設定と組織管理を行います。</p>
      </div>

      {/* 設定概要カード */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アクティブグループ</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupStats?.activeGroups || 0}</div>
            <p className="text-xs text-muted-foreground">
              総 {groupStats?.totalGroups || 0} グループ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アクティブチーム</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats?.activeTeams || 0}</div>
            <p className="text-xs text-muted-foreground">総 {teamStats?.totalTeams || 0} チーム</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総メンバー数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupStats?.totalMembers || 0}</div>
            <p className="text-xs text-muted-foreground">全グループ・チーム</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">設定項目</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">設定可能項目</p>
          </CardContent>
        </Card>
      </div>

      {/* 設定カテゴリ */}
      <div className="space-y-6">
        {settingsCategories.map((category) => {
          const CategoryIcon = category.icon;
          return (
            <Card key={category.title}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CategoryIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {category.items.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <div
                        key={item.title}
                        className={`
                        group relative overflow-hidden rounded-lg border p-4 transition-all duration-200
                        ${
                          item.disabled
                            ? 'opacity-60 cursor-not-allowed'
                            : 'hover:bg-accent/50 hover:shadow-md cursor-pointer'
                        }
                      `}
                      >
                        {item.disabled ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                                <IconComponent className={`h-4 w-4 ${item.color}`} />
                              </div>
                              <div>
                                <h4 className="font-medium text-sm">{item.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {item.description}
                                </p>
                                <p className="text-xs text-muted-foreground/80 mt-1">
                                  {item.stats}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                          </div>
                        ) : (
                          <Link href={item.href} className="block">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                                  <IconComponent className={`h-4 w-4 ${item.color}`} />
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                                    {item.title}
                                  </h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {item.description}
                                  </p>
                                  <p className="text-xs text-primary/80 mt-1 font-medium">
                                    {item.stats}
                                  </p>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* クイックアクション */}
      <Card>
        <CardHeader>
          <CardTitle>クイックアクション</CardTitle>
          <CardDescription>よく使用する設定への素早いアクセス</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/facility/settings/groups">
                <Users className="mr-2 h-4 w-4" />
                グループ管理
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/facility/settings/teams">
                <Crown className="mr-2 h-4 w-4" />
                チーム管理
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
