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

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log('🏢 API Route: 会社詳細取得リクエスト受信', { merchantId: id });

    const response = await fetch(`${API_BASE_URL}/admin/merchants/`, {
      method: 'GET',
      headers: getAuthHeaders(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: 会社詳細取得失敗', { status: response.status, error: errorData });
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ API Route: 会社詳細取得成功', { merchantId: id });
    console.log('🔍 API Route: Response data structure:', {
      hasData: 'data' in data,
      dataKeys: data.data ? Object.keys(data.data) : 'no data property',
      fullData: data
    });
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error(`❌ API Route: 会社詳細取得エラー `, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: '内部サーバーエラー', error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log('✏️ API Route: 会社更新リクエスト受信', { merchantId: id, name: body.name });

    const response = await fetch(`${API_BASE_URL}/admin/merchants/`, {
      method: 'PUT',
      headers: getAuthHeaders(request),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: 会社更新失敗', { status: response.status, error: errorData });
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ API Route: 会社更新成功', { merchantId: id });
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error(`❌ API Route: 会社更新エラー `, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: '内部サーバーエラー', error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log('🗑️ API Route: 会社削除リクエスト受信', { merchantId: id });

    const response = await fetch(`${API_BASE_URL}/admin/merchants/`, {
      method: 'DELETE',
      headers: getAuthHeaders(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: 会社削除失敗', { status: response.status, error: errorData });
      return NextResponse.json(errorData, { status: response.status });
    }

    console.log('✅ API Route: 会社削除成功', { merchantId: id });
    return NextResponse.json({ message: '会社が削除されました' });
  } catch (error: unknown) {
    console.error(`❌ API Route: 会社削除エラー `, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: '内部サーバーエラー', error: errorMessage }, { status: 500 });
  }
}