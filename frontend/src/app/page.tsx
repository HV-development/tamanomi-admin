import { redirect } from 'next/navigation';

export default function Home() {
  // ルートページにアクセスしたら加盟店一覧にリダイレクト
  redirect('/merchants');
}
