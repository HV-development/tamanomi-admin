import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-lg',
    lg: 'w-12 h-12 text-2xl',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizeClasses[size]} bg-[#9cc912] rounded-lg flex items-center justify-center`}>
        <span className="text-white font-bold">た</span>
      </div>
      {showText && (
        <span className={`font-bold text-gray-800 ${textSizeClasses[size]}`}>
          たまのみ管理画面
        </span>
      )}
    </div>
  );
}

export default Logo;
