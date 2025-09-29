import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002/api/v1';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    console.log('🚪 API Route: Logout request received');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: Logout failed', { status: response.status, error: errorData });
      return NextResponse.json(errorData, { status: response.status });
    }

    console.log('✅ API Route: Logout successful');
    return NextResponse.json({ message: 'Logout successful' });
  } catch (error: any) {
    console.error('❌ API Route: Logout error', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}