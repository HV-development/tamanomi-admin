'use client';

import React from 'react';
import { SidebarProvider, useSidebar } from '../providers/SidebarProvider';
import Sidebar from '../organisms/Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className={`flex-1 overflow-auto transition-all duration-300 ${
        isCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}
