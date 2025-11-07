# Cookie SameSite属性修正: 初回ログイン時のセッション切れ問題対応

## 問題概要

stg環境において、初回ログイン後にクーポン管理ページ（`/coupons`）に遷移しようとすると、セッション切れとなりログイン画面に戻される問題が発生していました。

## 根本原因

認証用Cookieの`sameSite`属性が`'strict'`に設定されていたため、ログイン後のクライアントサイドナビゲーション（`router.push()`）時にブラウザがCookieを送信しない場合がありました。

### 詳細説明

1. **ログイン成功**: `/api/auth/login`でCookieが設定される
2. **初期ページ読み込み**: `/api/me`や`/api/merchants`ではCookieが正しく送信される
3. **クーポン管理ページ遷移**: `/coupons`へのアクセス時に、ミドルウェアがCookieを読み取れない
4. **リダイレクト**: ログインページにリダイレクトされる

`sameSite: 'strict'`は、トップレベルナビゲーション（ユーザーが直接リンクをクリックした場合）でのみCookieを送信します。プログラム的なナビゲーションや、ログイン直後の遷移では、ブラウザがCookieを送信しない場合があります。

## なぜローカル環境では問題が発生しなかったのか

ローカル環境（HTTP/localhost）では問題が発生しなかった理由は、以下の環境による違いにあります：

### 1. `secure`属性の違い

```typescript
const isSecure = (() => {
  try { return new URL(request.url).protocol === 'https:'; } catch { return process.env.NODE_ENV === 'production'; }
})();
```

- **ローカル環境（HTTP）**: `secure: false` となる
- **stg環境（HTTPS）**: `secure: true` となる

### 2. `__Host-`プレフィックスCookieの動作

`__Host-`プレフィックスを持つCookieは、`secure: true`が必須要件です：

- **ローカル環境（HTTP）**: `__Host-accessToken` Cookieは設定されない、またはブラウザによって無視される可能性がある
- **stg環境（HTTPS）**: `__Host-accessToken` Cookieが正しく設定される

ミドルウェアでは以下のようにチェックしているため、ローカル環境では`accessToken` Cookieが使用されます：

```typescript
const token = request.cookies.get('accessToken')?.value || request.cookies.get('__Host-accessToken')?.value;
```

### 3. `sameSite: 'strict'`の環境による動作の違い

ブラウザの実装により、`sameSite: 'strict'`の動作が環境によって異なります：

| 環境 | `sameSite: 'strict'`の動作 |
|------|---------------------------|
| **ローカル環境（HTTP/localhost）** | 同一オリジン内のクライアントサイドナビゲーション（`router.push()`など）でもCookieが送信される場合がある。ブラウザがlocalhostを特別扱いし、`sameSite: 'strict'`の制限を緩和することがある |
| **stg環境（HTTPS）** | より厳格に適用され、トップレベルナビゲーション（ユーザーが直接リンクをクリック）でない限り、Cookieが送信されない |

### 4. ブラウザの実装による差異

Chromeなどの主要ブラウザでは：

- **HTTP環境（localhost）**: 開発環境を考慮し、`sameSite: 'strict'`の適用を緩和することがある
- **HTTPS環境（本番/stg）**: セキュリティを優先し、`sameSite: 'strict'`を厳格に適用する

### まとめ

| 項目 | ローカル環境（HTTP） | stg環境（HTTPS） |
|------|---------------------|-----------------|
| `secure`属性 | `false` | `true` |
| `__Host-`Cookie | 設定されない可能性 | 設定される |
| `sameSite: 'strict'`の厳格さ | 緩和される場合がある | 厳格に適用 |
| クライアントサイドナビゲーション | Cookieが送信されやすい | 送信されにくい |

このため、ローカル環境では問題が発生せず、HTTPS環境（stg）でのみ問題が発生していました。`sameSite: 'lax'`に変更することで、両環境で一貫した動作となり、この問題が解決されます。

## 解決策

認証用Cookieの`sameSite`属性を`'strict'`から`'lax'`に変更します。

### `sameSite: 'lax'`の利点

- 通常のページ遷移でCookieを送信する
- GETリクエストでのクロスサイトリクエストでもCookieを送信する（CSRF対策として適切）
- より柔軟な動作で、一般的なWebアプリケーションで推奨される設定

### セキュリティへの影響

- `sameSite: 'lax'`でも、POSTメソッドでのクロスサイトリクエストではCookieが送信されないため、CSRF攻撃に対して一定の保護が維持されます
- `httpOnly: true`と`secure: true`（HTTPS環境）により、JavaScriptからのアクセスと非HTTPS通信を防いでいます

## 修正対象ファイル

以下のファイルでCookieの`sameSite`属性を`'strict'`から`'lax'`に変更します：

1. `frontend/src/app/api/auth/login/route.ts` - ログイン時のCookie設定
2. `frontend/src/app/api/auth/refresh/route.ts` - トークンリフレッシュ時のCookie設定
3. `frontend/src/app/api/auth/logout/route.ts` - ログアウト時のCookie削除（一貫性のため）
4. `frontend/src/app/api/admin/users/route.ts` - ユーザー一覧取得時のCookie設定（リフレッシュ後）

## 修正内容

各ファイルで、以下のように変更します：

```typescript
// 変更前
sameSite: 'strict',

// 変更後
sameSite: 'lax',
```

### 変更箇所の詳細

#### 1. `/api/auth/login/route.ts`
- `accessToken` Cookie設定（2箇所: `accessToken`と`__Host-accessToken`）
- `refreshToken` Cookie設定（2箇所: `refreshToken`と`__Host-refreshToken`）

#### 2. `/api/auth/refresh/route.ts`
- `accessToken` Cookie設定（2箇所）
- `refreshToken` Cookie設定（2箇所）

#### 3. `/api/auth/logout/route.ts`
- Cookie削除時の設定（4箇所: 正常処理とエラー処理の両方）

#### 4. `/api/admin/users/route.ts`
- リフレッシュ後のCookie設定（4箇所）

## テスト項目

修正後、以下のテストを実施してください：

1. **初回ログイン後のページ遷移**
   - ログイン後、クーポン管理ページに遷移できることを確認
   - 他の保護ページ（事業者管理、店舗管理など）にも遷移できることを確認

2. **通常の操作**
   - ログイン後の通常の操作（ページ遷移、API呼び出し）が正常に動作することを確認
   - セッションが正しく維持されることを確認

3. **セキュリティ確認**
   - ログアウト後にCookieが正しく削除されることを確認
   - トークンリフレッシュが正常に動作することを確認

## 影響範囲

- 認証用Cookieの動作が変更される
- 初回ログイン後のページ遷移が正常に動作するようになる
- CSRF保護は維持される（`sameSite: 'lax'`でもPOSTリクエストではクロスサイトCookie送信が制限される）

## 関連ログ

問題発生時のログは `stg_tamanomi_admin_logs.json` に記録されています。

主なログの流れ：
- `03:05:40` - `/coupons`へのアクセス時に307リダイレクト
- `03:05:40` - `/api/me`が401を返す
- その直前にログインは成功しており、`/api/me`や`/api/merchants`は正常に動作

## 備考

- この修正は、Cookieの`sameSite`属性のみを変更するもので、他のセキュリティ設定（`httpOnly`、`secure`など）は変更しません
- 本番環境への適用前に、ステージング環境での十分なテストを実施してください

