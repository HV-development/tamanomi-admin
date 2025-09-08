'use client';

import { Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchProps {
  placeholder?: string;
}

export function Search({ placeholder = '検索...' }: SearchProps) {
  return (
    <div className="relative">
      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input type="search" placeholder={placeholder} className="pl-8 md:w-[200px] lg:w-[300px]" />
    </div>
  );
}
