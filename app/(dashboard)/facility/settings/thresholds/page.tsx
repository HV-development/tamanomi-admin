'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Activity,
  ArrowLeft,
  Gauge,
  Heart,
  Plus,
  Settings,
  Thermometer,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

export default function ThresholdsPage() {
  // モックデータ（実際の実装では API から取得）
  const thresholds = [
    {
      id: '1',
      name: '血圧（収縮期）',
      type: 'blood-pressure-systolic',
      minValue: 90,
      maxValue: 140,
      unit: 'mmHg',
      category: 'バイタル',
      alertCount: 3,
      isActive: true,
    },
    {
      id: '2',
      name: '血圧（拡張期）',
      type: 'blood-pressure-diastolic',
      minValue: 60,
      maxValue: 90,
      unit: 'mmHg',
      category: 'バイタル',
      alertCount: 1,
      isActive: true,
    },
    {
      id: '3',
      name: '体温',
      type: 'body-temperature',
      minValue: 36.0,
      maxValue: 37.5,
      unit: '°C',
      category: 'バイタル',
      alertCount: 5,
      isActive: true,
    },
    {
      id: '4',
      name: '脈拍',
      type: 'pulse-rate',
      minValue: 60,
      maxValue: 100,
      unit: 'bpm',
      category: 'バイタル',
      alertCount: 2,
      isActive: true,
    },
    {
      id: '5',
      name: '体重変動',
      type: 'weight-change',
      minValue: -2.0,
      maxValue: 2.0,
      unit: 'kg/月',
      category: '身体測定',
      alertCount: 0,
      isActive: false,
    },
  ];

  const getThresholdIcon = (type: string) => {
    switch (type) {
      case 'blood-pressure-systolic':
      case 'blood-pressure-diastolic':
        return Heart;
      case 'body-temperature':
        return Thermometer;
      case 'pulse-rate':
        return Activity;
      case 'weight-change':
        return TrendingUp;
      default:
        return Gauge;
    }
  };

  const getAlertLevel = (alertCount: number) => {
    if (alertCount === 0) return { color: 'text-green-600', bg: 'bg-green-100', label: '正常' };
    if (alertCount <= 2) return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: '注意' };
    return { color: 'text-red-600', bg: 'bg-red-100', label: '警告' };
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
          <h1 className="text-2xl font-bold tracking-tight">閾値設定</h1>
          <p className="text-muted-foreground">バイタルサインや測定値の閾値を設定・管理します。</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新規閾値設定
        </Button>
      </div>

      {/* 統計カード */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総閾値設定数</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thresholds.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アクティブ設定</CardTitle>
            <Settings className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thresholds.filter((t) => t.isActive).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アラート発生中</CardTitle>
            <Activity className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {thresholds.reduce((sum, t) => sum + t.alertCount, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">要注意項目</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {thresholds.filter((t) => t.alertCount > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 閾値設定一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>閾値設定一覧</CardTitle>
          <CardDescription>現在設定されている閾値の一覧です。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {thresholds.map((threshold) => {
              const IconComponent = getThresholdIcon(threshold.type);
              const alertLevel = getAlertLevel(threshold.alertCount);

              return (
                <div
                  key={threshold.id}
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
                            {threshold.name}
                          </h4>
                          <Badge
                            variant={threshold.isActive ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {threshold.isActive ? 'アクティブ' : '無効'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {threshold.minValue} - {threshold.maxValue} {threshold.unit}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {threshold.category}
                          </Badge>
                          <div
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${alertLevel.bg} ${alertLevel.color}`}
                          >
                            <Activity className="h-3 w-3" />
                            {threshold.alertCount > 0
                              ? `${threshold.alertCount}件のアラート`
                              : alertLevel.label}
                          </div>
                        </div>
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
            <Gauge className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold text-muted-foreground">閾値設定機能</h3>
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
