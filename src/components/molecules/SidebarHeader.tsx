import Logo from '../atoms/Logo';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function SidebarHeader({ isCollapsed, onToggleCollapse }: SidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      {!isCollapsed && <Logo size="md" />}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleCollapse}
        className="p-2"
      >
        <Icon name={isCollapsed ? 'chevronRight' : 'chevronLeft'} size="sm" />
      </Button>
    </div>
  );
}
