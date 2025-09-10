import { redirect } from 'next/navigation';

export default function Home() {
  // ルートアクセス時はログイン画面にリダイレクト
  redirect('/login');
}
