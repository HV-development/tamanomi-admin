export default function CompaniesPage() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">会社一覧</h1>
          <p className="text-muted-foreground">登録されている会社の一覧を表示します。</p>
        </div>
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <p>ここに会社一覧テーブルが表示されます。</p>
        </div>
      </div>
    </div>
  );
}
