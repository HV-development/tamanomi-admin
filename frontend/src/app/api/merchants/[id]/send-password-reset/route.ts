import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('📧 API Route: パスワード再設定メール送信リクエスト受信', { 
      merchantId: id,
    });

    // バックエンドAPIを呼び出し
    const response = await fetch(`${API_BASE_URL}/admin/merchants/${id}/send-password-reset`, {
      method: 'POST',
      headers: getAuthHeaders(request),
      body: JSON.stringify({}), // 空のJSONボディを送信（Fastifyの要件）
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
      console.error('❌ API Route: パスワード再設定メール送信失敗', {
        status: response.status,
        error: errorData,
      });
      
      return NextResponse.json(
        errorData,
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ API Route: パスワード再設定メール送信成功', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ API Route: パスワード再設定メール送信エラー', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'パスワード再設定メールの送信に失敗しました' } },
      { status: 500 }
    );
  }
}
