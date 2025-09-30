import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

function getAuthHeaders(request: Request): HeadersInit {
  const authToken = request.headers.get('authorization');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (authToken) {
    headers['Authorization'] = authToken;
  }

  return headers;
}

export async function GET(request: Request) {
  try {
    console.log('🌐 API Route: Get shops request received');
    
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '10';
    const status = url.searchParams.get('status');
    const merchantId = url.searchParams.get('merchantId');
    
    // クエリパラメータを構築
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    if (status) queryParams.append('status', status);
    if (merchantId) queryParams.append('merchantId', merchantId);
    
    const response = await fetch(`${API_BASE_URL}/v1/shops?${queryParams.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: Get shops failed', { status: response.status, error: errorData });
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ API Route: Get shops successful', { count: data.shops?.length || 0 });
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('❌ API Route: Get shops error', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('➕ API Route: Create shop request received', { name: body.name });
    
    const response = await fetch(`${API_BASE_URL}/v1/shops`, {
      method: 'POST',
      headers: getAuthHeaders(request),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: Create shop failed', { status: response.status, error: errorData });
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ API Route: Create shop successful', { shopId: data.id });
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('❌ API Route: Create shop error', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}
