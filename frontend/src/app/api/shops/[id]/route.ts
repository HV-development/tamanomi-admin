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

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log('🏪 API Route: Get shop request received', { shopId: id });
    
    const response = await fetch(`${API_BASE_URL}/shops/`, {
      method: 'GET',
      headers: getAuthHeaders(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: Get shop failed', { status: response.status, error: errorData });
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ API Route: Get shop successful', { shopId: id });
    console.log('🔍 API Route: Shop data received from backend:', {
      paymentCredit: data.paymentCredit,
      paymentCode: data.paymentCode,
      customSceneText: data.customSceneText,
      sceneIds: data.sceneIds
    });
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error(`❌ API Route: Get shop  error`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log('✏️ API Route: Update shop request received', { shopId: id, name: body.name });
    
    const response = await fetch(`${API_BASE_URL}/shops/`, {
      method: 'PATCH',
      headers: getAuthHeaders(request),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: Update shop failed', { status: response.status, error: errorData });
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ API Route: Update shop successful', { shopId: id });
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error(`❌ API Route: Update shop  error`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log('🗑️ API Route: Delete shop request received', { shopId: id });
    
    const response = await fetch(`${API_BASE_URL}/shops/`, {
      method: 'DELETE',
      headers: getAuthHeaders(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: Delete shop failed', { status: response.status, error: errorData });
      return NextResponse.json(errorData, { status: response.status });
    }

    console.log('✅ API Route: Delete shop successful', { shopId: id });
    return NextResponse.json({ message: '店舗が削除されました' });
  } catch (error: unknown) {
    console.error(`❌ API Route: Delete shop  error`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}
