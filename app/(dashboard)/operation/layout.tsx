import type React from 'react';
import Link from 'next/link';
import { Home, Building2, Users, Settings2, Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { UserNav } from '@/components/2_molecules/user-nav';
import { Search } from '@/components/2_molecules/search';
import { Suspense } from 'react';

interface OperationLayoutProps {
  children: React.ReactNode;
}

export default function OperationLayout({ children }: OperationLayoutProps) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/operation" className="flex items-center gap-2 font-semibold">
              <Home className="h-6 w-6" />
              <span className="">CareBase 運営</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link
                href="/operation"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Home className="h-4 w-4" />
                ダッシュボード
              </Link>
              <Link
                href="/operation/offices"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Building2 className="h-4 w-4" />
                事業所
              </Link>
              <Link
                href="/operation/care-managers"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Users className="h-4 w-4" />
                ケアマネージャー
              </Link>
              <Link
                href="/operation/settings"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Settings2 className="h-4 w-4" />
                設定
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Suspense fallback={null}>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                <nav className="grid gap-2 text-lg font-medium">
                  <Link href="/operation" className="flex items-center gap-2 text-lg font-semibold">
                    <Home className="h-6 w-6" />
                    <span className="sr-only">CareBase 運営</span>
                  </Link>
                  <Link
                    href="/operation"
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    <Home className="h-5 w-5" />
                    ダッシュボード
                  </Link>
                  <Link
                    href="/operation/offices"
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    <Building2 className="h-5 w-5" />
                    事業所
                  </Link>
                  <Link
                    href="/operation/care-managers"
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    <Users className="h-5 w-5" />
                    ケアマネージャー
                  </Link>
                  <Link
                    href="/operation/settings"
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    <Settings2 className="h-5 w-5" />
                    設定
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </Suspense>
          <div className="w-full flex-1">
            <Search />
          </div>
          <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
          <UserNav />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
