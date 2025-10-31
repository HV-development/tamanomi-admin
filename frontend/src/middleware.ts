import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 認証必須ページへのアクセスをサーバー側でガード
export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  if (!accessToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    // セッション切れを示すクエリを付与（任意）
    url.searchParams.set('session', 'expired');
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

// 対象ルート（保護対象）
export const config = {
  matcher: [
    '/merchants/:path*',
    '/shops/:path*',
    '/coupons/:path*',
    '/admins/:path*',
    '/applications',
  ],
};


