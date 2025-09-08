import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserIcon } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Tamanomi</h1>
          <p className="text-xl text-muted-foreground">加盟店管理システム</p>
          <p className="text-muted-foreground">管理者としてログインしてください</p>
        </div>

        <div className="flex justify-center">
          <Card className="w-full max-w-md hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <UserIcon className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">管理者ログイン</CardTitle>
              <CardDescription>加盟店管理、ユーザー管理、システム管理を行います</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" size="lg">
                <Link href="/operation/login">管理者としてログイン</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>© 2024 Tamanomi. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
