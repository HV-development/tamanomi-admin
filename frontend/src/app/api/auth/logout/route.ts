import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002/api/v1';

export async function POST(request: Request) {
  try {
    const headerToken = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie') || '';
    const accessPair = cookieHeader.split(';').map(v => v.trim()).find(v => v.startsWith('accessToken='));
    const cookieToken = accessPair ? decodeURIComponent(accessPair.split('=')[1] || '') : '';
    const authHeader = headerToken || (cookieToken ? `Bearer ${cookieToken}` : null);
    console.log('🚪 API Route: Logout request received');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: Logout failed', { status: response.status, error: errorData });
      return NextResponse.json(errorData, { status: response.status });
    }

    console.log('✅ API Route: Logout successful');
    
    // セッションクッキーを削除
    const nextResponse = NextResponse.json({ message: 'Logout successful' });
    
    // accessToken クッキーを削除
    nextResponse.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    // refreshToken クッキーを削除
    nextResponse.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    console.log('🍪 API Route: Session cookies cleared');
    return nextResponse;
  } catch (error: unknown) {
    console.error('❌ API Route: Logout error', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}