import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log('🔄 Next.js API Route: PATCH /api/coupons/[id]/status', { id, body });
    
    // Authorizationヘッダーを取得
    const authHeader = request.headers.get('authorization');
    
    // APIクライアントのサーバーサイド用メソッドを使用
    const result = await apiClient.updateCouponStatusServerSide(id, body, authHeader || undefined);
    
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('❌ Next.js API Route Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
