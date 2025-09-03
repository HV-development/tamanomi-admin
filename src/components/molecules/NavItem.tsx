import React from 'react';
import { Icon } from '../atoms/Icon';

interface NavItemProps {
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  isCollapsed?: boolean;
  icon?: string;
}

export function NavItem({ children, isActive = false, onClick, isCollapsed = false, icon }: NavItemProps) {
  return (
    <button 
      className={`w-full flex items-center gap-3 px-3 py-2 rounded text-base font-semibold transition-colors duration-200 cursor-pointer font-sans ${
        isActive 
          ? 'bg-white text-[#9cc912]' 
          : 'text-white hover:bg-white hover:text-[#9cc912]'
      }`}
      onClick={onClick}
      title={isCollapsed ? children as string : undefined}
    >
      {icon && (
        <Icon name={icon} className="w-4 h-4 flex-shrink-0" />
      )}
      {!isCollapsed && (
        <span className="flex-1 text-left">{children}</span>
      )}
    </button>
  );
}
