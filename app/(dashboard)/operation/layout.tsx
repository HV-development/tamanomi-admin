'use client';

import { Logo } from '@/components/1_atoms/common/logo';
import { BreadcrumbNav } from '@/components/2_molecules/navigation/breadcrumb-nav';
import { UserNav } from '@/components/2_molecules/navigation/user-nav';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Building, Building2, Home, UserCheck } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';

interface OperationLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    title: 'ダッシュボード',
    href: '/operation',
    icon: Home,
    description: 'システム全体の概要',
  },
  {
    title: '事業所管理',
    href: '/operation/offices',
    icon: Building2,
    description: '事業所の登録・管理',
  },
  {
    title: '会社管理',
    href: '/operation/companies',
    icon: Building,
    description: '法人の登録・管理',
  },
  {
    title: '運営者管理',
    href: '/operation/admins',
    icon: UserCheck,
    description: '運営者アカウントの管理',
  },
];

export default function OperationLayout({ children }: OperationLayoutProps) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/operation">
                  <Logo size="sm" showText={false} />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">CareBase 運営</span>
                    <span className="truncate text-xs">管理システム</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            {/* <SidebarGroupLabel>メニュー</SidebarGroupLabel> */}
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link href={item.href}>
                        <item.icon />
                        <div className="flex-1">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs text-muted-foreground/70 mt-0.5">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <UserNav
                user={{
                  id: '1',
                  name: '運営 太郎',
                  email: 'operation@carebase.com',
                  role: 'operation',
                }}
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        {/* トップヘッダー */}
        <header className="flex flex-col shrink-0 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 sticky top-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
          {/* ヘッダーの上部 */}
          <div className="flex justify-between h-16 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="h-4 w-px bg-sidebar-border" />

              {/* パンくずリスト */}
              <BreadcrumbNav />
            </div>

            {/* 右側のアクション */}
            <div className="flex items-center gap-2 px-4">
              <UserNav
                user={{
                  id: '1',
                  name: '運営 太郎',
                  email: 'operation@carebase.com',
                  role: 'operation',
                }}
              />
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="flex-1 overflow-auto bg-background">
          <div className="container mx-auto p-4 lg:p-6">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
