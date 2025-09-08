export default function CareManagerEditPage() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">ケアマネージャー編集</h1>
          <p className="text-muted-foreground">ケアマネージャー情報を編集します。</p>
        </div>
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <p>ここにケアマネージャー編集フォームが表示されます。</p>
        </div>
      </div>
    </div>
  );
}
