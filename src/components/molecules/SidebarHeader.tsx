import React from 'react';
import { Icon } from '../atoms/Icon';

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function SidebarHeader({ isCollapsed, onToggleCollapse }: SidebarHeaderProps) {
  return (
    <div className="p-4 border-b border-white/20">
      <div className="flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex flex-col gap-1 flex-1">
            <h1 className="text-xl font-bold tracking-wide font-mono text-white">たまのみ管理画面</h1>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <h1 className="text-xl font-bold tracking-wide font-mono text-white">た</h1>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded hover:bg-white/10 transition-colors duration-200 flex-shrink-0"
        >
          <Icon 
            name={isCollapsed ? "chevron-right" : "chevron-left"} 
            className="w-4 h-4 text-white" 
          />
        </button>
      </div>
    </div>
  );
}

export default SidebarHeader;
