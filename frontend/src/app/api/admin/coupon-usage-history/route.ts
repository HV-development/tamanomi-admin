import { NextRequest, NextResponse } from 'next/server';
import { secureFetchWithAuth } from '@/lib/fetch-utils';
import { createNoCacheResponse } from '@/lib/response-utils';

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

// セキュリティ改善：個人情報をクエリパラメータで送信しないため、POSTメソッドに変更
export async function POST(request: NextRequest) {
  try {
    const auth = getAuthHeader(request);
    if (!auth) {
      return createNoCacheResponse({ message: 'Unauthorized' }, { status: 401 });
    }

    // セキュリティ改善：個人情報をクエリパラメータで送信しないため、POSTメソッドでボディに含めて送信
    const body = await request.json().catch(() => ({}));
    
    const fullUrl = `${API_BASE_URL}/admin/coupon-usage-history`;
    console.log('🔗 API Route: Posting to', fullUrl);

    const response = await secureFetchWithAuth(fullUrl, auth, {
      method: 'POST',
      body: JSON.stringify(body),
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
      return createNoCacheResponse(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ API Route: Get coupon usage history successful', { count: data.history?.length || 0 });
    return createNoCacheResponse(data);
  } catch (error: unknown) {
    console.error('❌ API Route: Get coupon usage history error', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createNoCacheResponse({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}
