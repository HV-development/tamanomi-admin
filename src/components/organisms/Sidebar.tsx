'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import SidebarHeader from '../molecules/SidebarHeader';
import MenuItem from '../molecules/MenuItem';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

interface MenuItemData {
  name: string;
  href: string;
  iconName: string;
}

const menuItems: MenuItemData[] = [
  { name: '店舗管理', href: '/stores', iconName: 'store' },
  { name: 'クーポン管理', href: '/coupons', iconName: 'coupon' },
  { name: 'ユーザー管理', href: '/users', iconName: 'users' },
  { name: '管理者アカウント', href: '/admins', iconName: 'admin' },
  { name: 'クーポン利用履歴', href: '/coupon-history', iconName: 'history' },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 relative ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <SidebarHeader isCollapsed={isCollapsed} />

      {/* メニュー */}
      <nav className={`p-4 ${isCollapsed ? 'pt-6' : ''}`}>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <MenuItem
                name={item.name}
                href={item.href}
                iconName={item.iconName}
                isActive={pathname === item.href}
                isCollapsed={isCollapsed}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* フッター */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200">
        <div className="p-4">
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 focus:outline-none"
            >
              <Icon name={isCollapsed ? "chevronRight" : "chevronLeft"} size="sm" />
            </Button>
          </div>
        </div>
        
        {!isCollapsed && (
          <div className="px-4 pb-4">
            <div className="text-sm text-gray-500 text-center">
              © 2024 たまのみ
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
