'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useBreadcrumb } from '@/hooks/use-breadcrumb';
import Link from 'next/link';

export const BreadcrumbNav = () => {
  const breadcrumbs = useBreadcrumb();

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => (
          <div key={`${item.title}-${index}`} className="flex items-center">
            <BreadcrumbItem>
              {item.isCurrentPage ? (
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href!}>{item.title}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator className="pl-2" />}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
