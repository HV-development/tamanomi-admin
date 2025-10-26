import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002/api/v1';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    console.log('🔄 API Route: Bulk shop status update request received', { 
      shopIds: body.shopIds, 
      status: body.status 
    });
    
    const response = await fetch(`${API_BASE_URL}/shops/bulk-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: Bulk shop status update failed', { 
        status: response.status, 
        error: errorData 
      });
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ API Route: Bulk shop status update successful', { 
      updatedCount: data.data?.updatedCount,
      failedCount: data.data?.failedCount
    });
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('❌ API Route: Bulk shop status update error', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      message: 'Internal Server Error', 
      error: errorMessage 
    }, { status: 500 });
  }
}

