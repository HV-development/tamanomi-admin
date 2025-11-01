import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002/api/v1';

function getAuthHeader(request: Request): string | null {
  const headerToken = request.headers.get('authorization');
  if (headerToken) return headerToken;
  const cookieHeader = request.headers.get('cookie') || '';
  const pairs = cookieHeader.split(';').map(v => v.trim());
  const accessPair = pairs.find(v => v.startsWith('accessToken=')) || pairs.find(v => v.startsWith('__Host-accessToken='));
  const token = accessPair ? decodeURIComponent(accessPair.split('=')[1] || '') : '';
  return token ? `Bearer ${token}` : null;
}

export async function GET(request: Request) {
  try {
    const auth = getAuthHeader(request);
    if (!auth) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    // まずは事業者アカウントかどうか
    const merchantRes = await fetch(`${API_BASE_URL}/admin/merchants/me`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
    });
    if (merchantRes.ok) {
      const data = await merchantRes.json().catch(() => ({}));
      const m = data?.data || data;
      return NextResponse.json({
        accountType: 'merchant',
        merchantId: m?.id,
        email: m?.account?.email || m?.accountEmail || null,
      });
    }

    // 次に店舗アカウントかどうか
    const shopRes = await fetch(`${API_BASE_URL}/shops/me`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
    });
    if (shopRes.ok) {
      const s = await shopRes.json().catch(() => ({}));
      return NextResponse.json({
        accountType: 'shop',
        shopId: s?.id || s?.data?.id || null,
        merchantId: s?.merchant?.id || s?.data?.merchant?.id || null,
        email: s?.account?.email || null,
      });
    }

    // デフォルトは管理者（admin）として扱う
    return NextResponse.json({ accountType: 'admin' });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}


