import Logo from '../atoms/Logo';

interface SidebarHeaderProps {
  isCollapsed: boolean;
}

export default function SidebarHeader({ isCollapsed }: SidebarHeaderProps) {
  if (isCollapsed) {
    return null;
  }

  return (
    <div className="flex items-center p-4 border-b border-gray-200">
      <Logo size="sm" />
    </div>
  );
}