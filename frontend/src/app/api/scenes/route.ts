import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api:3002/api/v1';

export async function GET() {
  console.log('🎭 Next.js API Route: GET /api/scenes');
  
  try {
    const url = `${API_BASE_URL}/scenes`;
    console.log('📤 Forwarding to:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📥 Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend error:', errorText);
      return NextResponse.json(
        { error: '利用シーンの取得に失敗しました' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Successfully fetched scenes');
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error fetching scenes:', error);
    return NextResponse.json(
      { error: '利用シーンの取得に失敗しました' },
      { status: 500 }
    );
  }
}

