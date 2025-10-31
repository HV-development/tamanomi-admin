import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002/api/v1';

function getAuthHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const headerToken = request.headers.get('authorization');
  if (headerToken) {
    headers['Authorization'] = headerToken;
    return headers;
  }
  const cookieHeader = request.headers.get('cookie') || '';
  const accessPair = cookieHeader.split(';').map(v => v.trim()).find(v => v.startsWith('accessToken='));
  const accessToken = accessPair ? decodeURIComponent(accessPair.split('=')[1] || '') : '';
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return headers;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log('🔄 API Route: Update shop status request received', { shopId: id, status: body.status });
    
    const response = await fetch(`${API_BASE_URL}/shops/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(request),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: Update shop status failed', { status: response.status, error: errorData });
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ API Route: Update shop status successful', { shopId: id });
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error(`❌ API Route: Update shop status  error`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}
