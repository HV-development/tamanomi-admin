import Logo from '@/components/atoms/Logo';
import Icon from '@/components/atoms/Icon';

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
}

export default function SidebarHeader({ isCollapsed, onToggleCollapse }: SidebarHeaderProps) {
  if (isCollapsed) {
    return (
      <div className="flex items-center p-4 border-b border-gray-200">
        <Logo size="sm" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <Logo size="sm" />
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <Icon name="chevronLeft" size="sm" />
        </button>
      )}
    </div>
  );
}