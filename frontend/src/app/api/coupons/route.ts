import { NextResponse } from 'next/server';
import { secureFetchWithAuth } from '@/lib/fetch-utils';
import { createNoCacheResponse } from '@/lib/response-utils';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002/api/v1';

function getAuthHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const headerToken = request.headers.get('authorization');
  const isProd = process.env.NODE_ENV === 'production';
  if (headerToken) {
    if (isProd) {
      console.info('[api/coupons] authorization header detected');
    }
    headers['Authorization'] = headerToken;
    return headers;
  }
  const cookieHeader = request.headers.get('cookie') || '';
  const pairs = cookieHeader.split(';').map(v => v.trim());
  const accessPair = pairs.find(v => v.startsWith('accessToken=')) || pairs.find(v => v.startsWith('__Host-accessToken='));
  const accessToken = accessPair ? decodeURIComponent(accessPair.split('=')[1] || '') : '';
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
    if (isProd) {
      console.info('[api/coupons] using cookie-based access token', {
        hasAccessCookie: pairs.some(v => v.startsWith('accessToken=')),
        hasHostAccessCookie: pairs.some(v => v.startsWith('__Host-accessToken=')),
      });
    }
  } else if (isProd) {
    console.warn('[api/coupons] no auth token resolved from header or cookie', {
      hasCookieHeader: cookieHeader.length > 0,
    });
  }
  return headers;
}

export async function GET(request: Request) {
  try {
    console.log('🎟️ API Route: Get coupons request received', {
      host: request.headers.get('host'),
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
    });
    
    const url = new URL(request.url);
    
    // 全てのクエリパラメータをそのまま転送
    const queryParams = new URLSearchParams();
    url.searchParams.forEach((value, key) => {
      queryParams.append(key, value);
    });
    
    // デフォルト値の設定
    if (!queryParams.has('page')) queryParams.append('page', '1');
    if (!queryParams.has('limit')) queryParams.append('limit', '10');
    
    const fullUrl = `${API_BASE_URL}/coupons?${queryParams.toString()}`;
    console.log('🔗 API Route: Fetching from', fullUrl);
    
    const authHeaders = getAuthHeaders(request);
    const authHeader = authHeaders.Authorization;
    if (!authHeader) {
      return createNoCacheResponse({ message: 'Unauthorized' }, { status: 401 });
    }

    const response = await secureFetchWithAuth(fullUrl, authHeader, { method: 'GET' });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: Get coupons failed', { status: response.status, error: errorData });
      return createNoCacheResponse(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ API Route: Get coupons successful', { count: data.coupons?.length || 0 });
    return createNoCacheResponse(data);
  } catch (error: unknown) {
    console.error('❌ API Route: Get coupons error', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createNoCacheResponse({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('➕ API Route: Create coupon request received', { title: body.title });
    
    const authHeaders = getAuthHeaders(request);
    const authHeader = authHeaders.Authorization;
    if (!authHeader) {
      return createNoCacheResponse({ message: 'Unauthorized' }, { status: 401 });
    }

    const response = await secureFetchWithAuth(
      `${API_BASE_URL}/coupons`,
      authHeader,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: Create coupon failed', { status: response.status, error: errorData });
      return createNoCacheResponse(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ API Route: Create coupon successful', { couponId: data.id });
    return createNoCacheResponse(data);
  } catch (error: unknown) {
    console.error('❌ API Route: Create coupon error', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createNoCacheResponse({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}
