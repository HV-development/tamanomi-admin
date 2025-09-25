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
  // サイドバーで使用するアイコン名を追加
  storefront: { type: 'material', value: 'storefront' },
  confirmation_number: { type: 'material', value: 'confirmation_number' },
  groups: { type: 'material', value: 'groups' },
  person: { type: 'material', value: 'person' },
  history_2: { type: 'material', value: 'history_2' },
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
  'check-circle': { type: 'material', value: 'check_circle' },
  'alert-circle': { type: 'material', value: 'error' },
  'alert-triangle': { type: 'material', value: 'warning' },
  info: { type: 'material', value: 'info' },
  x: { type: 'material', value: 'close' },
  check: { type: 'material', value: 'check' },
  remove: { type: 'material', value: 'remove' },
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
      <span 
        className={`material-symbols-outlined inline-block align-text-bottom ${sizeClasses[size]} ${className}`}
        style={{ 
          fontFamily: 'Material Symbols Outlined',
          fontVariationSettings: '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24',
          fontSize: '24px',
          lineHeight: '1'
        }}
      >
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
