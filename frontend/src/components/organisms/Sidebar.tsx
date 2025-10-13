'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import SidebarHeader from '@/components/molecules/sidebar-header';
import MenuItem from '@/components/molecules/menu-item';
import Icon from '@/components/atoms/Icon';

interface MenuItemData {
  name: string;
  href: string;
  iconName: string;
}

const menuItems: MenuItemData[] = [
  { name: '掲載店管理', href: '/merchants', iconName: 'storefront' },
  { name: '店舗管理', href: '/shops', iconName: 'store' },
  { name: 'クーポン管理', href: '/coupons', iconName: 'confirmation_number' },
  { name: 'ユーザー管理', href: '/users', iconName: 'groups' },
  { name: '管理者アカウント', href: '/admins', iconName: 'person' },
  { name: 'クーポン利用履歴', href: '/coupon-history', iconName: 'history_2' },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // ローカルストレージからサイドバーの状態を復元
  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('sidebar-collapsed');
      if (savedState !== null) {
        setIsCollapsed(JSON.parse(savedState));
      }
      setIsLoaded(true);
    }
  }, []);

  // サイドバーの状態をローカルストレージに保存
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
    }
  }, [isCollapsed, isLoaded]);

  const handleMenuClick = (href: string) => {
    // メニューが閉じている状態では閉じたままページ遷移
    console.log('Menu clicked:', href, 'isCollapsed:', isCollapsed);
    router.push(href);
  };

  const handleToggleCollapse = () => {
    console.log('Toggle collapse clicked, current state:', isCollapsed);
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 relative flex-shrink-0 ${
      isCollapsed ? 'w-16' : 'w-64'
    } ${!isLoaded ? 'opacity-0' : 'opacity-100'}`}>
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
                onClick={handleMenuClick}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* フッター */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200">
        {/* ログアウトボタン */}
        <div className="px-4 py-2">
          <button
            onClick={() => {
              if (confirm('ログアウトしますか？')) {
                window.location.href = '/';
              }
            }}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900`}
          >
            <Icon name="logout" size="md" />
            {!isCollapsed && <span>ログアウト</span>}
          </button>
        </div>
        
        <div className="p-4 flex justify-end">
          <button
            onClick={handleToggleCollapse}
            className="p-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <Icon name={isCollapsed ? "chevronRight" : "chevronLeft"} size="sm" />
          </button>
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
