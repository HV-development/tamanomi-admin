import Link from 'next/link';
import Icon from '../atoms/Icon';

interface MenuItemProps {
  name: string;
  href: string;
  iconName: string;
  isActive: boolean;
  isCollapsed: boolean;
}

export default function MenuItem({ name, href, iconName, isActive, isCollapsed }: MenuItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-green-100 text-green-700 border-l-4 border-green-500'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon name={iconName} size="md" className="text-green-600" />
      {!isCollapsed && <span>{name}</span>}
    </Link>
  );
}
