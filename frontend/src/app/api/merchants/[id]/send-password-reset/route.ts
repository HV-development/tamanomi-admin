import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('📧 API Route: パスワード再設定メール送信リクエスト受信', { merchantId: id });
    
    const authHeaders = getAuthHeaders(request);
    console.log('🔐 API Route: 認証ヘッダー', { 
      hasAuth: !!authHeaders.Authorization,
      authHeader: authHeaders.Authorization ? 'Bearer ***' : 'none'
    });
    
    const response = await fetch(`${API_BASE_URL}/admin/merchants/${id}/send-password-reset`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({}),
    });

    console.log('📡 API Route: Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
      console.error('❌ API Route: パスワード再設定メール送信失敗', { 
        status: response.status, 
        statusText: response.statusText,
        error: errorData 
      });
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ API Route: パスワード再設定メール送信成功', { merchantId: id });
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('❌ API Route: パスワード再設定メール送信エラー', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      API_BASE_URL
    });
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: {
        code: 'INTERNAL_ERROR',
        message: 'パスワード再設定メールの送信に失敗しました', 
        details: errorMessage
      }
    }, { status: 500 });
  }
}
