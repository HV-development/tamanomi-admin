import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002/api/v1';

function getAccessTokenFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const pairs = cookieHeader.split(';').map(v => v.trim());
  const accessPair = pairs.find(v => v.startsWith('accessToken=')) || pairs.find(v => v.startsWith('__Host-accessToken='));
  const token = accessPair ? decodeURIComponent(accessPair.split('=')[1] || '') : '';
  return token || null;
}

export async function GET(request: Request) {
  try {
    const token = getAccessTokenFromCookie(request);
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const secret = process.env.JWT_SECRET;
    if (!secret) return NextResponse.json({ message: 'JWT secret not configured' }, { status: 500 });

    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const accountType = payload.accountType as string | undefined;
    const email = (payload.email as string | undefined) || (payload.sub as string | undefined) || undefined;
    const accountId = payload.accountId as string | undefined;

    if (!accountType) {
      // 後方互換: 既存バックエンドで未付与の場合はフォールバック判定（必要なら拡張）
      return NextResponse.json({ message: 'accountType not found in token' }, { status: 400 });
    }

    return NextResponse.json({
      accountType,
      email: email || '',
      id: accountId,
    });
  } catch (error) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
}


