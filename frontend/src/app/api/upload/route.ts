import { NextRequest, NextResponse } from 'next/server';

// サーバーサイドではDocker内部URLを使用
const API_BASE_URL = process.env.API_BASE_URL 
  ? process.env.API_BASE_URL.replace('/api/v1', '') 
  : 'http://localhost:3002';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Authorizationヘッダーを取得
    const authHeader = request.headers.get('authorization');
    
    console.log('📤 Upload: Forwarding to', `${API_BASE_URL}/api/upload`);
    
    // バックエンドAPIに転送
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        // Authorizationヘッダーを転送
        ...(authHeader ? { Authorization: authHeader } : {}),
        // Cookieを転送
        ...(request.headers.get('cookie') ? { cookie: request.headers.get('cookie')! } : {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '画像のアップロードに失敗しました' }));
      return NextResponse.json(
        { error: errorData.message || '画像のアップロードに失敗しました' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: '画像のアップロードに失敗しました' },
      { status: 500 }
    );
  }
}

