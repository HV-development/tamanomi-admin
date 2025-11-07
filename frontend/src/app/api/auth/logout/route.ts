import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002/api/v1';

export async function POST(request: Request) {
  try {
    const headerToken = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie') || '';
    const pairs = cookieHeader.split(';').map(v => v.trim());
    const accessPair = pairs.find(v => v.startsWith('accessToken=')) || pairs.find(v => v.startsWith('__Host-accessToken='));
    const cookieToken = accessPair ? decodeURIComponent(accessPair.split('=')[1] || '') : '';
    const authHeader = headerToken || (cookieToken ? `Bearer ${cookieToken}` : null);
    console.log('🚪 API Route: Logout request received');
    
    const headers: HeadersInit = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: headers,
    });

    const ok = response.ok;
    const nextResponse = NextResponse.json(ok ? { message: 'Logout successful' } : { message: 'Logout locally cleared', upstream: response.status });
    const isSecure = (() => {
      try { return new URL(request.url).protocol === 'https:'; } catch { return process.env.NODE_ENV === 'production'; }
    })();
    nextResponse.headers.set('Cache-Control', 'no-store');
    nextResponse.headers.set('Pragma', 'no-cache');
    
    // accessToken クッキーを削除
    nextResponse.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    nextResponse.cookies.set('__Host-accessToken', '', {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    // refreshToken クッキーを削除
    nextResponse.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    nextResponse.cookies.set('__Host-refreshToken', '', {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    console.log('🍪 API Route: Session cookies cleared');
    return nextResponse;
  } catch (error: unknown) {
    console.error('❌ API Route: Logout error', error);
    const res = NextResponse.json({ message: 'Local logout executed' }, { status: 200 });
    res.headers.set('Cache-Control', 'no-store');
    res.headers.set('Pragma', 'no-cache');
    const isSecure2 = (() => {
      try { return new URL(request.url).protocol === 'https:'; } catch { return process.env.NODE_ENV === 'production'; }
    })();
    res.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: isSecure2,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    res.cookies.set('__Host-accessToken', '', {
      httpOnly: true,
      secure: isSecure2,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    res.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: isSecure2,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    res.cookies.set('__Host-refreshToken', '', {
      httpOnly: true,
      secure: isSecure2,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    return res;
  }
}