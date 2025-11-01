import { NextRequest, NextResponse } from 'next/server';

// サーバーサイドではDocker内部URLを使用
const API_BASE_URL = process.env.API_BASE_URL 
  ? process.env.API_BASE_URL.replace('/api/v1', '') 
  : 'http://localhost:3002';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    // 入力検証: 画像のみ、サイズ上限（5MB/ファイル）、最大ファイル数（5）
    const allowedTypes = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
    let fileCount = 0;
    for (const [, value] of formData.entries()) {
      if (value instanceof File) {
        fileCount += 1;
        if (fileCount > 5) {
          return NextResponse.json({ error: 'ファイル数が多すぎます（最大5件）' }, { status: 400 });
        }
        if (!allowedTypes.has(value.type)) {
          return NextResponse.json({ error: '許可されていないファイル形式です' }, { status: 400 });
        }
        if (value.size > 5 * 1024 * 1024) {
          return NextResponse.json({ error: 'ファイルサイズが大きすぎます（最大5MB）' }, { status: 400 });
        }
      }
    }
    
    // Authorizationヘッダーを取得
    const authHeader = request.headers.get('authorization');
    // CookieからAuthorizationを補完
    let finalAuth = authHeader || '';
    if (!finalAuth) {
      const cookieHeader = request.headers.get('cookie') || '';
      const pairs = cookieHeader.split(';').map(v => v.trim());
      const accessPair = pairs.find(v => v.startsWith('accessToken=')) || pairs.find(v => v.startsWith('__Host-accessToken='));
      const token = accessPair ? decodeURIComponent(accessPair.split('=')[1] || '') : '';
      if (token) finalAuth = `Bearer ${token}`;
    }
    
    console.log('📤 Upload: Forwarding to', `${API_BASE_URL}/api/upload`);
    
    // バックエンドAPIに転送
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        // Authorizationヘッダーを転送（Cookieからの補完含む）
        ...(finalAuth ? { Authorization: finalAuth } : {}),
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

