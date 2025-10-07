import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'メールアドレスが必要です' } },
        { status: 400 }
      );
    }

    console.log('📧 API Route: パスワード設定メール再送リクエスト受信', { 
      merchantId: params.id,
      email 
    });

    // バックエンドAPIを呼び出し
    const response = await fetch('http://api:3002/api/v1/password/resend-setup-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Route: パスワード設定メール再送失敗', {
        status: response.status,
        error: errorData,
      });
      
      return NextResponse.json(
        errorData,
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ API Route: パスワード設定メール再送成功', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ API Route: パスワード設定メール再送エラー', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'パスワード設定メールの再送に失敗しました' } },
      { status: 500 }
    );
  }
}

