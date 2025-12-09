import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://api:3002/api/v1';

function getAuthHeader(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader) return authHeader;
  
  // Cookieからトークンを取得
  const cookieHeader = request.headers.get('cookie') || '';
  const pairs = cookieHeader.split(';').map(v => v.trim());
  const accessPair = pairs.find(v => v.startsWith('accessToken=')) || pairs.find(v => v.startsWith('__Host-accessToken='));
  const token = accessPair ? decodeURIComponent(accessPair.split('=')[1] || '') : '';
  return token ? `Bearer ${token}` : null;
}

async function refreshAccessToken(request: Request): Promise<{ token: string; refreshToken?: string } | null> {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const pairs = cookieHeader.split(';').map(v => v.trim());
    const refreshPair = pairs.find(v => v.startsWith('refreshToken=')) || pairs.find(v => v.startsWith('__Host-refreshToken='));
    const refreshToken = refreshPair ? decodeURIComponent(refreshPair.split('=')[1] || '') : '';
    
    if (!refreshToken) {
      return null;
    }

    const refreshResponse = await fetch(`${API_BASE_URL}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!refreshResponse.ok) {
      return null;
    }

    const refreshData = await refreshResponse.json();
    if (!refreshData.accessToken) {
      return null;
    }
    
    return {
      token: `Bearer ${refreshData.accessToken}`,
      refreshToken: refreshData.refreshToken,
    };
  } catch {
    return null;
  }
}

// セキュリティ改善：個人情報をクエリパラメータで送信しないため、POSTメソッドに変更
export async function POST(request: NextRequest) {
  try {
    let auth = getAuthHeader(request);
    let refreshResult: { token: string; refreshToken?: string } | null = null;
    
    // accessTokenがない場合はrefreshTokenでリフレッシュを試みる
    if (!auth) {
      refreshResult = await refreshAccessToken(request);
      if (!refreshResult) {
        const cookies = request.headers.get('cookie');
        console.error('❌ API Route: No auth header found and refresh failed', { 
          hasCookies: !!cookies,
          cookies: cookies ? cookies.substring(0, 100) : 'none'
        });
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      auth = refreshResult.token;
    }

    // セキュリティ改善：個人情報をクエリパラメータで送信しないため、POSTメソッドでボディに含めて送信
    const body = await request.json().catch(() => ({}));
    
    const fullUrl = `${API_BASE_URL}/admin/users`;
    console.log('🔗 API Route: Posting to', fullUrl);

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: Get users failed', { status: response.status, error: errorData });
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ API Route: Get users successful', { count: data.users?.length || 0 });
    
    const nextResponse = NextResponse.json(data);
    
    // リフレッシュした場合はCookieを設定
    if (refreshResult) {
      const token = refreshResult.token.replace('Bearer ', '');
      const isSecure = (() => {
        try { return new URL(request.url).protocol === 'https:'; } catch { return process.env.NODE_ENV === 'production'; }
      })();
      
      nextResponse.cookies.set('accessToken', token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 15,
      });
      nextResponse.cookies.set('__Host-accessToken', token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 15,
      });
      
      if (refreshResult.refreshToken) {
        nextResponse.cookies.set('refreshToken', refreshResult.refreshToken, {
          httpOnly: true,
          secure: isSecure,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
        });
        nextResponse.cookies.set('__Host-refreshToken', refreshResult.refreshToken, {
          httpOnly: true,
          secure: isSecure,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
        });
      }
    }
    
    return nextResponse;
  } catch (error: unknown) {
    console.error('❌ API Route: Get users error', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}

