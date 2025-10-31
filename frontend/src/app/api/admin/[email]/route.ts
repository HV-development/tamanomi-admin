import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002/api/v1';

function getAuthHeaders(request: Request): Record<string, string> {
  const authToken = request.headers.get('authorization');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = authToken;
  }

  return headers;
}

export async function GET(request: Request, { params }: { params: Promise<{ email: string }> }) {
  try {
    const { email } = await params;
    console.log('🌐 API Route: Get admin accounts request received', { email });

    const fullUrl = `${API_BASE_URL}/admin-accounts/${email}`;
    console.log('🔗 API Route: Fetching from', fullUrl);
    console.log('🔑 API Route: API_BASE_URL', API_BASE_URL);

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: getAuthHeaders(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: Get admin account failed', { status: response.status, error: errorData });
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ API Route: Get admin account successful', { email });
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('❌ API Route: Get admin account error', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ email: string }> }) {
  try {
    const { email } = await params;
    const body = await request.json();
    console.log('✏️ API Route: Update admin account request received', { email, body });
    
    const response = await fetch(`${API_BASE_URL}/admin-accounts/${email}`, {
      method: 'PATCH',
      headers: getAuthHeaders(request),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: Update admin account failed', { status: response.status, error: errorData });
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ API Route: Update admin account successful', { email });
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error(`❌ API Route: Update admin account error`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}