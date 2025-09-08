'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import SidebarHeader from '../molecules/SidebarHeader';
import MenuItem from '../molecules/MenuItem';

interface MenuItemData {
  name: string;
  href: string;
  iconName: string;
}

const menuItems: MenuItemData[] = [
  { name: '加盟店舗一覧', href: '/stores', iconName: 'store' },
  { name: 'ユーザー一覧', href: '/users', iconName: 'users' },
  { name: '管理者一覧', href: '/admins', iconName: 'admin' },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className={`bg-white shadow-xl transition-all duration-300 relative border-r border-gray-100 ${
      isCollapsed ? 'w-20' : 'w-72'
    }`}>
      <SidebarHeader
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* メニュー */}
      <nav className="p-4">
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
      {!isCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100">
          <div className="text-sm text-gray-500 text-center font-medium">
            © 2024 たまのみ
          </div>
        </div>
      )}
    </div>
  );
}
