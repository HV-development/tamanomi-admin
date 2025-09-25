import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3003/api/v1';

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

export async function GET(request: Request) {
  try {
    console.log('🌐 API Route: 事業者一覧取得リクエスト受信');
    
    const response = await fetch(`${API_BASE_URL}/merchants`, {
      method: 'GET',
      headers: getAuthHeaders(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: 事業者一覧取得失敗', { status: response.status, error: errorData });
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ API Route: 事業者一覧取得成功', { count: data.merchants?.length || data.length });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ API Route: 事業者一覧取得エラー', error);
    return NextResponse.json({ message: '内部サーバーエラー', error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('➕ API Route: 事業者作成リクエスト受信', { name: body.name });
    
    const response = await fetch(`${API_BASE_URL}/merchants`, {
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
  } catch (error: any) {
    console.error('❌ API Route: 事業者作成エラー', error);
    return NextResponse.json({ message: '内部サーバーエラー', error: error.message }, { status: 500 });
  }
}