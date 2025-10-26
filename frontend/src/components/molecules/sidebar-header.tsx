import Logo from '@/components/atoms/Logo';

interface SidebarHeaderProps {
  isCollapsed: boolean;
}

export default function SidebarHeader({ isCollapsed }: SidebarHeaderProps) {
  if (isCollapsed) {
    // 折りたたみ時はファビコンを表示
    return (
      <div className="flex items-center justify-center p-4 border-b border-gray-200">
        <img 
          src="/favicon.png" 
          alt="たまのみ" 
          className="h-8 w-8 object-contain"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center p-4 border-b border-gray-200">
      <Logo size="sm" />
    </div>
  );
}