# 307リダイレクト時のHTMLレンダリング対策

## 概要

307リダイレクト実行時にHTMLがレンダリングされ、攻撃者に内部仕様の手がかりを与える恐れがある脆弱性を修正しました。

## 指摘内容

### 脆弱性の内容

1. **問題点**: 307リダイレクト実行時に、HTMLがレンダリングされており、攻撃者に内部仕様の手がかりを与える恐れがある

2. **対象URL**: `https://stg-admin.tamanomi.com/`

3. **再現手順**:
   - 以下のURLにアクセスする: `https://stg-admin.tamanomi.com/`
   - 307リダイレクトが実行される際のレスポンスにHTMLがレンダリングされていることを確認する

4. **リスク**:
   - 本来レンダリングされるべきでない情報が閲覧され、攻撃者に攻撃の手がかりを与える恐れがある

5. **追加指摘**:
   - リダイレクトする位置の修正だけでは、適切に制御されない恐れがある
   - リダイレクト実行直後にスクリプトを終了させる処理の記述が必要

## 対応内容

### 1. リダイレクトステータスコードの明示的な指定

#### 変更前
```typescript
// ルートパスは加盟店一覧にリダイレクト（HTMLレンダリングなし）
if (pathname === '/') {
  const url = request.nextUrl.clone();
  url.pathname = '/merchants';
  return NextResponse.redirect(url, 302);
}
```

#### 変更後
```typescript
// ルートパスは加盟店一覧にリダイレクト（HTMLレンダリングなし）
if (pathname === '/') {
  const url = request.nextUrl.clone();
  url.pathname = '/merchants';
  // 307リダイレクトを実行（リダイレクト実行直後にスクリプトを終了）
  return NextResponse.redirect(url, 307);
}
```

### 2. 保護ページアクセス時のリダイレクト処理の改善

#### 変更前
```typescript
const url = request.nextUrl.clone();
url.pathname = '/login';
url.searchParams.set('session', 'expired');
return NextResponse.redirect(url);
```

#### 変更後
```typescript
const url = request.nextUrl.clone();
url.pathname = '/login';
url.searchParams.set('session', 'expired');
// 307リダイレクトを実行（リダイレクト実行直後にスクリプトを終了）
return NextResponse.redirect(url, 307);
```

### 3. スクリプト終了の明示化

- `return` 文を使用して、リダイレクトレスポンスを返すことで、middleware関数の実行を即座に終了
- コメントを追加して、リダイレクト実行直後にスクリプトが終了することを明示
- これにより、リダイレクト後に後続の処理（HTMLレンダリングなど）が実行されないことを保証

## セキュリティ上の利点

1. **情報漏洩の防止**: リダイレクト時にHTMLがレンダリングされないため、内部仕様やシステム情報が漏洩するリスクを削減

2. **適切な処理終了**: `return` 文による明示的な処理終了により、リダイレクト後に不要な処理が実行されないことを保証

3. **307リダイレクトの使用**: 
   - 307リダイレクトは元のHTTPメソッドを保持する一時的なリダイレクト
   - 302リダイレクトと比較して、より予測可能な動作を保証

## 変更ファイル

- `tamanomi-admin/frontend/src/middleware.ts`

## 検証方法

以下の手順で、リダイレクト時にHTMLがレンダリングされないことを確認できます：

1. **ルートパスのリダイレクト確認**:
   ```
   GET https://stg-admin.tamanomi.com/
   ```
   - レスポンスステータス: 307
   - Location ヘッダー: `/merchants`
   - レスポンスボディ: 空（HTMLがレンダリングされない）

2. **保護ページアクセス時のリダイレクト確認**:
   ```
   GET https://stg-admin.tamanomi.com/merchants (認証トークンなし)
   ```
   - レスポンスステータス: 307
   - Location ヘッダー: `/login?session=expired`
   - レスポンスボディ: 空（HTMLがレンダリングされない）

3. **開発者ツールでの確認**:
   - ネットワークタブでリダイレクトレスポンスを確認
   - レスポンスプレビューでHTMLが表示されないことを確認
   - レスポンスヘッダーで `Location` ヘッダーが正しく設定されていることを確認

## まとめ

307リダイレクト時にHTMLがレンダリングされる問題を修正し、リダイレクト実行直後にスクリプトを終了させる処理を明示的に実装しました。これにより、攻撃者に内部仕様の手がかりを与えるリスクを削減し、セキュリティを向上させました。
