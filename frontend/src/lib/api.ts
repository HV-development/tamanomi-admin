// APIクライアント - Next.js APIルート経由
import { 
  type AdminLoginInput, 
  type AdminRegisterInput,
  type RefreshTokenInput,
} from '@hv-development/schemas';

type RegisterInput = AdminRegisterInput;

// 認証レスポンスの型定義
interface AuthResponse {
  account: {
    email: string;
    accountType: string;
    status: string;
    displayName?: string;
  };
  accessToken: string;
  refreshToken: string;
}

type RefreshResponse = {
  token: string;
  accessToken: string;
  refreshToken: string;
};

const API_BASE_URL = '/api';

type LoginRequest = AdminLoginInput;
type LoginResponse = AuthResponse;
type RegisterRequest = RegisterInput;
type RegisterResponse = AuthResponse;
type RefreshRequest = RefreshTokenInput;

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & { skipAuthRedirect?: boolean } = {}
  ): Promise<T> {
    const { skipAuthRedirect, ...fetchOptions } = options;
    const url = `${this.baseUrl}${endpoint}`;
    console.log('🚀 API Request (via Next.js API Route):', { url, method: fetchOptions.method || 'GET', endpoint });

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: 'Unknown error',
          error: { message: 'Failed to parse error response' }
        }));
        
        // 401/403エラー（認証エラー）の場合の処理
        if ((response.status === 401 || response.status === 403) && !skipAuthRedirect) {
          console.warn('🔒 Authentication failed: Attempting token refresh...');
          
          // リフレッシュトークンで自動更新を試行
          try {
            await this.refreshToken();
            console.log('✅ Token refreshed successfully, retrying request...');
            
            // リフレッシュ成功後、元のリクエストを再実行
            const retryResponse = await fetch(url, {
              ...fetchOptions,
              headers: {
                'Content-Type': 'application/json',
                ...fetchOptions.headers,
              },
            });
            
            if (!retryResponse.ok) {
              throw new Error(`Retry failed with status: ${retryResponse.status}`);
            }
            
            return await retryResponse.json();
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);
            console.warn('🔒 Redirecting to login page due to refresh failure');
            
            // リフレッシュに失敗した場合はログイン画面へリダイレクト
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userData');
            
            if (typeof window !== 'undefined') {
              window.location.href = '/login?session=expired';
            }
            
            return new Promise(() => {}) as Promise<T>;
          }
        }
        
        // エラーオブジェクトを作成して投げる
        const errorMessage = errorData?.message || errorData?.error?.message || `HTTP error! status: ${response.status}`;
        const error = new Error(errorMessage);
        (error as Error & { response?: { status: number; data: unknown } }).response = {
          status: response.status,
          data: errorData
        };
        throw error;
      }

      return response.json();
    } catch (error) {
      console.error('❌ API Request failed:', error);
      throw error;
    }
  }

  // 認証関連
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('🔐 API: login called (via Next.js API Route)');
    console.log('🔗 API Base URL:', this.baseUrl);
    console.log('🔗 Full URL:', `${this.baseUrl}/auth/login`);
    
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      skipAuthRedirect: true, // ログイン時は自動リダイレクトを無効にする
    });
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    console.log('📝 API: register called (via Next.js API Route)');
    return this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      skipAuthRedirect: true, // 登録時は自動リダイレクトを無効にする
    });
  }

  async refreshToken(refreshData?: RefreshRequest): Promise<RefreshResponse> {
    console.log('🔄 API: refreshToken called (via Next.js API Route)');
    
    // refreshDataが提供されていない場合は、ローカルストレージから取得
    const refreshTokenValue = refreshData?.refreshToken || localStorage.getItem('refreshToken');
    
    if (!refreshTokenValue) {
      throw new Error('No refresh token available');
    }
    
    const response = await this.request<RefreshResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
      skipAuthRedirect: true, // トークンリフレッシュ時は自動リダイレクトを無効にする
    });
    
    // 新しいトークンをローカルストレージに保存
    if (response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken);
    }
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    
    return response;
  }

  async logout(): Promise<void> {
    console.log('🚪 API: logout called (via Next.js API Route)');
    const token = localStorage.getItem('accessToken');
    if (token) {
      await this.request('/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }
  }

  // アプリケーション関連
  async getApplications(): Promise<unknown> {
    console.log('📱 API: getApplications called (via Next.js API Route)');
    return this.request<unknown>('/applications', {
      method: 'GET',
    });
  }

  // 事業者関連
  async getMerchants(params?: { search?: string; page?: number; limit?: number; status?: string }): Promise<unknown> {
    console.log('🌐 API: getMerchants called (via Next.js API Route)', { params });
    console.log('🔗 API Base URL:', this.baseUrl);
    
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/merchants?${queryString}` : '/merchants';
    console.log('🔗 Full URL:', `${this.baseUrl}${endpoint}`);
    
    const token = localStorage.getItem('accessToken');
    return this.request<unknown>(endpoint, {
      method: 'GET',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  }

  async getMerchant(id: string): Promise<unknown> {
    console.log('🏢 API: getMerchant called (via Next.js API Route)', { id });
    const token = localStorage.getItem('accessToken');
    return this.request<unknown>(`/merchants/${id}`, {
      method: 'GET',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  }

  async getMyMerchant(): Promise<unknown> {
    console.log('👤 API: getMyMerchant called (via Next.js API Route)');
    const token = localStorage.getItem('accessToken');
    return this.request<unknown>('/merchants/me', {
      method: 'GET',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  }

  async getMyShop(): Promise<unknown> {
    console.log('🏪 API: getMyShop called (via Next.js API Route)');
    const token = localStorage.getItem('accessToken');
    return this.request<unknown>('/shops/me', {
      method: 'GET',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  }

  async createMerchant(merchantData: unknown): Promise<unknown> {
    console.log('➕ API: createMerchant called (via Next.js API Route)');
    const token = localStorage.getItem('accessToken');
    return this.request<unknown>('/merchants', {
      method: 'POST',
      body: JSON.stringify(merchantData),
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  }

  async updateMerchant(id: string, merchantData: unknown): Promise<unknown> {
    console.log('✏️ API: updateMerchant called (via Next.js API Route)', { id });
    const token = localStorage.getItem('accessToken');
    return this.request<unknown>(`/merchants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(merchantData),
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  }

  async deleteMerchant(id: string): Promise<void> {
    console.log('🗑️ API: deleteMerchant called (via Next.js API Route)', { id });
    const token = localStorage.getItem('accessToken');
    return this.request<void>(`/merchants/${id}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  }

  async updateMerchantStatus(id: string, status: string): Promise<unknown> {
    console.log('🔄 API: updateMerchantStatus called (via Next.js API Route)', { id, status });
    const token = localStorage.getItem('accessToken');
    return this.request<unknown>(`/merchants/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  }

  async resendMerchantRegistration(id: string): Promise<unknown> {
    console.log('📧 API: resendMerchantRegistration called (via Next.js API Route)', { id });
    const token = localStorage.getItem('accessToken');
    return this.request<unknown>(`/merchants/${id}/resend-registration`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  }

  // ジャンルカテゴリー関連
  async getGenres(): Promise<unknown> {
    console.log('🏷️ API: getGenres called (via Next.js API Route)');
    return this.request<unknown>('/genres', {
      method: 'GET',
    });
  }

  // 利用シーン関連
  async getScenes(): Promise<unknown> {
    console.log('🎭 API: getScenes called (via Next.js API Route)');
    return this.request<unknown>('/scenes', {
      method: 'GET',
    });
  }

  // 店舗関連
  async getShops(queryParams?: string): Promise<unknown> {
    console.log('🏪 API: getShops called (via Next.js API Route)');
    const token = localStorage.getItem('accessToken');
    console.log('🔑 API: getShops - Token check', { 
      hasToken: !!token, 
      tokenLength: token?.length,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'no token'
    });
    const endpoint = queryParams ? `/shops?${queryParams}` : '/shops';
    return this.request<unknown>(endpoint, {
      method: 'GET',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  }

  async getShop(id: string): Promise<unknown> {
    console.log('🏪 API: getShop called (via Next.js API Route)', { id });
    const token = localStorage.getItem('accessToken');
    return this.request<unknown>(`/shops/${id}`, {
      method: 'GET',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  }

  async createShop(shopData: unknown): Promise<unknown> {
    console.log('➕ API: createShop called (via Next.js API Route)');
    const token = localStorage.getItem('accessToken');
    return this.request<unknown>('/shops', {
      method: 'POST',
      body: JSON.stringify(shopData),
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  }

  async updateShop(id: string, shopData: unknown): Promise<unknown> {
    console.log('✏️ API: updateShop called (via Next.js API Route)', { id });
    const token = localStorage.getItem('accessToken');
    return this.request<unknown>(`/shops/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(shopData),
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  }

  async deleteShop(id: string): Promise<void> {
    console.log('🗑️ API: deleteShop called (via Next.js API Route)', { id });
    const token = localStorage.getItem('accessToken');
    return this.request<void>(`/shops/${id}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  }

  async updateShopStatus(id: string, statusData: { status: string }): Promise<unknown> {
    console.log('🔄 API: updateShopStatus called (via Next.js API Route)', { id, statusData });
    const token = localStorage.getItem('accessToken');
    return this.request<unknown>(`/shops/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  }

  // クーポン関連
  async getCoupons(queryParams?: string): Promise<unknown> {
    console.log('🎟️ API: getCoupons called (via Next.js API Route)');
    const token = localStorage.getItem('accessToken');
    const endpoint = queryParams ? `/coupons?${queryParams}` : '/coupons';
    return this.request<unknown>(endpoint, {
      method: 'GET',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  }

  async getCoupon(id: string): Promise<unknown> {
    console.log('🎟️ API: getCoupon called (via Next.js API Route)', { id });
    const token = localStorage.getItem('accessToken');
    return this.request<unknown>(`/coupons/${id}`, {
      method: 'GET',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  }

  async createCoupon(couponData: unknown): Promise<unknown> {
    console.log('➕ API: createCoupon called (via Next.js API Route)');
    const token = localStorage.getItem('accessToken');
    return this.request<unknown>('/coupons', {
      method: 'POST',
      body: JSON.stringify(couponData),
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  }

  async updateCoupon(id: string, couponData: unknown): Promise<unknown> {
    console.log('✏️ API: updateCoupon called (via Next.js API Route)', { id });
    const token = localStorage.getItem('accessToken');
    return this.request<unknown>(`/coupons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(couponData),
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  }

  async deleteCoupon(id: string): Promise<void> {
    console.log('🗑️ API: deleteCoupon called (via Next.js API Route)', { id });
    const token = localStorage.getItem('accessToken');
    return this.request<void>(`/coupons/${id}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  }

  async updateCouponStatus(id: string, statusData: { status: string }): Promise<unknown> {
    console.log('🔄 API: updateCouponStatus called (via Next.js API Route)', { id, statusData });
    const token = localStorage.getItem('accessToken');
    return this.request<unknown>(`/coupons/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  }

  async updateCouponPublicStatus(id: string, publicStatusData: { isPublic: boolean }): Promise<unknown> {
    console.log('🌐 API: updateCouponPublicStatus called (via Next.js API Route)', { id, publicStatusData });
    const token = localStorage.getItem('accessToken');
    return this.request<unknown>(`/coupons/${id}/public-status`, {
      method: 'PATCH',
      body: JSON.stringify(publicStatusData),
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  }

  async updateCouponPublicStatusServerSide(id: string, publicStatusData: { isPublic: boolean }, authToken?: string): Promise<unknown> {
    console.log('🌐 API: updateCouponPublicStatusServerSide called', { id, publicStatusData, authToken: authToken ? 'present' : 'missing' });
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002/api/v1';
    
    try {
      const response = await fetch(`${backendUrl}/coupons/${id}/public-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': authToken }),
        },
        body: JSON.stringify(publicStatusData),
      });
      
      console.log('📡 Server-side API Response:', { status: response.status, statusText: response.statusText });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('❌ Server-side API Error:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Server-side API Success:', result);
      return result;
    } catch (error) {
      console.error('❌ Server-side API Request failed:', error);
      throw error;
    }
  }

  async updateCouponStatusServerSide(id: string, statusData: { status: string }, authToken?: string): Promise<unknown> {
    console.log('🔄 API: updateCouponStatusServerSide called', { id, statusData, authToken: authToken ? 'present' : 'missing' });
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002/api/v1';
    
    try {
      const response = await fetch(`${backendUrl}/coupons/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': authToken }),
        },
        body: JSON.stringify(statusData),
      });
      
      console.log('📡 Server-side API Response:', { status: response.status, statusText: response.statusText });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('❌ Server-side API Error:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Server-side API Success:', result);
      return result;
    } catch (error) {
      console.error('❌ Server-side API Request failed:', error);
      throw error;
    }
  }

  async issueAccounts(merchantIds: string[]): Promise<{ success: number; failed: number }> {
    console.log('🎫 API: issueAccounts called', { merchantIds });
    const token = localStorage.getItem('accessToken');
    const response = await this.request<{ success: boolean; data: { success: number; failed: number } }>('/merchants/issue-accounts', {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: JSON.stringify({ merchantIds }),
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();