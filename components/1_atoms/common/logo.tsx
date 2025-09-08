import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  /** ロゴのサイズ */
  size?: 'sm' | 'md' | 'lg';
  /** リンクとして使用するかどうか */
  href?: string;
  /** 追加のクラス名 */
  className?: string;
  /** テキストを表示するかどうか */
  showText?: boolean;
  /** テキストのサイズ */
  textSize?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export const Logo = ({
  size = 'md',
  href,
  className,
  showText = true,
  textSize = 'md',
}: LogoProps) => {
  const logoContent = (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        <Image src="/logo.png" alt="CareBase Logo" fill className="object-contain" priority />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={cn('font-bold text-lg text-primary', textSizeClasses[textSize])}>
            CareBase
          </span>
          <span className={cn('text-xs text-muted-foreground leading-none')}>Admin</span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
      >
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};
