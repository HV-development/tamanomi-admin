interface IconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const iconMap: Record<string, string> = {
  store: '🏬',
  coupon: '🎫',
  users: '👥',
  admin: '👨‍💼',
  history: '📋',
  chevronLeft: '←',
  chevronRight: '→',
  home: '🏠',
  settings: '⚙️',
  logout: '🚪',
  plus: '➕',
  search: '🔍',
  edit: '✏️',
  eye: '👁️',
  clear: '🗑️',
};

export default function Icon({ name, size = 'md', className = '' }: IconProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 text-sm',
    md: 'w-6 h-6 text-lg',
    lg: 'w-8 h-8 text-xl',
  };

  return (
    <span className={`inline-flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {iconMap[name] || '?'}
    </span>
  );
}
