import Logo from '@/components/atoms/Logo';
import Icon from '@/components/atoms/Icon';

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
  onLogoLoad?: () => void;
  onLogoError?: () => void;
  isReady?: boolean;
}

const PlaceholderIcon = ({ isCollapsed }: { isCollapsed: boolean }) => (
  <span
    aria-hidden
    className={`${isCollapsed ? 'h-5 w-5' : 'h-4 w-4'} inline-block bg-transparent`}
  />
);

export default function SidebarHeader({ isCollapsed, onToggleCollapse, onLogoLoad, onLogoError, isReady = false }: SidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      {isCollapsed ? (
        onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="サイドメニューを開く"
          >
            {isReady ? <Icon name="chevronRight" size="sm" /> : <PlaceholderIcon isCollapsed />}
          </button>
        )
      ) : (
        <>
          <Logo size="sm" onLoad={onLogoLoad} onError={onLogoError} />
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="サイドメニューを閉じる"
            >
              {isReady ? <Icon name="chevronLeft" size="sm" /> : <PlaceholderIcon isCollapsed={false} />}
            </button>
          )}
        </>
      )}
    </div>
  );
}