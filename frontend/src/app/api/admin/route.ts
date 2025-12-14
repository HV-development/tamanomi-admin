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

export async function GET(request: Request) {
  try {
    console.log('🌐 API Route: Get admin accounts request received');

    const url = new URL(request.url);

    // 全てのクエリパラメータをそのまま転送
    const queryParams = new URLSearchParams();
    url.searchParams.forEach((value, key) => {
      queryParams.append(key, value);
    });

    const fullUrl = `${API_BASE_URL}/admin-accounts?${queryParams.toString()}`;
    console.log('🔗 API Route: Fetching from', fullUrl);
    console.log('🔑 API Route: API_BASE_URL', API_BASE_URL);

    const authHeaders = getAuthHeaders(request);
    const authHeader = authHeaders.Authorization;
    if (!authHeader) {
      return createNoCacheResponse({ message: 'Unauthorized' }, { status: 401 });
    }

    const response = await secureFetchWithAuth(fullUrl, authHeader, { method: 'GET' });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: Get admin accounts failed', { status: response.status, error: errorData });
      return createNoCacheResponse(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ API Route: Get admin accounts successful', { count: data.accounts?.length || 0 });
    return createNoCacheResponse(data);
  } catch (error: unknown) {
    console.error('❌ API Route: Get admin accounts error', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createNoCacheResponse({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('➕ API Route: admin account creation request received', { 
      firstName: body.firstName,
      lastName: body.lastName,
      fullBody: body,
      bodyKeys: Object.keys(body)
    });

    const authHeaders = getAuthHeaders(request);
    const authHeader = authHeaders.Authorization;
    if (!authHeader) {
      return createNoCacheResponse({ message: 'Unauthorized' }, { status: 401 });
    }

    const response = await secureFetchWithAuth(
      `${API_BASE_URL}/admin-accounts`,
      authHeader,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: admin account creation failed', { status: response.status, error: errorData });
      return createNoCacheResponse(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ API Route: admin account creation successful', { adminAccountId: data.id });
    return createNoCacheResponse(data);
  } catch (error: unknown) {
    console.error('❌ API Route: admin account creation error', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createNoCacheResponse({ message: '内部サーバーエラー', error: errorMessage }, { status: 500 });
  }
}
