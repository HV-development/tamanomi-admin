import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://api:3002/api/v1';

function getAuthHeader(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader) return authHeader;
  
  // Cookieからトークンを取得
  const cookieHeader = request.headers.get('cookie') || '';
  const pairs = cookieHeader.split(';').map(v => v.trim());
  const accessPair = pairs.find(v => v.startsWith('accessToken=')) || pairs.find(v => v.startsWith('__Host-accessToken='));
  const token = accessPair ? decodeURIComponent(accessPair.split('=')[1] || '') : '';
  return token ? `Bearer ${token}` : null;
}

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthHeader(request);
    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const queryParams = new URLSearchParams();
    
    // 全てのクエリパラメータをそのまま転送
    url.searchParams.forEach((value, key) => {
      queryParams.append(key, value);
    });

    const fullUrl = `${API_BASE_URL}/admin/coupon-usage-history?${queryParams.toString()}`;
    console.log('🔗 API Route: Fetching from', fullUrl);

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      let errorData: { message?: string; error?: { message?: string } } | null = null;
      const contentType = response.headers.get('content-type');
      try {
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          const text = await response.text().catch(() => '');
          errorData = { message: text || `HTTP ${response.status} ${response.statusText}` };
        }
      } catch (e) {
        errorData = { message: `Failed to parse error response: ${e instanceof Error ? e.message : String(e)}` };
      }
      console.error('❌ API Route: Get coupon usage history failed', { 
        status: response.status, 
        statusText: response.statusText,
        contentType,
        error: errorData,
        url: fullUrl,
      });
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ API Route: Get coupon usage history successful', { count: data.history?.length || 0 });
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('❌ API Route: Get coupon usage history error', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}

