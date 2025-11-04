import { NextResponse } from 'next/server';
import { decodeJwt } from 'jose';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002/api/v1';

function getAuthHeader(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const pairs = cookieHeader.split(';').map(v => v.trim());
  const accessPair = pairs.find(v => v.startsWith('accessToken=')) || pairs.find(v => v.startsWith('__Host-accessToken='));
  const token = accessPair ? decodeURIComponent(accessPair.split('=')[1] || '') : '';
  return token ? `Bearer ${token}` : null;
}

function getTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const pairs = cookieHeader.split(';').map(v => v.trim());
  const accessPair = pairs.find(v => v.startsWith('accessToken=')) || pairs.find(v => v.startsWith('__Host-accessToken='));
  if (!accessPair) return null;
  const token = decodeURIComponent(accessPair.split('=')[1] || '');
  // Bearerプレフィックスを除去
  return token.replace(/^Bearer\s+/, '') || null;
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
      return res;
    }

    // shop 次に判定
    const sr = await fetch(`${API_BASE_URL}/shops/me`, { headers: { 'Content-Type': 'application/json', Authorization: auth } });
    if (sr.ok) {
      const s = await sr.json().catch(() => ({}));
      const res = NextResponse.json({ accountType: 'shop', shopId: s?.id || s?.data?.id || null, merchantId: s?.merchant?.id || s?.data?.merchant?.id || null, email: s?.account?.email || null });
      res.headers.set('Cache-Control', 'no-store'); res.headers.set('Pragma', 'no-cache');
      return res;
    }

    // adminアカウントの場合、JWTトークンからroleを取得
    const token = getTokenFromRequest(request);
    let role: string | undefined = undefined;
    if (token) {
      try {
        const decoded = decodeJwt(token);
        role = decoded.role as string | undefined;
        console.log('🔍 [api/me] JWT decoded:', { role, accountType: decoded.accountType, email: decoded.email });
      } catch (error) {
        // JWTデコード失敗時は無視（トークンが無効な場合など）
        console.error('❌ [api/me] Failed to decode JWT token:', error);
        // roleはundefinedのまま続行
      }
    } else {
      console.log('⚠️ [api/me] No token found');
    }
    console.log('🔍 [api/me] Returning admin response:', { accountType: 'admin', role });
    const res = NextResponse.json({ accountType: 'admin', role });
    res.headers.set('Cache-Control', 'no-store'); res.headers.set('Pragma', 'no-cache');
    return res;
  } catch (error) {
    console.error('Error in /api/me:', error);
    return NextResponse.json({ 
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


