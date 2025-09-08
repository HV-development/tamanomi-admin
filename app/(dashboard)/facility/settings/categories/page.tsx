'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, ArrowLeft, FileText, Plus, Settings, Tag, Users } from 'lucide-react';
import Link from 'next/link';

export default function CategoriesPage() {
  // モックデータ（実際の実装では API から取得）
  const categories = [
    {
      id: '1',
      name: '介護記録',
      description: '日常の介護業務に関する記録',
      type: 'care-record',
      itemCount: 15,
      color: 'blue',
      isActive: true,
    },
    {
      id: '2',
      name: 'バイタル測定',
      description: '血圧、体温等の生体情報',
      type: 'vital',
      itemCount: 8,
      color: 'green',
      isActive: true,
    },
    {
      id: '3',
      name: '服薬管理',
      description: '薬剤の管理と服薬記録',
      type: 'medication',
      itemCount: 12,
      color: 'orange',
      isActive: true,
    },
    {
      id: '4',
      name: 'リハビリテーション',
      description: 'リハビリ関連の記録',
      type: 'rehabilitation',
      itemCount: 6,
      color: 'purple',
      isActive: false,
    },
  ];

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'care-record':
        return FileText;
      case 'vital':
        return Activity;
      case 'medication':
        return Tag;
      case 'rehabilitation':
        return Users;
      default:
        return Tag;
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
      green: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/facility/settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">カスタムカテゴリ</h1>
          <p className="text-muted-foreground">記録や管理項目のカテゴリを設定・管理します。</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新規カテゴリ作成
        </Button>
      </div>

      {/* 統計カード */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総カテゴリ数</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アクティブ</CardTitle>
            <Settings className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.filter((c) => c.isActive).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総項目数</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.reduce((sum, c) => sum + c.itemCount, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均項目数</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(categories.reduce((sum, c) => sum + c.itemCount, 0) / categories.length)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* カテゴリ一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>カテゴリ一覧</CardTitle>
          <CardDescription>現在設定されているカテゴリの一覧です。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {categories.map((category) => {
              const IconComponent = getCategoryIcon(category.type);
              const colorClasses = getColorClasses(category.color);

              return (
                <div
                  key={category.id}
                  className={`
                    group relative overflow-hidden rounded-lg border p-4 transition-all duration-200
                    hover:bg-accent/50 hover:shadow-md cursor-pointer
                    ${colorClasses.border}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${colorClasses.bg}`}>
                        <IconComponent className={`h-4 w-4 ${colorClasses.text}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                            {category.name}
                          </h4>
                          <Badge
                            variant={category.isActive ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {category.isActive ? 'アクティブ' : '無効'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                        <p className="text-xs text-primary/80 mt-2 font-medium">
                          {category.itemCount}個の項目
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 開発中の通知 */}
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Settings className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold text-muted-foreground">
              カスタムカテゴリ機能
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              この機能は現在開発中です。
              <br />
              近日中に利用可能になる予定です。
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/facility/settings">設定画面に戻る</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
