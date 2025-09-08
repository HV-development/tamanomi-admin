export default function OfficeDetailPage() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">事業所詳細</h1>
          <p className="text-muted-foreground">事業所の詳細情報を表示します。</p>
        </div>
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <p>ここに事業所詳細情報が表示されます。</p>
        </div>
      </div>
    </div>
  );
}
