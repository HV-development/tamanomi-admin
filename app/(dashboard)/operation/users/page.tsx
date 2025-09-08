export default function UsersPage() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">ユーザー管理</h1>
          <p className="text-muted-foreground">登録されているユーザーの一覧を表示・管理します。</p>
        </div>
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <p>ここにユーザー一覧テーブルが表示されます。</p>
        </div>
      </div>
    </div>
  );
}
