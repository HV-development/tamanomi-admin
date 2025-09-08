import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface ClickableStatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  onClick?: () => void;
  className?: string;
}

export function ClickableStatCard({
  title,
  value,
  description,
  icon: Icon,
  onClick,
  className,
}: ClickableStatCardProps) {
  return (
    <Card
      className={cn(
        onClick &&
          'cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}
