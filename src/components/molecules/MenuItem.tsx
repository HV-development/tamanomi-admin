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
      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        isActive
          ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 shadow-sm border-l-4 border-green-500'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
      }`}
    >
      <Icon name={iconName} size="md" className={`${isActive ? 'text-green-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
      {!isCollapsed && <span className="font-medium">{name}</span>}
    </Link>
  );
}
