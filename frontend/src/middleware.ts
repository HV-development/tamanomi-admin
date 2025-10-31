import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 認証必須ページへのアクセスをサーバー側でガード
export function middleware(request: NextRequest) {
  const { pathname, host } = request.nextUrl;

  // CSRF: /api 以下の unsafe メソッドは Origin/Referer を検証
  if (
    pathname.startsWith('/api') &&
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)
  ) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const sameOrigin = (() => {
      try {
        if (origin) return new URL(origin).host === host;
        if (referer) return new URL(referer).host === host;
      } catch {
        // 解析失敗時は不正とみなす
        return false;
      }
      // Origin/Referer が無い場合はサーバ内呼び出し等の可能性もあるため許可
      return true;
    })();

    if (!sameOrigin) {
      return NextResponse.json({ message: 'Invalid origin' }, { status: 403 });
    }
  }

  // アプリの保護ページはCookieが無ければログインへ
  const protectedPaths = [
    '/merchants',
    '/shops',
    '/coupons',
    '/admins',
    '/applications',
  ];
  if (protectedPaths.some(p => pathname === p || pathname.startsWith(`${p}/`))) {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('session', 'expired');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// 対象ルート（保護対象）
export const config = {
  matcher: [
    '/api/:path*',
    '/merchants/:path*',
    '/shops/:path*',
    '/coupons/:path*',
    '/admins/:path*',
    '/applications',
  ],
};


