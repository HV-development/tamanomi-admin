'use client';

import { cn } from '@/lib/utils';
import { Users } from 'lucide-react';

interface CapacityIndicatorProps {
  current: number;
  capacity: number;
  className?: string;
}

export function CapacityIndicator({ current, capacity, className }: CapacityIndicatorProps) {
  const rate = Math.round((current / capacity) * 100);

  return (
    <div className={cn('space-y-0.5', className)}>
      <div className="flex items-center space-x-1">
        <Users className="h-3 w-3 text-muted-foreground flex-shrink-0" />
        <span className="font-medium text-sm">
          {current}/{capacity}
        </span>
      </div>
      <div className="text-xs text-muted-foreground">稼働率: {rate}%</div>
    </div>
  );
}
