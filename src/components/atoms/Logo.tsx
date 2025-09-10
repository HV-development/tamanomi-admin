interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/tamanomi_logo.svg" 
        alt="たまのみロゴ" 
        className={`${sizeClasses[size]} object-contain`}
      />
    </div>
  );
}
