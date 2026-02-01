import { NextRequest } from 'next/server';
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils';
import { createNoCacheResponse } from '@/lib/response-utils';
import { getRefreshToken } from '@/lib/header-utils';
import { COOKIE_MAX_AGE, COOKIE_NAMES } from '@/lib/cookie-config';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002/api/v1';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const response = await secureFetchWithCommonHeaders(request, `${API_BASE_URL}/shops/${id}`, {
      method: 'GET',
      headerOptions: {
        requireAuth: true, // 認証が必要
        setContentType: false, // GETリクエストにはボディがないためContent-Typeを設定しない
      },
    });

    console.log('Next.js API Route: レスポンス受信', { status: response.status, ok: response.ok });

    // 認証エラーの場合は401を返す
    if (response.status === 401) {
      return createNoCacheResponse({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: Get shop failed', { status: response.status, error: errorData });
      return createNoCacheResponse(errorData, { status: response.status });
    }

    // レスポンスのテキストを取得して確認
    const responseText = await response.text();
    console.log('Next.js API Route: レスポンステキスト（最初の1000文字）:', responseText.substring(0, 1000));
    console.log('Next.js API Route: レスポンステキスト（最後の1000文字）:', responseText.substring(Math.max(0, responseText.length - 1000)));
    console.log('Next.js API Route: レスポンステキストの長さ:', responseText.length);
    console.log('Next.js API Route: レスポンステキストにcontactNameが含まれているか:', responseText.includes('"contactName"'));
    console.log('Next.js API Route: レスポンステキストにcontactPhoneが含まれているか:', responseText.includes('"contactPhone"'));
    console.log('Next.js API Route: レスポンステキストにcontactEmailが含まれているか:', responseText.includes('"contactEmail"'));
    console.log('Next.js API Route: レスポンステキストにservicesが含まれているか:', responseText.includes('"services"'));

    // contactNameの位置を確認
    const contactNameIndex = responseText.indexOf('"contactName"');
    if (contactNameIndex >= 0) {
      console.log('Next.js API Route: contactNameの位置:', contactNameIndex);
      console.log('Next.js API Route: contactName付近:', responseText.substring(Math.max(0, contactNameIndex - 50), contactNameIndex + 200));
    }

    const data = JSON.parse(responseText) as unknown;
    const dataRecord = (data && typeof data === 'object') ? data as Record<string, unknown> : null;
    const getString = (obj: Record<string, unknown> | null, key: string): string | undefined => {
      const value = obj?.[key];
      return typeof value === 'string' ? value : undefined;
    };
    const contactName = getString(dataRecord, 'contactName');
    const contactPhone = getString(dataRecord, 'contactPhone');
    const contactEmail = getString(dataRecord, 'contactEmail');
    const servicesValue = dataRecord?.['services'];

    // デバッグログ: レスポンスに担当者情報とservicesが含まれているか確認
    console.log('Next.js API Route: レスポンスデータ:', JSON.stringify(dataRecord ?? data, null, 2).substring(0, 1000));
    console.log('Next.js API Route: 担当者情報:', {
      contactName,
      contactPhone,
      contactEmail,
    });
    console.log('Next.js API Route: services情報:', {
      services: servicesValue,
      'servicesの型': typeof servicesValue,
      'servicesが存在するか': dataRecord ? 'services' in dataRecord : false,
    });
    console.log('Next.js API Route: レスポンスデータのキー一覧:', dataRecord ? Object.keys(dataRecord) : []);
    console.log('Next.js API Route: contactNameが含まれているか:', dataRecord ? 'contactName' in dataRecord : false);
    console.log('Next.js API Route: contactPhoneが含まれているか:', dataRecord ? 'contactPhone' in dataRecord : false);
    console.log('Next.js API Route: contactEmailが含まれているか:', dataRecord ? 'contactEmail' in dataRecord : false);
    console.log('Next.js API Route: servicesが含まれているか:', dataRecord ? 'services' in dataRecord : false);

    return createNoCacheResponse(data);
  } catch (error: unknown) {
    console.error(`❌ API Route: Get shop  error`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createNoCacheResponse({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const response = await secureFetchWithCommonHeaders(request, `${API_BASE_URL}/shops/${id}`, {
      method: 'PATCH',
      headerOptions: {
        requireAuth: true, // 認証が必要
      },
      body: JSON.stringify(body),
    });

    // 401/403エラーの場合、リフレッシュトークンで再試行を試みる
    if (response.status === 401 || response.status === 403) {
      const refreshToken = getRefreshToken(request);
      
      if (refreshToken) {
        // リフレッシュトークンでトークン更新
        const refreshResponse = await secureFetchWithCommonHeaders(request, `${API_BASE_URL}/refresh`, {
          method: 'POST',
          headerOptions: {
            requireAuth: false,
          },
          body: JSON.stringify({ refreshToken }),
        });
        
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          
          // リフレッシュ成功、新しいトークンで元のリクエストを再試行
          const newAuthHeader = `Bearer ${refreshData.accessToken}`;
          const retryResponse = await secureFetchWithCommonHeaders(request, `${API_BASE_URL}/shops/${id}`, {
            method: 'PATCH',
            headerOptions: {
              requireAuth: true,
              customHeaders: {
                'Authorization': newAuthHeader,
              },
            },
            body: JSON.stringify(body),
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            // リフレッシュされたトークンをCookieに反映
            const res = createNoCacheResponse(retryData, { status: 200 });
            const isSecure = (() => {
              try { return new URL(request.url).protocol === 'https:'; } catch { return process.env.NODE_ENV === 'production'; }
            })();
            
            // 新しいトークンをCookieに設定
            if (refreshData.accessToken) {
              res.cookies.set('accessToken', '', { httpOnly: true, secure: isSecure, sameSite: 'lax', path: '/', maxAge: 0 });
              res.cookies.set('__Host-accessToken', '', { httpOnly: true, secure: isSecure, sameSite: 'lax', path: '/', maxAge: 0 });
              res.cookies.set(COOKIE_NAMES.ACCESS_TOKEN, refreshData.accessToken, {
                httpOnly: true,
                secure: isSecure,
                sameSite: 'lax',
                path: '/',
                maxAge: COOKIE_MAX_AGE.ACCESS_TOKEN,
              });
              if (isSecure) {
                res.cookies.set(COOKIE_NAMES.HOST_ACCESS_TOKEN, refreshData.accessToken, {
                  httpOnly: true,
                  secure: true,
                  sameSite: 'lax',
                  path: '/',
                  maxAge: COOKIE_MAX_AGE.ACCESS_TOKEN,
                });
              }
            }
            if (refreshData.refreshToken) {
              res.cookies.set('refreshToken', '', { httpOnly: true, secure: isSecure, sameSite: 'lax', path: '/', maxAge: 0 });
              res.cookies.set('__Host-refreshToken', '', { httpOnly: true, secure: isSecure, sameSite: 'lax', path: '/', maxAge: 0 });
              res.cookies.set(COOKIE_NAMES.REFRESH_TOKEN, refreshData.refreshToken, {
                httpOnly: true,
                secure: isSecure,
                sameSite: 'lax',
                path: '/',
                maxAge: COOKIE_MAX_AGE.REFRESH_TOKEN,
              });
              if (isSecure) {
                res.cookies.set(COOKIE_NAMES.HOST_REFRESH_TOKEN, refreshData.refreshToken, {
                  httpOnly: true,
                  secure: true,
                  sameSite: 'lax',
                  path: '/',
                  maxAge: COOKIE_MAX_AGE.REFRESH_TOKEN,
                });
              }
            }
            
            return res;
          } else {
            const retryErrorData = await retryResponse.json().catch(() => ({}));
            console.error('❌ API Route: Update shop retry failed', { status: retryResponse.status, error: retryErrorData });
            return createNoCacheResponse(retryErrorData, { status: retryResponse.status });
          }
        }
      }
      
      // リフレッシュに失敗した場合は認証エラーを返す
      return createNoCacheResponse({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: Update shop failed', { status: response.status, error: errorData });
      return createNoCacheResponse(errorData, { status: response.status });
    }

    const data = await response.json();
    return createNoCacheResponse(data);
  } catch (error: unknown) {
    console.error(`❌ API Route: Update shop error`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createNoCacheResponse({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const response = await secureFetchWithCommonHeaders(request, `${API_BASE_URL}/shops/${id}`, {
      method: 'DELETE',
      headerOptions: {
        requireAuth: true, // 認証が必要
        setContentType: false, // DELETEリクエストにはボディがないためContent-Typeを設定しない
      },
    });

    // 認証エラーの場合は401を返す
    if (response.status === 401) {
      return createNoCacheResponse({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: Delete shop failed', { status: response.status, error: errorData });
      return createNoCacheResponse(errorData, { status: response.status });
    }

    return createNoCacheResponse({ message: '店舗が削除されました' });
  } catch (error: unknown) {
    console.error(`❌ API Route: Delete shop error`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createNoCacheResponse({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}
