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
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('➕ API Route: 承認メール再送リクエスト受信', { merchantId: id });
    
    const authHeaders = getAuthHeaders(request);
    const authHeader = authHeaders.Authorization;
    if (!authHeader) {
      return createNoCacheResponse({ message: 'Unauthorized' }, { status: 401 });
    }
    
    //事業者情報を取得してメールアドレスを確認
    const merchantResponse = await secureFetchWithAuth(
      `${API_BASE_URL}/admin/merchants/${id}`,
      authHeader,
      { method: 'GET' }
    );

    if (!merchantResponse.ok) {
      const errorData = await merchantResponse.json();
      console.error('❌ API Route: 事業者情報取得失敗', { status: merchantResponse.status, error: errorData });
      return createNoCacheResponse(errorData, { status: merchantResponse.status });
    }

    const merchantData = await merchantResponse.json();
    const email = merchantData.data?.email || merchantData.data?.accountEmail;

    if (!email) {
      console.error('❌ API Route: メールアドレスが見つかりません');
      return createNoCacheResponse(
        { error: { message: 'メールアドレスが見つかりません' } },
        { status: 400 }
      );
    }

    console.log('📧 API Route: パスワード設定メール再送', { email });

    // パスワード設定メール再送APIを呼び出し
    const response = await secureFetchWithAuth(
      `${API_BASE_URL}/password/resend-setup-email`,
      authHeader,
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: パスワード設定メール再送失敗', { status: response.status, error: errorData });
      return createNoCacheResponse(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ API Route: パスワード設定メール再送成功');
    return createNoCacheResponse(data);
  } catch (error: unknown) {
    console.error('❌ API Route: パスワード設定メール再送エラー', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createNoCacheResponse(
      { error: { message: '内部サーバーエラー', details: errorMessage } },
      { status: 500 }
    );
  }
}
