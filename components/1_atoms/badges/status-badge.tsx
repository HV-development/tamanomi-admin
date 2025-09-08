import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          label: '稼働中',
          className: 'bg-green-100 text-green-800 border-green-200',
        };
      case 'disabled':
        return {
          label: '利用停止',
          className: 'bg-red-100 text-red-800 border-red-200',
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge className={cn(config.className, className)} variant="outline">
      {config.label}
    </Badge>
  );
}
