'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSidebar } from '@/components/ui/sidebar';
import {
  getAvailableFeatures,
  getNavigationLinks,
  getRoleAvatarInitial,
  getRoleDisplayName,
} from '@/lib/navigation-utils';
import { UserRole } from '@/types/auth';
import { LogOut, PlusCircle, User } from 'lucide-react';
import Link from 'next/link';

interface UserNavProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

export function UserNav({ user }: UserNavProps) {
  const { open } = useSidebar();
  const navigationLinks = getNavigationLinks(user.role);
  const roleDisplayName = getRoleDisplayName(user.role);
  const avatarInitial = getRoleAvatarInitial(user.role);
  const availableFeatures = getAvailableFeatures(user.role);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`relative rounded-full ${!open ? 'w-8' : 'w-full justify-start'}`}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={`/placeholder.svg?height=64&width=64&text=${avatarInitial}`}
              alt={roleDisplayName}
            />
            <AvatarFallback>{avatarInitial}</AvatarFallback>
          </Avatar>
          {open && (
            <div className="ml-2 flex flex-col items-start text-left">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">{roleDisplayName}</span>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            <p className="text-xs leading-none text-muted-foreground">{roleDisplayName}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href={navigationLinks.profile}>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>プロフィール</span>
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
          {availableFeatures.quickRegister && (
            <DropdownMenuItem>
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>クイック登録</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <Link href={navigationLinks.login}>
          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" />
            <span>ログアウト</span>
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
