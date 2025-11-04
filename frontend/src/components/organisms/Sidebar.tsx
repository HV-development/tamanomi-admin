'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import SidebarHeader from '@/components/molecules/sidebar-header';
import MenuItem from '@/components/molecules/menu-item';
import Icon from '@/components/atoms/Icon';
import { useAuth } from '@/components/contexts/auth-context';

interface MenuItemData {
  name: string;
  href: string;
  iconName: string;
}

const menuItems: MenuItemData[] = [
  { name: '事業者管理', href: '/merchants', iconName: 'domain' },
  { name: '店舗管理', href: '/shops', iconName: 'store' },
  { name: 'クーポン管理', href: '/coupons', iconName: 'confirmation_number' },
  { name: 'ユーザー管理', href: '/users', iconName: 'groups' },
  { name: '管理者アカウント', href: '/admins', iconName: 'person' },
  { name: 'クーポン利用履歴', href: '/coupon-history', iconName: 'history_2' },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const auth = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFontReady, setIsFontReady] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // アカウントタイプに基づいてメニューをフィルタリング
  // 認証情報がロード中の場合は空配列を返してちらつきを防ぐ
  const filteredMenuItems = auth?.isLoading 
    ? [] 
    : menuItems.filter((item) => {
        // 店舗アカウントの場合、店舗管理、クーポン管理、クーポン利用履歴のみ表示
        if (auth?.user?.accountType === 'shop') {
          return item.href === '/shops' || item.href === '/coupons' || item.href === '/coupon-history';
        }
        // 事業者アカウントの場合、ユーザー管理と管理者アカウントを非表示
        if (auth?.user?.accountType === 'merchant') {
          return item.href !== '/users' && item.href !== '/admins';
        }
        return true;
      });

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

  // Material Symbols フォントの読み込み完了まで待機してから描画
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const doc = document as Document & { fonts?: FontFaceSet & { check?: (font: string) => boolean } };
    if (doc.fonts && doc.fonts.check) {
      const loaded = doc.fonts.check('24px "Material Symbols Outlined"');
      if (loaded) {
        setIsFontReady(true);
      } else {
        doc.fonts.ready.then(() => setIsFontReady(true));
      }
    } else {
      // フォントAPIが使えない環境では短い遅延の後に表示
      const timer = setTimeout(() => setIsFontReady(true), 150);
      return () => clearTimeout(timer);
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

  if (!isLoaded || auth?.isLoading || !isFontReady) {
    // 完全に準備できるまでサイドバーを表示しない
    return <div className={`bg-white shadow-lg transition-all duration-300 relative flex-shrink-0 ${isCollapsed ? 'w-16' : 'w-64'}`} />;
  }

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 relative flex-shrink-0 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <SidebarHeader isCollapsed={isCollapsed} onToggleCollapse={handleToggleCollapse} />

      {/* メニュー */}
      <nav className={`p-4 ${isCollapsed ? 'pt-6' : ''}`}>
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => (
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
            onClick={async () => {
              if (!auth) return;
              
              if (confirm('ログアウトしますか？')) {
                await auth.logout();
                router.push('/login');
              }
            }}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900`}
          >
            <Icon name="logout" size="md" />
            {!isCollapsed && <span>ログアウト</span>}
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
