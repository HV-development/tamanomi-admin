'use client';

import type React from 'react';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LoginFormProps {
  roleName: string;
  redirectPath: string;
}

export default function LoginForm({ roleName, redirectPath }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // ここで実際の認証処理を呼び出す (今回はモック)
    // 例: if (email === 'admin@example.com' && password === 'password')
    if (email && password) {
      console.log(`Login attempt for ${roleName} with email: ${email}`);
      // 認証成功後、指定されたパスにリダイレクト
      router.push(redirectPath);
    } else {
      setError('メールアドレスとパスワードを入力してください。');
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{roleName} ログイン</CardTitle>
        <CardDescription>
          メールアドレスとパスワードを入力してログインしてください。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              placeholder="mail@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full">
            ログイン
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
