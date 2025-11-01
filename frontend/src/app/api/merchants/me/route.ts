import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002/api/v1';

function getAuthHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const headerToken = request.headers.get('authorization');
  if (headerToken) {
    headers['Authorization'] = headerToken;
    return headers;
  }
  const cookieHeader = request.headers.get('cookie') || '';
  const pairs = cookieHeader.split(';').map(v => v.trim());
  const accessPair = pairs.find(v => v.startsWith('accessToken=')) || pairs.find(v => v.startsWith('__Host-accessToken='));
  const accessToken = accessPair ? decodeURIComponent(accessPair.split('=')[1] || '') : '';
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return headers;
}

export async function GET(request: Request) {
  try {
    console.log('🏢 API Route: 自分の事業者情報取得リクエスト受信');
    console.log('🔗 API Route: API_BASE_URL:', API_BASE_URL);
    console.log('🔗 API Route: Full URL:', `${API_BASE_URL}/admin/merchants/me`);
    
    const authHeaders = getAuthHeaders(request);
    console.log('🔐 API Route: 認証ヘッダー', { 
      hasAuth: !!authHeaders.Authorization,
      authHeader: authHeaders.Authorization ? 'Bearer ***' : 'none'
    });
    
    const response = await fetch(`${API_BASE_URL}/admin/merchants/me`, {
      method: 'GET',
      headers: authHeaders,
    });

    console.log('📡 API Route: Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
      console.error('❌ API Route: 自分の事業者情報取得失敗', { 
        status: response.status, 
        statusText: response.statusText,
        error: errorData 
      });
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ API Route: 自分の事業者情報取得成功', { 
      dataType: typeof data,
      dataKeys: Object.keys(data),
      merchantId: data.data?.id || data.id || 'unknown',
      merchantName: data.data?.name || data.name || 'unknown'
    });
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('❌ API Route: 自分の事業者情報取得エラー', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      API_BASE_URL
    });
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      message: '内部サーバーエラー', 
      error: errorMessage,
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
