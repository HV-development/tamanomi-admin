interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
  };

  return (
    <div className={`flex items-center w-full ${className}`}>
      <img 
        src="/tamanomi_logo.svg" 
        alt="たまのみロゴ" 
        className={`w-full ${sizeClasses[size]} object-contain`}
      />
    </div>
  );
}
