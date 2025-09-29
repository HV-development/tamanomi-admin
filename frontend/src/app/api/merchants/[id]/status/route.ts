import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002/api/v1';

function getAuthHeaders(request: Request): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }
  return headers;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    console.log('🔄 API Route: 事業者ステータス更新リクエスト受信', { merchantId: id, status: body.status });

    const response = await fetch(`${API_BASE_URL}/admin/merchants/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(request),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: 事業者ステータス更新失敗', { status: response.status, error: errorData });
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ API Route: 事業者ステータス更新成功', { merchantId: id });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`❌ API Route: 事業者ステータス更新エラー ${params.id}`, error);
    return NextResponse.json({ message: '内部サーバーエラー', error: error.message }, { status: 500 });
  }
}
