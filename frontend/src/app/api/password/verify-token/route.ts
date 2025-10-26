import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002/api/v1';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'トークンが正しくありません' } },
        { status: 400 }
      );
    }

    console.log('🔐 API Route: Password token verification request received', { token: token.substring(0, 8) + '...' });

    const response = await fetch(`${API_BASE_URL}/password/verify-token?token=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 API Route: Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
      console.error('❌ API Route: Password token verification failed', { 
        status: response.status, 
        statusText: response.statusText,
        error: errorData 
      });
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ API Route: Password token verification successful', { 
      dataType: typeof data,
      dataKeys: Object.keys(data),
      hasData: 'data' in data,
      email: data.data?.email || 'unknown'
    });
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('❌ API Route: Password token verification error', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      API_BASE_URL
    });
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: {
        code: 'INTERNAL_ERROR',
        message: 'トークンの検証に失敗しました', 
        details: errorMessage
      }
    }, { status: 500 });
  }
}
