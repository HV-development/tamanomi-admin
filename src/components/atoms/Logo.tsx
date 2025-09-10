interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <img 
        src="/tamanomi_logo.svg" 
        alt="たまのみロゴ" 
        className={`${sizeClasses[size]} object-contain`}
      />
      {showText && (
        <span className={`font-bold text-gray-800 ${textSizeClasses[size]}`}>
          たまのみ
        </span>
      )}
    </div>
  );
}
