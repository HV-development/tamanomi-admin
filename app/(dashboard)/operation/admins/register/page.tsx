export default function AdminRegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">運営者登録</h1>
          <p className="text-muted-foreground">新しい運営者を登録します。</p>
        </div>
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <p>ここに運営者登録フォームが表示されます。</p>
        </div>
      </div>
    </div>
  );
}
