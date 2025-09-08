import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BuildingIcon, SettingsIcon, UserIcon } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">CareBase</h1>
          <p className="text-xl text-muted-foreground">介護現場の記録・情報共有システム</p>
          <p className="text-muted-foreground">ご利用の役割を選択してログインしてください</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* 運営者 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <SettingsIcon className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">運営者</CardTitle>
              <CardDescription>
                複数施設の統括管理や事業所・ケアマネージャーの管理を行います
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" size="lg">
                <Link href="/operation/login">ログイン</Link>
              </Button>
            </CardContent>
          </Card>

          {/* 施設管理者 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <BuildingIcon className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">施設管理者</CardTitle>
              <CardDescription>施設の日常業務管理や利用者情報の管理を行います</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" size="lg">
                <Link href="/facility/login">ログイン</Link>
              </Button>
            </CardContent>
          </Card>

          {/* ケアマネージャー */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <UserIcon className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">ケアマネージャー</CardTitle>
              <CardDescription>複数施設にまたがるケアプランの管理を行います</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" size="lg">
                <Link href="/care/login-manager">ログイン</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>© 2025 CareBase. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
