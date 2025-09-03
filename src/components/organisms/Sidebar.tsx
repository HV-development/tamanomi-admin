'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SidebarHeader } from '../molecules/SidebarHeader';
import { NavItem } from '../molecules/NavItem';
import { useSidebar } from '../providers/SidebarProvider';

interface SidebarProps {
  currentView?: string;
  onViewChange?: (view: string) => void;
}

export function Sidebar({ currentView = 'dashboard', onViewChange }: SidebarProps) {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const router = useRouter();

  const navItems = [
    {
      id: 'user-management',
      label: 'ユーザー管理',
      icon: 'users',
      href: '/users',
    },
    {
      id: 'store-management',
      label: '加盟店管理',
      icon: 'store',
      href: '/stores',
    },
    {
      id: 'coupon-management',
      label: 'クーポン管理',
      icon: 'coupon',
      href: '/coupons',
    },
    {
      id: 'usage-history',
      label: '利用履歴',
      icon: 'history',
      href: '/history',
    },
    {
      id: 'account-management',
      label: 'アカウント管理',
      icon: 'account',
      href: '/accounts',
    },
    {
      id: 'contact',
      label: 'お問い合わせ',
      icon: 'contact',
      href: '/contact',
    }
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    if (onViewChange) {
      onViewChange(item.id);
    }
    router.push(item.href);
  };

  return (
    <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-[#9cc912] to-[#8bb811] text-white shadow-lg transition-all duration-300 ease-in-out z-50 font-sans ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        <SidebarHeader
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />

        <nav className="flex-1 p-2 pt-6">
          <div className="space-y-3">
            {navItems.map((item) => (
              <NavItem
                key={item.id}
                isActive={currentView === item.id}
                onClick={() => handleNavClick(item)}
                isCollapsed={isCollapsed}
                icon={item.icon}
              >
                {item.label}
              </NavItem>
            ))}
          </div>
        </nav>

        <div className="p-2 border-t border-white/20">
          <NavItem
            isActive={false}
            onClick={() => {}}
            isCollapsed={isCollapsed}
            icon="logout"
          >
            ログアウト
          </NavItem>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
