import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002/api/v1';

function getAuthHeader(request: Request): string | null {
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

    // merchant優先で判定
    const mr = await fetch(`${API_BASE_URL}/admin/merchants/me`, { headers: { 'Content-Type': 'application/json', Authorization: auth } });
    if (mr.ok) {
      const data = await mr.json().catch(() => ({}));
      const m = data?.data || data;
      const res = NextResponse.json({ accountType: 'merchant', merchantId: m?.id, email: m?.account?.email || m?.accountEmail || null });
      res.headers.set('Cache-Control', 'no-store'); res.headers.set('Pragma', 'no-cache');
      console.log('🔍 API Route: Merchant me response', data);
      return res;
    }

    // shop 次に判定
    const sr = await fetch(`${API_BASE_URL}/shops/me`, { headers: { 'Content-Type': 'application/json', Authorization: auth } });
    if (sr.ok) {
      const s = await sr.json().catch(() => ({}));
      const res = NextResponse.json({ accountType: 'shop', shopId: s?.id || s?.data?.id || null, merchantId: s?.merchant?.id || s?.data?.merchant?.id || null, email: s?.account?.email || null });
      res.headers.set('Cache-Control', 'no-store'); res.headers.set('Pragma', 'no-cache');
      console.log('🔍 API Route: Shop me response', s);
      return res;
    }

    // admin 最後に判定
    const ar = await fetch(`${API_BASE_URL}/admin-accounts/me`, { headers: { 'Content-Type': 'application/json', Authorization: auth } });
    if (ar.ok) {
      const data = await ar.json().catch(() => ({}));
      const a = data?.data || data;
      const res = NextResponse.json({ accountType: 'admin', adminId: a?.id, email: a?.email || null, role: a?.role || null });
      res.headers.set('Cache-Control', 'no-store'); res.headers.set('Pragma', 'no-cache');
      console.log('🔍 API Route: Admin me response', a);
      return res;
    }

    // どのアカウントタイプにも該当しない場合
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  } catch (error) {
    console.error('❌ API Route: /api/me error', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}


