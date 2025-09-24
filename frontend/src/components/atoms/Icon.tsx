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
  chevronUp: { type: 'material', value: 'expand_less' },
  chevronDown: { type: 'material', value: 'expand_more' },
  home: { type: 'emoji', value: '🏠' },
  settings: { type: 'emoji', value: '⚙️' },
  logout: { type: 'material', value: 'logout' },
  plus: { type: 'emoji', value: '➕' },
  search: { type: 'emoji', value: '🔍' },
  edit: { type: 'emoji', value: '✏️' },
  eye: { type: 'emoji', value: '👁️' },
  clear: { type: 'emoji', value: '🗑️' },
};

export default function Icon({ name, size = 'md', className = '' }: IconProps) {
  const sizeClasses = {
    sm: 'text-sm leading-none',
    md: 'text-lg leading-none',
    lg: 'text-xl leading-none',
  };

  const icon = iconMap[name];
  
  if (!icon) {
    return (
      <span className={`inline-block ${sizeClasses[size]} ${className}`}>
        ?
      </span>
    );
  }

  if (icon.type === 'material') {
    return (
      <span className={`material-symbols-outlined inline-block align-text-bottom ${sizeClasses[size]} ${className}`}>
        {icon.value}
      </span>
    );
  }

  return (
    <span className={`inline-block ${sizeClasses[size]} ${className}`}>
      {icon.value}
    </span>
  );
}
