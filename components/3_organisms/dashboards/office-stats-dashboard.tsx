'use client';

import { OfficeStatsSummary } from '@/components/2_molecules/cards/office-stats-summary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { OfficeStats } from '@/types/office';
import { TrendingUp } from 'lucide-react';

interface OfficeStatsDashboardProps {
  stats: OfficeStats | null;
  loading: boolean;
}

export function OfficeStatsDashboard({ stats, loading }: OfficeStatsDashboardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          事業所統計
        </CardTitle>
      </CardHeader>
      <CardContent>
        <OfficeStatsSummary stats={stats} loading={loading} />
      </CardContent>
    </Card>
  );
}
