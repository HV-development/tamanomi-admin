'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, ArrowLeft, Clock, FileText, Plus, Settings, Users } from 'lucide-react';
import Link from 'next/link';

export default function TemplatesPage() {
  // モックデータ（実際の実装では API から取得）
  const templates = [
    {
      id: '1',
      name: '日常介護記録',
      description: '日常的な介護業務の記録テンプレート',
      type: 'care-record',
      usageCount: 45,
      lastUsed: '2024-01-15',
      isActive: true,
      category: '介護記録',
    },
    {
      id: '2',
      name: 'バイタル測定記録',
      description: '血圧、体温、脈拍の測定記録テンプレート',
      type: 'vital-record',
      usageCount: 38,
      lastUsed: '2024-01-14',
      isActive: true,
      category: 'バイタル',
    },
    {
      id: '3',
      name: '服薬確認記録',
      description: '服薬状況の確認と記録テンプレート',
      type: 'medication-record',
      usageCount: 22,
      lastUsed: '2024-01-13',
      isActive: true,
      category: '服薬管理',
    },
    {
      id: '4',
      name: '月次報告書',
      description: '利用者の月次状況報告書テンプレート',
      type: 'monthly-report',
      usageCount: 8,
      lastUsed: '2024-01-01',
      isActive: false,
      category: 'レポート',
    },
  ];

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'care-record':
        return FileText;
      case 'vital-record':
        return Activity;
      case 'medication-record':
        return Clock;
      case 'monthly-report':
        return Users;
      default:
        return FileText;
    }
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
          <h1 className="text-2xl font-bold tracking-tight">テンプレート管理</h1>
          <p className="text-muted-foreground">記録作成用のテンプレートを管理します。</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新規テンプレート作成
        </Button>
      </div>

      {/* 統計カード */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総テンプレート数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アクティブ</CardTitle>
            <Settings className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.filter((t) => t.isActive).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総使用回数</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.reduce((sum, t) => sum + t.usageCount, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均使用回数</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(templates.reduce((sum, t) => sum + t.usageCount, 0) / templates.length)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* テンプレート一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>テンプレート一覧</CardTitle>
          <CardDescription>現在設定されているテンプレートの一覧です。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template) => {
              const IconComponent = getTemplateIcon(template.type);

              return (
                <div
                  key={template.id}
                  className="group relative overflow-hidden rounded-lg border p-4 transition-all duration-200 hover:bg-accent/50 hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconComponent className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                            {template.name}
                          </h4>
                          <Badge
                            variant={template.isActive ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {template.isActive ? 'アクティブ' : '無効'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-xs text-primary/80 font-medium">
                            使用回数: {template.usageCount}回
                          </p>
                          <p className="text-xs text-muted-foreground">
                            最終使用: {new Date(template.lastUsed).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs mt-2">
                          {template.category}
                        </Badge>
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
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold text-muted-foreground">
              テンプレート管理機能
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
