import Link from 'next/link';
import Image from 'next/image';

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
    <Link href="/coupons" className={`flex items-center w-full ${className}`}>
      <Image 
        src="/tamanomi_logo.svg" 
        alt="たまのみロゴ" 
        width={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
        height={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
        className={`w-full ${sizeClasses[size]} object-contain cursor-pointer hover:opacity-80 transition-opacity`}
        priority
      />
    </Link>
  );
}
