import React from 'react';
import Image from 'next/image';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  iconSrc?: string;
  iconAlt?: string;
  className?: string;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({ 
  children, 
  variant = 'secondary', 
  size = 'md',
  iconSrc,
  iconAlt,
  className = '', 
  onClick,
  disabled = false,
  type = 'button'
}: ButtonProps) {
  const baseClasses = "rounded-3xl font-medium transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2 opacity-100";
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm h-10",
    md: "px-4 py-3 text-base",
    lg: "px-6 py-4 text-lg"
  };
  
  const variantClasses = {
    primary: "bg-[#9CC912] text-white hover:bg-[#8bb810]",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300"
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button 
      type={type}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`} 
      onClick={onClick}
      disabled={disabled}
      suppressHydrationWarning={true}
    >
      {iconSrc && (
        <Image 
          src={iconSrc} 
          alt={iconAlt || ''} 
          width={16} 
          height={16} 
          className={`w-4 h-4 ${variant === 'primary' ? 'filter brightness-0 invert' : ''}`} 
        />
      )}
      {children}
    </button>
  );
}

export default Button;
