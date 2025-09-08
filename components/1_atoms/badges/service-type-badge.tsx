'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ServiceTypeBadgeProps {
  serviceType: string;
  className?: string;
}

const serviceTypeLabels: Record<string, string> = {
  'visiting-nursing': '訪問看護',
  'day-service': 'デイサービス',
  'home-help': '訪問介護',
  'care-management': '居宅介護支援',
  'group-home': 'グループホーム',
  rehabilitation: 'リハビリテーション',
};

export function ServiceTypeBadge({ serviceType, className }: ServiceTypeBadgeProps) {
  const label = serviceTypeLabels[serviceType] || serviceType;

  return (
    <Badge variant="outline" className={cn('font-medium', className)}>
      {label}
    </Badge>
  );
}
