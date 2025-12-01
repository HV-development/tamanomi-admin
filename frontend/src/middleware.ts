import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
      const response = NextResponse.next();
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      return response;
    }

    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const secFetchSite = request.headers.get('sec-fetch-site');

    // ブラウザが same-origin / same-site と自己申告している場合は許可
    if (secFetchSite === 'same-origin' || secFetchSite === 'same-site' || secFetchSite === 'none') {
      const response = NextResponse.next();
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      return response;
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
    '/users',
    '/coupon-history',
  ];
  
  if (protectedPaths.some(p => pathname === p || pathname.startsWith(`${p}/`))) {
    const token = request.cookies.get('accessToken')?.value || request.cookies.get('__Host-accessToken')?.value;
    const isCouponsPath = pathname === '/coupons' || pathname.startsWith('/coupons/');
    if (isCouponsPath) {
      console.info('[middleware] coupons access check', {
        hasToken: Boolean(token),
        method: request.method,
        url: request.nextUrl.toString(),
        host,
        hostname: request.nextUrl.hostname,
        purpose: request.headers.get('purpose'),
        secFetchMode: request.headers.get('sec-fetch-mode'),
        secFetchDest: request.headers.get('sec-fetch-dest'),
      });
    }
    if (!token) {
      if (isCouponsPath) {
        console.warn('[middleware] coupons redirect due to missing token', {
          method: request.method,
          url: request.nextUrl.toString(),
          host,
          hostname: request.nextUrl.hostname,
          purpose: request.headers.get('purpose'),
          secFetchMode: request.headers.get('sec-fetch-mode'),
          secFetchDest: request.headers.get('sec-fetch-dest'),
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

  // セキュリティヘッダーを設定
  const response = NextResponse.next();
  
  // HSTS: HTTPSの接続を強制（1年間）
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // キャッシュ制御: APIルートはキャッシュを無効化して機密情報の漏洩を防止
  if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }
  
  return response;
}

// 静的ファイル以外のすべてのルートに適用
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
