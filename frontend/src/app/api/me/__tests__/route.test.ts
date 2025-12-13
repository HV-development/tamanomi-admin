import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '../route';

// モックの設定
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('/api/me endpoint - プロキシパターン', () => {
  const API_BASE_URL = 'http://localhost:3002/api/v1';
  const ORIGINAL_ENV = process.env;
  
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...ORIGINAL_ENV };
    process.env.API_BASE_URL = API_BASE_URL;
  cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });

  /**
   * リクエストオブジェクトを作成
   */
  const createRequest = (token?: string) => {
    const headers = new Headers();
    if (token) {
      headers.set('cookie', `accessToken=${encodeURIComponent(token)}`);
    }
    return new Request('http://localhost:3000/api/me', {
      method: 'GET',
      headers,
    cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });
  };

  describe('✅ 正常系: バックエンドへのプロキシ', () => {
    it('admin アカウント情報を正しく取得できる', async () => {
      const backendResponse = {
        accountType: 'admin',
        email: 'admin@example.com',
        role: 'operator',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => backendResponse,
      cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });

      const request = createRequest('valid-jwt-token');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.accountType).toBe('admin');
      expect(data.role).toBe('operator');
      expect(data.email).toBe('admin@example.com');
      
      // バックエンドAPIが正しく呼ばれたことを確認
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/me`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-jwt-token',
          }),
        })
      );
    cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });

    it('merchant アカウント情報を正しく取得できる', async () => {
      const backendResponse = {
        accountType: 'merchant',
        email: 'merchant@example.com',
        merchantId: 'merchant-123',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => backendResponse,
      cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });

      const request = createRequest('valid-jwt-token');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.accountType).toBe('merchant');
      expect(data.merchantId).toBe('merchant-123');
    cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });

    it('shop アカウント情報を正しく取得できる', async () => {
      const backendResponse = {
        accountType: 'shop',
        email: 'shop@example.com',
        shopId: 'shop-456',
        merchantId: 'merchant-123',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => backendResponse,
      cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });

      const request = createRequest('valid-jwt-token');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.accountType).toBe('shop');
      expect(data.shopId).toBe('shop-456');
      expect(data.merchantId).toBe('merchant-123');
    cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });
  cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });

  describe('🚨 異常系: バックエンドエラーのハンドリング', () => {
    it('トークンなしの場合は401を返す', async () => {
      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe('Unauthorized');
      
      // バックエンドAPIは呼ばれない
      expect(mockFetch).not.toHaveBeenCalled();
    cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });

    it('バックエンドが403を返した場合（無効なトークン）', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' }
        }),
      cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });

      const request = createRequest('invalid-token');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.message).toContain('Invalid or expired token');
    cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });

    it('バックエンドが404を返した場合', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: { code: 'NOT_FOUND', message: 'Account not found' }
        }),
      cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });

      const request = createRequest('valid-token');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.message).toContain('Account not found');
    cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });

    it('バックエンドが500エラーを返した場合', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: { code: 'INTERNAL_ERROR', message: 'Internal server error' }
        }),
      cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });

      const request = createRequest('valid-token');
      const response = await GET(request);

      expect(response.status).toBe(500);
    cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });

    it('ネットワークエラーが発生した場合', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const request = createRequest('valid-token');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('Internal Server Error');
      expect(data.error).toBe('Network error');
    cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });
  cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });

  describe('🔐 セキュリティ: JWT検証はバックエンドで実施', () => {
    it('偽造されたJWTはバックエンドで検出される', async () => {
      // フロントエンドは単純にトークンを転送するだけ
      // バックエンドが403を返すことを確認
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' }
        }),
      cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });

      const forgedToken = 'eyJhbGciOiJIUzI1NiJ9.fake.payload';
      const request = createRequest(forgedToken);
      const response = await GET(request);

      expect(response.status).toBe(403);
      
      // フロントエンドはトークンをそのまま転送
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/me`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${forgedToken}`,
          }),
        })
      );
    cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });

    it('改竄されたペイロードはバックエンドで拒否される', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          error: { message: 'Invalid or expired token' }
        }),
      cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });

      const tamperedToken = 'header.tamperedPayload.signature';
      const request = createRequest(tamperedToken);
      const response = await GET(request);

      expect(response.status).toBe(403);
    cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });
  cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });

  describe('📦 レスポンスヘッダー', () => {
    it('キャッシュ無効化ヘッダーが設定される', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          accountType: 'admin',
          email: 'admin@example.com',
        }),
      cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });

      const request = createRequest('valid-token');
      const response = await GET(request);

      expect(response.headers.get('Cache-Control')).toBe('no-store');
      expect(response.headers.get('Pragma')).toBe('no-cache');
    cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });
  cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });

  describe('🍪 Cookie処理', () => {
    it('__Host-accessToken から取得できる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ accountType: 'admin' }),
      cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });

      const headers = new Headers();
      headers.set('cookie', '__Host-accessToken=my-token-value');
      const request = new Request('http://localhost:3000/api/me', {
        method: 'GET',
        headers,
      cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });

      await GET(request);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/me`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer my-token-value',
          }),
        })
      );
    cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });

    it('accessToken が優先される', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ accountType: 'admin' }),
      cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });

      const headers = new Headers();
      headers.set('cookie', 'accessToken=token1; __Host-accessToken=token2');
      const request = new Request('http://localhost:3000/api/me', {
        method: 'GET',
        headers,
      cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });

      await GET(request);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/me`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer token1',
          }),
        })
      );
    cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });
  cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });
cache: 'no-store', // キャッシュを無効化して機密情報の漏洩を防止
    });
