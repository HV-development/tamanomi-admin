import { NextResponse } from 'next/server';
import { secureFetch } from '@/lib/fetch-utils';
import { createNoCacheResponse } from '@/lib/response-utils';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002/api/v1';

export async function GET() {
  try {
    console.log('📱 API Route: Applications request received');
    
    const response = await secureFetch(`${API_BASE_URL}/applications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: Applications failed', { status: response.status, error: errorData });
      return createNoCacheResponse(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ API Route: Applications successful', { count: data.applications?.length });
    return createNoCacheResponse(data);
  } catch (error: unknown) {
    console.error('❌ API Route: Applications error', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createNoCacheResponse({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}
