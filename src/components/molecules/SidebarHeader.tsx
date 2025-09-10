import Logo from '../atoms/Logo';

interface SidebarHeaderProps {}

export default function SidebarHeader({}: SidebarHeaderProps) {
  return (
    <div className="flex items-center p-4 border-b border-gray-200">
      <Logo size="md" />
    </div>
  );
}
