import { NextRequest } from 'next/server';
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils';
import { createNoCacheResponse } from '@/lib/response-utils';

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

    const data = JSON.parse(responseText);

    // デバッグログ: レスポンスに担当者情報とservicesが含まれているか確認
    console.log('Next.js API Route: レスポンスデータ:', JSON.stringify(data, null, 2).substring(0, 1000));
    console.log('Next.js API Route: 担当者情報:', {
      contactName: (data as any)?.contactName,
      contactPhone: (data as any)?.contactPhone,
      contactEmail: (data as any)?.contactEmail,
    });
    console.log('Next.js API Route: services情報:', {
      services: (data as any)?.services,
      'servicesの型': typeof (data as any)?.services,
      'servicesが存在するか': 'services' in (data || {}),
    });
    console.log('Next.js API Route: レスポンスデータのキー一覧:', Object.keys(data || {}));
    console.log('Next.js API Route: contactNameが含まれているか:', 'contactName' in (data || {}));
    console.log('Next.js API Route: contactPhoneが含まれているか:', 'contactPhone' in (data || {}));
    console.log('Next.js API Route: contactEmailが含まれているか:', 'contactEmail' in (data || {}));
    console.log('Next.js API Route: servicesが含まれているか:', 'services' in (data || {}));

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

    // 認証エラーの場合は401を返す
    if (response.status === 401) {
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
