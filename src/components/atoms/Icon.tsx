interface IconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const iconMap: Record<string, { type: 'emoji' | 'material'; value: string }> = {
  store: { type: 'material', value: 'storefront' },
  coupon: { type: 'material', value: 'confirmation_number' },
  users: { type: 'material', value: 'groups' },
  admin: { type: 'material', value: 'person' },
  history: { type: 'material', value: 'history_2' },
  chevronLeft: { type: 'material', value: 'chevron_left' },
  chevronRight: { type: 'material', value: 'chevron_right' },
  home: { type: 'emoji', value: '🏠' },
  settings: { type: 'emoji', value: '⚙️' },
  logout: { type: 'emoji', value: '🚪' },
  plus: { type: 'emoji', value: '➕' },
  search: { type: 'emoji', value: '🔍' },
  edit: { type: 'emoji', value: '✏️' },
  eye: { type: 'emoji', value: '👁️' },
  clear: { type: 'emoji', value: '🗑️' },
};

export default function Icon({ name, size = 'md', className = '' }: IconProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 text-sm',
    md: 'w-6 h-6 text-lg',
    lg: 'w-8 h-8 text-xl',
  };

  const icon = iconMap[name];
  
  if (!icon) {
    return (
      <span className={`inline-flex items-center justify-center ${sizeClasses[size]} ${className}`}>
        ?
      </span>
    );
  }

  if (icon.type === 'material') {
    return (
      <span className={`material-symbols-outlined inline-flex items-center justify-center ${sizeClasses[size]} ${className}`}>
        {icon.value}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {icon.value}
    </span>
  );
}
