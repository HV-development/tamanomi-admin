export default function ContactPage() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">お問い合わせ</h1>
          <p className="text-muted-foreground">ユーザーからのお問い合わせを管理します。</p>
        </div>
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <p>ここにお問い合わせ一覧が表示されます。</p>
        </div>
      </div>
    </div>
  );
}
