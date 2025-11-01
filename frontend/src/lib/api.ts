// APIクライアント - Next.js APIルート経由
import { 
  type AdminLoginInput, 
  type AdminRegisterInput,
  type RefreshTokenInput,
  type AdminAccountInput,
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
      const isFormData = typeof fetchOptions.body !== 'undefined' && fetchOptions.body instanceof FormData;
      const hasBody = typeof fetchOptions.body !== 'undefined';
      const headers: Record<string, string> = {
        ...(fetchOptions.headers as Record<string, string> | undefined),
        ...(hasBody && !isFormData ? { 'Content-Type': 'application/json' } : {}),
      };

      const response = await fetch(url, {
        ...fetchOptions,
        credentials: 'include',
        headers,
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
              credentials: 'include',
              headers,
            });
            
            if (!retryResponse.ok) {
              throw new Error(`Retry failed with status: ${retryResponse.status}`);
            }
            
            return await retryResponse.json();
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);
            console.warn('🔒 Redirecting to login page due to refresh failure');
            
            // リフレッシュに失敗した場合はログイン画面へリダイレクト
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
      // リフレッシュ時の失敗は想定されるため、ログレベルを下げる
      if (endpoint === '/auth/refresh') {
        console.warn('🔄 Refresh request failed (suppressed):', error);
      } else {
        console.error('❌ API Request failed:', error);
      }
      throw error;
    }
  }

  // 認証関連
  async getMe(): Promise<unknown> {
    return this.request<unknown>('/me', { method: 'GET' });
  }

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

  async refreshToken(refreshData?: RefreshRequest): Promise<RefreshResponse | void> {
    console.log('🔄 API: refreshToken called (via Next.js API Route)');
    
    try {
      const response = await this.request<RefreshResponse>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({}),
        skipAuthRedirect: true, // トークンリフレッシュ時は自動リダイレクトを無効にする
      });

      return response;
    } catch (error) {
      console.warn('🔄 Refresh token invalid (cleared and continuing)');
      return;
    }
  }

  async logout(): Promise<void> {
    console.log('🚪 API: logout called (via Next.js API Route)');
    await this.request('/auth/logout', { method: 'POST' });
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
    
    return this.request<unknown>(endpoint, {
      method: 'GET',
    });
  }

  async getMerchant(id: string): Promise<unknown> {
    console.log('🏢 API: getMerchant called (via Next.js API Route)', { id });
    return this.request<unknown>(`/merchants/${id}`, {
      method: 'GET',
    });
  }

  async getMyMerchant(): Promise<unknown> {
    console.log('👤 API: getMyMerchant called (via Next.js API Route)');
    return this.request<unknown>('/merchants/me', {
      method: 'GET',
    });
  }

  async getMyShop(): Promise<unknown> {
    console.log('🏪 API: getMyShop called (via Next.js API Route)');
    return this.request<unknown>('/shops/me', {
      method: 'GET',
    });
  }

  async createMerchant(merchantData: unknown): Promise<unknown> {
    console.log('➕ API: createMerchant called (via Next.js API Route)');
    return this.request<unknown>('/merchants', {
      method: 'POST',
      body: JSON.stringify(merchantData),
    });
  }

  async updateMerchant(id: string, merchantData: unknown): Promise<unknown> {
    console.log('✏️ API: updateMerchant called (via Next.js API Route)', { id });
    return this.request<unknown>(`/merchants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(merchantData),
    });
  }

  async deleteMerchant(id: string): Promise<void> {
    console.log('🗑️ API: deleteMerchant called (via Next.js API Route)', { id });
    return this.request<void>(`/merchants/${id}`, {
      method: 'DELETE',
    });
  }

  async updateMerchantStatus(id: string, status: string): Promise<unknown> {
    console.log('🔄 API: updateMerchantStatus called (via Next.js API Route)', { id, status });
    return this.request<unknown>(`/merchants/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async resendMerchantRegistration(id: string): Promise<unknown> {
    console.log('📧 API: resendMerchantRegistration called (via Next.js API Route)', { id });
    return this.request<unknown>(`/merchants/${id}/resend-registration`, {
      method: 'POST',
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
    
    const endpoint = queryParams ? `/shops?${queryParams}` : '/shops';
    return this.request<unknown>(endpoint, {
      method: 'GET',
    });
  }

  async getShop(id: string): Promise<unknown> {
    console.log('🏪 API: getShop called (via Next.js API Route)', { id });
    return this.request<unknown>(`/shops/${id}`, {
      method: 'GET',
    });
  }

  async createShop(shopData: unknown): Promise<unknown> {
    console.log('➕ API: createShop called (via Next.js API Route)');
    return this.request<unknown>('/shops', {
      method: 'POST',
      body: JSON.stringify(shopData),
    });
  }

  async updateShop(id: string, shopData: unknown): Promise<unknown> {
    console.log('✏️ API: updateShop called (via Next.js API Route)', { id });
    return this.request<unknown>(`/shops/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(shopData),
    });
  }

  async deleteShop(id: string): Promise<void> {
    console.log('🗑️ API: deleteShop called (via Next.js API Route)', { id });
    return this.request<void>(`/shops/${id}`, {
      method: 'DELETE',
    });
  }

  async updateShopStatus(id: string, statusData: { status: string }): Promise<unknown> {
    console.log('🔄 API: updateShopStatus called (via Next.js API Route)', { id, statusData });
    return this.request<unknown>(`/shops/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
    });
  }

  // クーポン関連
  async getCoupons(queryParams?: string): Promise<unknown> {
    console.log('🎟️ API: getCoupons called (via Next.js API Route)');
    const endpoint = queryParams ? `/coupons?${queryParams}` : '/coupons';
    return this.request<unknown>(endpoint, {
      method: 'GET',
    });
  }

  async getCoupon(id: string): Promise<unknown> {
    console.log('🎟️ API: getCoupon called (via Next.js API Route)', { id });
    return this.request<unknown>(`/coupons/${id}`, {
      method: 'GET',
    });
  }

  async createCoupon(couponData: unknown): Promise<unknown> {
    console.log('➕ API: createCoupon called (via Next.js API Route)');
    return this.request<unknown>('/coupons', {
      method: 'POST',
      body: JSON.stringify(couponData),
    });
  }

  async updateCoupon(id: string, couponData: unknown): Promise<unknown> {
    console.log('✏️ API: updateCoupon called (via Next.js API Route)', { id });
    return this.request<unknown>(`/coupons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(couponData),
    });
  }

  async deleteCoupon(id: string): Promise<void> {
    console.log('🗑️ API: deleteCoupon called (via Next.js API Route)', { id });
    return this.request<void>(`/coupons/${id}`, {
      method: 'DELETE',
    });
  }

  async updateCouponStatus(id: string, statusData: { status: string }): Promise<unknown> {
    console.log('🔄 API: updateCouponStatus called (via Next.js API Route)', { id, statusData });
    return this.request<unknown>(`/coupons/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
    });
  }

  async updateCouponPublicStatus(id: string, publicStatusData: { isPublic: boolean }): Promise<unknown> {
    console.log('🌐 API: updateCouponPublicStatus called (via Next.js API Route)', { id, publicStatusData });
    return this.request<unknown>(`/coupons/${id}/public-status`, {
      method: 'PATCH',
      body: JSON.stringify(publicStatusData),
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
    const response = await this.request<{ success: boolean; data: { success: number; failed: number } }>('/merchants/issue-accounts', {
      method: 'POST',
      body: JSON.stringify({ merchantIds }),
    });
    return response.data;
  }

  // 管理者アカウント関連
  async getAdminAccounts(params?: { name?: string; email?: string; role?: string; page?: number; limit?: number }): Promise<unknown> {
    console.log('👥 API: getAdminAccounts called (via Next.js API Route)', { params });
    console.log('🔗 API Base URL:', this.baseUrl);
    
    const queryParams = new URLSearchParams();
    if (params?.name) queryParams.append('name', params.name); 
    if (params?.email) queryParams.append('email', params.email);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.page) queryParams.append('page', params.page.toString());    
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/admin?${queryString}` : '/admin';
    console.log('🔗 Full URL:', `${this.baseUrl}${endpoint}`);
    
    return this.request<unknown>(endpoint, {
      method: 'GET',
    });
  }

  // 管理者アカウント関連
  async createAdminAccount(adminAccountData: AdminAccountInput): Promise<unknown> {
    console.log('➕ API: createAdminAccount called (via Next.js API Route)');
    return this.request<unknown>('/admin', {
      method: 'POST',
      body: JSON.stringify(adminAccountData),
    });
  }

  async getAdminAccount(email: string): Promise<unknown> {
    console.log('👥 API: getAdminAccount called (via Next.js API Route)', { email });
    return this.request<unknown>(`/admin/${email}`, {
      method: 'GET',
    });
  }

  async updateAdminAccount(email: string, adminAccountData: AdminAccountInput): Promise<unknown> {
    console.log('✏️ API: updateAdminAccount called (via Next.js API Route)', { email });
    return this.request<unknown>(`/admin/${email}`, {
      method: 'PATCH',
      body: JSON.stringify(adminAccountData),
    });
  }

  async deleteAdminAccount(email: string): Promise<void> {
    console.log('🗑️ API: deleteAdminAccount called (via Next.js API Route)', { email });
    return this.request<void>(`/admin/${email}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();