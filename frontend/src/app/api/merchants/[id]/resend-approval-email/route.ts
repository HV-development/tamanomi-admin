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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('➕ API Route: 承認メール再送リクエスト受信', { merchantId: id });
    
    // 会社情報を取得してメールアドレスを確認
    const merchantResponse = await fetch(`${API_BASE_URL}/admin/merchants/`, {
      method: 'GET',
      headers: getAuthHeaders(request),
    });

    if (!merchantResponse.ok) {
      const errorData = await merchantResponse.json();
      console.error('❌ API Route: 会社情報取得失敗', { status: merchantResponse.status, error: errorData });
      return NextResponse.json(errorData, { status: merchantResponse.status });
    }

    const merchantData = await merchantResponse.json();
    const email = merchantData.data?.email || merchantData.data?.accountEmail;

    if (!email) {
      console.error('❌ API Route: メールアドレスが見つかりません');
      return NextResponse.json(
        { error: { message: 'メールアドレスが見つかりません' } },
        { status: 400 }
      );
    }

    console.log('📧 API Route: パスワード設定メール再送', { email });

    // パスワード設定メール再送APIを呼び出し
    const response = await fetch(`${API_BASE_URL}/password/resend-setup-email`, {
      method: 'POST',
      headers: getAuthHeaders(request),
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: パスワード設定メール再送失敗', { status: response.status, error: errorData });
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ API Route: パスワード設定メール再送成功');
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('❌ API Route: パスワード設定メール再送エラー', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: { message: '内部サーバーエラー', details: errorMessage } },
      { status: 500 }
    );
  }
}

