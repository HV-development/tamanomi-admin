import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002/api/v1';

export async function POST(request: Request) {
  try {
    console.log('🔄 API Route: Refresh token request received');
    const cookieHeader = request.headers.get('cookie') || '';
    const refreshPair = cookieHeader.split(';').map(v => v.trim()).find(v => v.startsWith('refreshToken='));
    const refreshToken = refreshPair ? decodeURIComponent(refreshPair.split('=')[1] || '') : '';
    if (!refreshToken) {
      console.warn('🔄 No refresh token cookie');
      return NextResponse.json({ message: 'No refresh token' }, { status: 401 });
    }
    
    const response = await fetch(`${API_BASE_URL}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: Refresh token failed', { status: response.status, error: errorData });
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ API Route: Refresh token successful');

    const res = NextResponse.json({ ok: true });
    if (data.accessToken) {
      res.cookies.set('accessToken', data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 15,
      });
    }
    if (data.refreshToken) {
      res.cookies.set('refreshToken', data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    return res;
  } catch (error: unknown) {
    console.error('❌ API Route: Refresh token error', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}