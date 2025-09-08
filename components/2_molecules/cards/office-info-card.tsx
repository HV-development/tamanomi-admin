'use client';

import { StatusBadge } from '@/components/1_atoms/badges/status-badge';
import { MapPin, Phone } from 'lucide-react';

interface OfficeInfoCardProps {
  name: string;
  address: string;
  phoneNumber: string;
  status: 'active' | 'inactive' | 'suspended';
  companyName: string;
  managerName?: string;
}

export function OfficeInfoCard({
  name,
  address,
  phoneNumber,
  status,
  companyName,
  managerName,
}: OfficeInfoCardProps) {
  return (
    <div className="flex items-center space-x-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="font-medium text-foreground truncate">{name}</div>
          <StatusBadge status={status} />
        </div>
        <div className="flex items-center text-sm text-muted-foreground mb-1">
          <MapPin className="mr-1 h-3 w-3" />
          <span className="truncate">{address}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Phone className="mr-1 h-3 w-3" />
          <span>{phoneNumber}</span>
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {companyName}
          {managerName && ` • 管理者: ${managerName}`}
        </div>
      </div>
    </div>
  );
}
