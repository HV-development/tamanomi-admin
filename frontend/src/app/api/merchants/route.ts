import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002/api/v1';

function getAuthHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }
  return headers;
}

export async function GET(request: Request) {
  try {
    console.log('🌐 API Route: 事業者一覧取得リクエスト受信');
    console.log('🔗 API Route: API_BASE_URL:', API_BASE_URL);
    console.log('🔗 API Route: Full URL:', `${API_BASE_URL}/admin/merchants`);
    
    const authHeaders = getAuthHeaders(request);
    console.log('🔐 API Route: 認証ヘッダー', { 
      hasAuth: !!authHeaders.Authorization,
      authHeader: authHeaders.Authorization ? 'Bearer ***' : 'none'
    });
    
    const response = await fetch(`${API_BASE_URL}/admin/merchants`, {
      method: 'GET',
      headers: authHeaders,
    });

    console.log('📡 API Route: Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
      console.error('❌ API Route: 事業者一覧取得失敗', { 
        status: response.status, 
        statusText: response.statusText,
        error: errorData 
      });
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('🔍 API Route: APIサーバーからの生レスポンス', { 
      responseStatus: response.status,
      dataType: typeof data,
      dataKeys: Object.keys(data),
      merchantsCount: data.data?.merchants?.length || data.merchants?.length || 0,
      firstMerchant: data.data?.merchants?.[0] || data.merchants?.[0] || null
    });
    console.log('✅ API Route: 事業者一覧取得成功', { 
      count: data.merchants?.length || data.length,
      dataStructure: Object.keys(data),
      merchantsStructure: data.merchants ? Object.keys(data.merchants[0] || {}) : 'no merchants',
      fullResponse: JSON.stringify(data, null, 2)
    });
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('❌ API Route: 事業者一覧取得エラー', {
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('➕ API Route: 事業者作成リクエスト受信', { 
      name: body.name,
      fullBody: body,
      bodyKeys: Object.keys(body)
    });
    
    const response = await fetch(`${API_BASE_URL}/admin/merchants`, {
      method: 'POST',
      headers: getAuthHeaders(request),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: 事業者作成失敗', { status: response.status, error: errorData });
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ API Route: 事業者作成成功', { merchantId: data.id });
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('❌ API Route: 事業者作成エラー', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: '内部サーバーエラー', error: errorMessage }, { status: 500 });
  }
}
