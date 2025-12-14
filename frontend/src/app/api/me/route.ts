import { secureFetchWithAuth } from '@/lib/fetch-utils';
import { createNoCacheResponse } from '@/lib/response-utils';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002/api/v1';

function getAuthHeader(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const pairs = cookieHeader.split(';').map(v => v.trim());
  const accessPair = pairs.find(v => v.startsWith('accessToken=')) || 
                     pairs.find(v => v.startsWith('__Host-accessToken='));
  const token = accessPair ? decodeURIComponent(accessPair.split('=')[1] || '') : '';
  return token ? `Bearer ${token}` : null;
}

export async function GET(request: Request) {
  try {
    const auth = getAuthHeader(request);
    if (!auth) {
      return createNoCacheResponse({ message: 'Unauthorized' }, { status: 401 });
    }

    // バックエンドの統合エンドポイントにプロキシ
    const response = await secureFetchWithAuth(`${API_BASE_URL}/me`, auth);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return createNoCacheResponse(
        { message: error.error?.message || error.message || 'Failed to fetch account info' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return createNoCacheResponse(data);
  } catch (error) {
    console.error('Error in /api/me:', error);
    return createNoCacheResponse(
      { 
        message: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
