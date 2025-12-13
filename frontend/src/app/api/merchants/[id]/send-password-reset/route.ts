import { NextRequest, NextResponse } from 'next/server';
import { secureFetchWithAuth } from '@/lib/fetch-utils';
import { createNoCacheResponse } from '@/lib/response-utils';

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

    const authHeaders = getAuthHeaders(request);
    const authHeader = authHeaders.Authorization;
    if (!authHeader) {
      return createNoCacheResponse({ message: 'Unauthorized' }, { status: 401 });
    }

    // バックエンドAPIを呼び出し
    const response = await secureFetchWithAuth(
      `${API_BASE_URL}/admin/merchants/${id}/send-password-reset`,
      authHeader,
      {
        method: 'POST',
        body: JSON.stringify({}), // 空のJSONボディを送信（Fastifyの要件）
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
      console.error('❌ API Route: パスワード再設定メール送信失敗', {
        status: response.status,
        error: errorData,
      });
      
      return createNoCacheResponse(
        errorData,
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ API Route: パスワード再設定メール送信成功', data);

    return createNoCacheResponse(data);
  } catch (error) {
    console.error('❌ API Route: パスワード再設定メール送信エラー', error);
    return createNoCacheResponse(
      { error: { code: 'INTERNAL_ERROR', message: 'パスワード再設定メールの送信に失敗しました' } },
      { status: 500 }
    );
  }
}
