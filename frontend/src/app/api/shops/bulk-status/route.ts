import { secureFetchWithAuth } from '@/lib/fetch-utils';
import { createNoCacheResponse } from '@/lib/response-utils';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002/api/v1';

function getAuthHeader(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader) return authHeader;
  
  const cookieHeader = request.headers.get('cookie') || '';
  const pairs = cookieHeader.split(';').map(v => v.trim());
  const accessPair = pairs.find(v => v.startsWith('accessToken=')) || pairs.find(v => v.startsWith('__Host-accessToken='));
  const access = accessPair ? decodeURIComponent(accessPair.split('=')[1] || '') : '';
  return access ? `Bearer ${access}` : null;
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    console.log('🔄 API Route: Bulk shop status update request received', { 
      shopIds: body.shopIds, 
      status: body.status 
    });
    
    const authHeader = getAuthHeader(request);
    if (!authHeader) {
      return createNoCacheResponse({ message: 'Unauthorized' }, { status: 401 });
    }

    const response = await secureFetchWithAuth(
      `${API_BASE_URL}/shops/bulk-status`,
      authHeader,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: Bulk shop status update failed', { 
        status: response.status, 
        error: errorData 
      });
      return createNoCacheResponse(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ API Route: Bulk shop status update successful', { 
      updatedCount: data.data?.updatedCount,
      failedCount: data.data?.failedCount
    });
    return createNoCacheResponse(data);
  } catch (error: unknown) {
    console.error('❌ API Route: Bulk shop status update error', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createNoCacheResponse({ 
      message: 'Internal Server Error', 
      error: errorMessage 
    }, { status: 500 });
  }
}
