'use client';

import { StatCard } from '@/components/1_atoms/cards/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { OfficeStats } from '@/types/office';
import { AlertTriangle, Building2, Calendar, Percent, UserCheck, Users } from 'lucide-react';

interface OfficeStatsSummaryProps {
  stats: OfficeStats | null;
  loading: boolean;
}

export function OfficeStatsSummary({ stats, loading }: OfficeStatsSummaryProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: '総事業所数',
      value: stats.totalOffices,
      description: '登録済み事業所',
      icon: Building2,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100',
    },
    {
      title: '稼働中事業所',
      value: stats.activeOffices,
      description: `稼働率 ${Math.round((stats.activeOffices / stats.totalOffices) * 100)}%`,
      icon: UserCheck,
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-100',
    },
    {
      title: '総職員数',
      value: stats.totalStaff,
      description: '全事業所合計',
      icon: Users,
      iconColor: 'text-purple-600',
      iconBgColor: 'bg-purple-100',
    },
    {
      title: '総利用者数',
      value: stats.totalUsers,
      description: '全事業所合計',
      icon: Users,
      iconColor: 'text-indigo-600',
      iconBgColor: 'bg-indigo-100',
    },
    {
      title: '今月の新規登録',
      value: stats.newThisMonth,
      description: '新規事業所',
      icon: Calendar,
      iconColor: 'text-cyan-600',
      iconBgColor: 'bg-cyan-100',
    },
    {
      title: '要確認事業所',
      value: stats.needsAttention,
      description: stats.needsAttention === 0 ? '問題なし' : '確認が必要',
      icon: AlertTriangle,
      iconColor: stats.needsAttention > 0 ? 'text-red-600' : 'text-gray-600',
      iconBgColor: stats.needsAttention > 0 ? 'bg-red-100' : 'bg-gray-100',
    },
    {
      title: '平均稼働率',
      value: `${stats.averageCapacityRate}%`,
      description: '定員に対する利用率',
      icon: Percent,
      iconColor: 'text-orange-600',
      iconBgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={stat.icon}
          iconColor={stat.iconColor}
          iconBgColor={stat.iconBgColor}
        />
      ))}
    </div>
  );
}
