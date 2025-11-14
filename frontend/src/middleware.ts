import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 認証必須ページへのアクセスをサーバー側でガード
export async function middleware(request: NextRequest) {
  const { pathname, host } = request.nextUrl;

  // CSRF: /api 以下の unsafe メソッドは Origin/Referer を検証
  if (
    pathname.startsWith('/api') &&
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)
  ) {
    // 認証系の一部エンドポイントはCSRF対象外（ログイン/リフレッシュなど）
    const isProd = process.env.NODE_ENV === 'production';
    const csrfSkip = !isProd && (
      pathname === '/api/auth/login' ||
      pathname === '/api/auth/refresh'
    );
    if (csrfSkip) {
      return NextResponse.next();
    }

    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const secFetchSite = request.headers.get('sec-fetch-site');

    // ブラウザが same-origin / same-site と自己申告している場合は許可
    if (secFetchSite === 'same-origin' || secFetchSite === 'same-site' || secFetchSite === 'none') {
      return NextResponse.next();
    }
    const sameOrigin = (() => {
      try {
        const allowed = new Set<string>();
        allowed.add(host);
        // ローカル開発での localhost/127.0.0.1 換算を許可
        const [, port] = host.split(':');
        if (port) {
          allowed.add(`localhost:${port}`);
          allowed.add(`127.0.0.1:${port}`);
        }

        if (origin) {
          const originHost = new URL(origin).host;
          if (allowed.has(originHost)) return true;
        }
        if (referer) {
          const refererHost = new URL(referer).host;
          if (allowed.has(refererHost)) return true;
        }
        // Origin/Referer が両方無い場合は同一オリジン遷移等の可能性が高いので許可
        if (!origin && !referer) return true;
        return false;
      } catch {
        // 解析失敗時は不正とみなす
        return false;
      }
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
    const token = request.cookies.get('accessToken')?.value || request.cookies.get('__Host-accessToken')?.value;
    const isCouponsPath = pathname === '/coupons' || pathname.startsWith('/coupons/');
    if (isCouponsPath) {
      console.info('[middleware] coupons access check', {
        hasToken: Boolean(token),
        method: request.method,
        url: request.nextUrl.toString(),
      });
    }
    if (!token) {
      if (isCouponsPath) {
        console.warn('[middleware] coupons redirect due to missing token', {
          method: request.method,
          url: request.nextUrl.toString(),
          hasAccessCookie: Boolean(request.cookies.get('accessToken')),
          hasHostAccessCookie: Boolean(request.cookies.get('__Host-accessToken')),
        });
      }
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('session', 'expired');
      return NextResponse.redirect(url);
    }
    // 署名検証はAPI層で実施。ここではCookieの存在のみでガード。
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


