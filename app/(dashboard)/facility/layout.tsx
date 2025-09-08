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
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  BookOpen,
  FileStack,
  FileText,
  GraduationCap,
  Home,
  MessageSquare,
  Settings,
  UserCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import type React from 'react';

interface FacilityLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    title: 'ダッシュボード',
    href: '/facility',
    icon: Home,
    description: '施設の概要と統計',
  },
  {
    title: '利用者管理',
    href: '/facility/residents',
    icon: Users,
    description: '利用者情報の管理',
    children: [
      { title: '利用者一覧', href: '/facility/residents' },
      { title: '利用者登録', href: '/facility/residents/new' },
      { title: 'バイタル記録', href: '/facility/residents/vitals' },
      { title: '介助記録', href: '/facility/residents/care-records' },
      { title: '個別ポイント', href: '/facility/residents/individual-points' },
    ],
  },
  {
    title: '介護記録',
    href: '/facility/care-records',
    icon: FileText,
    description: '介護記録の管理',
    children: [
      { title: '記録一覧', href: '/facility/care-records' },
      { title: '記録登録', href: '/facility/care-records/new' },
    ],
  },
  {
    title: '職員管理',
    href: '/facility/staff',
    icon: UserCheck,
    description: '職員情報の管理',
    children: [
      { title: '職員一覧', href: '/facility/staff' },
      { title: '職員登録', href: '/facility/staff/new' },
      { title: 'グループ管理', href: '/facility/settings/groups' },
      { title: 'チーム管理', href: '/facility/settings/teams' },
    ],
  },
  {
    title: '連絡管理',
    href: '/facility/communications',
    icon: MessageSquare,
    description: '内部連絡の管理',
    children: [
      { title: '連絡一覧', href: '/facility/communications' },
      { title: '連絡登録', href: '/facility/communications/new' },
    ],
  },
  {
    title: '書類管理',
    href: '/facility/documents',
    icon: FileStack,
    description: '書類の管理',
    children: [
      { title: '書類一覧', href: '/facility/documents' },
      { title: '書類登録', href: '/facility/documents/new' },
    ],
  },
  {
    title: '研修管理',
    href: '/facility/trainings',
    icon: GraduationCap,
    description: '研修の管理',
    children: [
      { title: '研修一覧', href: '/facility/trainings' },
      { title: '研修登録', href: '/facility/trainings/new' },
    ],
  },
  {
    title: 'マニュアル',
    href: '/facility/manuals',
    icon: BookOpen,
    description: 'マニュアルの管理',
    children: [
      { title: 'マニュアル一覧', href: '/facility/manuals' },
      { title: 'マニュアル登録', href: '/facility/manuals/new' },
    ],
  },
  {
    title: '設定',
    href: '/facility/settings',
    icon: Settings,
    description: 'システム設定',
    children: [
      { title: 'グループ管理', href: '/facility/settings/groups' },
      { title: 'チーム管理', href: '/facility/settings/teams' },
      { title: 'カスタムカテゴリ', href: '/facility/settings/categories' },
      { title: 'テンプレート', href: '/facility/settings/templates' },
      { title: '閾値設定', href: '/facility/settings/thresholds' },
    ],
  },
];

export default function FacilityLayout({ children }: FacilityLayoutProps) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/facility">
                  <Logo size="sm" showText={false} />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">CareBase 事業所</span>
                    <span className="truncate text-xs">管理システム</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          {/* メイン機能グループ */}
          <SidebarGroup>
            <SidebarGroupLabel>メイン機能</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.slice(0, 4).map((item) => (
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

          {/* コミュニケーション・ドキュメント */}
          <SidebarGroup>
            <SidebarGroupLabel>コミュニケーション</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.slice(4, 8).map((item) => (
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

          {/* システム設定 */}
          <SidebarGroup>
            <SidebarGroupLabel>システム設定</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.slice(8).map((item) => (
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
                  name: '山田 太郎',
                  email: 'facility@carebase.com',
                  role: 'facility',
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
                  name: '山田 太郎',
                  email: 'facility@carebase.com',
                  role: 'facility',
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
