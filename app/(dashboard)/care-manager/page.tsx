import { Logo } from '@/components/1_atoms/common/logo';

export default function CareManagerDashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mx-auto w-full max-w-xl space-y-6">
        {/* ロゴ */}
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-xl font-bold">ケアマネージャー ダッシュボード</h1>
          <p className="text-muted-foreground">
            ようこそ、ケアマネージャー様。こちらがメインダッシュボードです。
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <p>ここにケアマネージャー向けのコンテンツが表示されます。</p>
        </div>
      </div>
    </div>
  );
}
