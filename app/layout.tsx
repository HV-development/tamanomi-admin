import { Toaster } from '@/components/ui/sonner';
import { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CareBase',
  description: 'CareBase',
  generator: 'CareBase',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
