import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://api:3002/api/v1';

function getAuthHeader(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader) return authHeader;

  const cookieHeader = request.headers.get('cookie') || '';
  const pairs = cookieHeader.split(';').map((value) => value.trim());
  const accessPair =
    pairs.find((value) => value.startsWith('accessToken=')) ||
    pairs.find((value) => value.startsWith('__Host-accessToken='));
  const token = accessPair ? decodeURIComponent(accessPair.split('=')[1] || '') : '';
  return token ? `Bearer ${token}` : null;
}

async function refreshAccessToken(request: Request): Promise<{ token: string; refreshToken?: string } | null> {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const pairs = cookieHeader.split(';').map((value) => value.trim());
    const refreshPair =
      pairs.find((value) => value.startsWith('refreshToken=')) ||
      pairs.find((value) => value.startsWith('__Host-refreshToken='));
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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const id = segments[segments.length - 1];

  if (!id) {
    return NextResponse.json({ message: 'ユーザーIDが指定されていません' }, { status: 400 });
  }

  try {
    let auth = getAuthHeader(request);
    let refreshResult: { token: string; refreshToken?: string } | null = null;

    if (!auth) {
      refreshResult = await refreshAccessToken(request);
      if (!refreshResult) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      auth = refreshResult.token;
    }

    const fullUrl = `${API_BASE_URL}/users/${encodeURIComponent(id)}`;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: { 
          code: 'PARSE_ERROR',
          message: 'エラーレスポンスの解析に失敗しました'
        }
      }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json().catch(() => null);
    const nextResponse = NextResponse.json(data);

    if (refreshResult) {
      const token = refreshResult.token.replace('Bearer ', '');
      const isSecure = (() => {
        try {
          return new URL(request.url).protocol === 'https:';
        } catch {
          return process.env.NODE_ENV === 'production';
        }
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
    const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
    return NextResponse.json({ 
      error: {
        code: 'INTERNAL_ERROR',
        message: 'ユーザー情報の取得に失敗しました',
        details: errorMessage
      }
    }, { status: 500 });
  }
}

