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
          error: { 
            code: 'PARSE_ERROR',
            message: 'エラーレスポンスの解析に失敗しました'
          }
        }));

        // 401/403エラー（認証エラー）の場合の処理
        if ((response.status === 401 || response.status === 403) && !skipAuthRedirect) {
          // リフレッシュトークンで自動更新を試行
          try {
            // ログイン直後の場合、Cookieが設定されるまで少し待機
            await new Promise(resolve => setTimeout(resolve, 200));
            
            await this.refreshToken();

            // リフレッシュ成功後、Cookieが反映されるまで少し待機
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // リフレッシュ成功後、元のリクエストを再実行
            const retryResponse = await fetch(url, {
              ...fetchOptions,
              credentials: 'include',
              headers,
            });

            if (!retryResponse.ok) {
              // リトライが失敗した場合、もう一度待機して再試行
              if (retryResponse.status === 401 || retryResponse.status === 403) {
                await new Promise(resolve => setTimeout(resolve, 300));
                
                const secondRetryResponse = await fetch(url, {
                  ...fetchOptions,
                  credentials: 'include',
                  headers,
                });

                if (!secondRetryResponse.ok) {
                  throw new Error(`Retry failed with status: ${secondRetryResponse.status}`);
                }

                return await secondRetryResponse.json();
              }

              throw new Error(`Retry failed with status: ${retryResponse.status}`);
            }

            return await retryResponse.json();
          } catch (_refreshError) {
            // リフレッシュに失敗した場合はログイン画面へリダイレクト
            if (typeof window !== 'undefined') {
              window.location.href = '/login?session=expired';
            }

            return new Promise(() => {}) as Promise<T>;
          }
        }

        // エラーオブジェクトを作成して投げる
        // 標準形式 { error: { code, message } } を優先的に処理
        const errorMessage = errorData?.error?.message || errorData?.message || `リクエストに失敗しました (ステータス: ${response.status})`;
        const error = new Error(errorMessage);
        (error as Error & { response?: { status: number; data: unknown } }).response = {
          status: response.status,
          data: errorData
        };
        throw error;
      }

      return response.json();
    } catch (error) {
      // ログは控え、呼び出し元でハンドリングする
      throw error;
    }
  }

  // 認証関連
  async getMe(): Promise<unknown> {
    // ログイン画面等で401になっても自動リフレッシュしない
    return this.request<unknown>('/me', { method: 'GET', skipAuthRedirect: true });
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      skipAuthRedirect: true, // ログイン時は自動リダイレクトを無効にする
    });
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      skipAuthRedirect: true, // 登録時は自動リダイレクトを無効にする
    });
  }

  async refreshToken(_refreshData?: RefreshRequest): Promise<RefreshResponse | void> {
    try {
      const response = await this.request<RefreshResponse>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({}),
        skipAuthRedirect: true, // トークンリフレッシュ時は自動リダイレクトを無効にする
      });

      return response;
    } catch (_error) {
      return;
    }
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
  }

  // アプリケーション関連
  async getApplications(): Promise<unknown> {
    return this.request<unknown>('/applications', {
      method: 'GET',
    });
  }

  // 事業者関連
  async getMerchants(params?: { search?: string; page?: number; limit?: number; status?: string }): Promise<unknown> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/merchants?${queryString}` : '/merchants';

    return this.request<unknown>(endpoint, {
      method: 'GET',
    });
  }

  async getMerchant(id: string): Promise<unknown> {
    return this.request<unknown>(`/merchants/${id}`, {
      method: 'GET',
    });
  }

  async getMyMerchant(): Promise<unknown> {
    return this.request<unknown>('/merchants/me', {
      method: 'GET',
    });
  }

  async getMyShop(): Promise<unknown> {
    return this.request<unknown>('/shops/me', {
      method: 'GET',
    });
  }

  async createMerchant(merchantData: unknown): Promise<unknown> {
    return this.request<unknown>('/merchants', {
      method: 'POST',
      body: JSON.stringify(merchantData),
    });
  }

  async updateMerchant(id: string, merchantData: unknown): Promise<unknown> {
    return this.request<unknown>(`/merchants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(merchantData),
    });
  }

  async deleteMerchant(id: string): Promise<void> {
    return this.request<void>(`/merchants/${id}`, {
      method: 'DELETE',
    });
  }

  async updateMerchantStatus(id: string, status: string): Promise<unknown> {
    return this.request<unknown>(`/merchants/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async resendMerchantRegistration(id: string): Promise<unknown> {
    return this.request<unknown>(`/merchants/${id}/resend-registration`, {
      method: 'POST',
    });
  }

  // ジャンルカテゴリー関連
  async getGenres(): Promise<unknown> {
    return this.request<unknown>('/genres', {
      method: 'GET',
    });
  }

  // 利用シーン関連
  async getScenes(): Promise<unknown> {
    return this.request<unknown>('/scenes', {
      method: 'GET',
    });
  }

  // 店舗関連
  async getShops(queryParams?: string): Promise<unknown> {
    const endpoint = queryParams ? `/shops?${queryParams}` : '/shops';
    return this.request<unknown>(endpoint, {
      method: 'GET',
    });
  }

  async getShop(id: string): Promise<unknown> {
    return this.request<unknown>(`/shops/${id}`, {
      method: 'GET',
    });
  }

  async getShopQrCodeUrl(id: string): Promise<unknown> {
    return this.request<unknown>(`/shops/${id}/qr-code-url`, {
      method: 'GET',
    });
  }

  async getUser(id: string): Promise<unknown> {
    return this.request<unknown>(`/admin/users/${id}`, {
      method: 'GET',
    });
  }

  async createShop(shopData: unknown): Promise<unknown> {
    return this.request<unknown>('/shops', {
      method: 'POST',
      body: JSON.stringify(shopData),
    });
  }

  async updateShop(id: string, shopData: unknown): Promise<unknown> {
    return this.request<unknown>(`/shops/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(shopData),
    });
  }

  async deleteShop(id: string): Promise<void> {
    return this.request<void>(`/shops/${id}`, {
      method: 'DELETE',
    });
  }

  async updateShopStatus(id: string, statusData: { status: string }): Promise<unknown> {
    return this.request<unknown>(`/shops/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
    });
  }

  // クーポン関連
  async getCoupons(queryParams?: string): Promise<unknown> {
    const endpoint = queryParams ? `/coupons?${queryParams}` : '/coupons';
    return this.request<unknown>(endpoint, {
      method: 'GET',
    });
  }

  async getCoupon(id: string): Promise<unknown> {
    return this.request<unknown>(`/coupons/${id}`, {
      method: 'GET',
    });
  }

  async createCoupon(couponData: unknown): Promise<unknown> {
    return this.request<unknown>('/coupons', {
      method: 'POST',
      body: JSON.stringify(couponData),
    });
  }

  async updateCoupon(id: string, couponData: unknown): Promise<unknown> {
    return this.request<unknown>(`/coupons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(couponData),
    });
  }

  async deleteCoupon(id: string): Promise<void> {
    return this.request<void>(`/coupons/${id}`, {
      method: 'DELETE',
    });
  }

  async updateCouponStatus(id: string, statusData: { status: string }): Promise<unknown> {
    return this.request<unknown>(`/coupons/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
    });
  }

  async updateCouponPublicStatus(id: string, publicStatusData: { isPublic: boolean }): Promise<unknown> {
    return this.request<unknown>(`/coupons/${id}/public-status`, {
      method: 'PATCH',
      body: JSON.stringify(publicStatusData),
    });
  }

  async updateCouponPublicStatusServerSide(id: string, publicStatusData: { isPublic: boolean }, authToken?: string): Promise<unknown> {
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: { 
            code: 'PARSE_ERROR',
            message: 'エラーレスポンスの解析に失敗しました'
          }
        }));
        const errorMessage = errorData?.error?.message || errorData?.message || `リクエストに失敗しました (ステータス: ${response.status})`;
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async updateCouponStatusServerSide(id: string, statusData: { status: string }, authToken?: string): Promise<unknown> {
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: { 
            code: 'PARSE_ERROR',
            message: 'エラーレスポンスの解析に失敗しました'
          }
        }));
        const errorMessage = errorData?.error?.message || errorData?.message || `リクエストに失敗しました (ステータス: ${response.status})`;
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async issueAccounts(merchantIds: string[]): Promise<{ success: number; failed: number }> {
    const response = await this.request<{ success: boolean; data: { success: number; failed: number } }>('/merchants/issue-accounts', {
      method: 'POST',
      body: JSON.stringify({ merchantIds }),
    });
    return response.data;
  }

  // 管理者アカウント関連
  async getAdminAccounts(params?: { name?: string; email?: string; role?: string; page?: number; limit?: number }): Promise<unknown> {
    const queryParams = new URLSearchParams();
    if (params?.name) queryParams.append('name', params.name);
    if (params?.email) queryParams.append('email', params.email);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/admin?${queryString}` : '/admin';

    return this.request<unknown>(endpoint, {
      method: 'GET',
    });
  }

  // 管理者アカウント関連
  async createAdminAccount(adminAccountData: AdminAccountInput): Promise<unknown> {
    return this.request<unknown>('/admin', {
      method: 'POST',
      body: JSON.stringify(adminAccountData),
    });
  }

  async getAdminAccount(email: string): Promise<unknown> {
    return this.request<unknown>(`/admin/${email}`, {
      method: 'GET',
    });
  }

  async getAdminAccountById(id: string): Promise<unknown> {
    return this.request<unknown>(`/admin/id/${id}`, {
      method: 'GET',
    });
  }

  async updateAdminAccount(email: string, adminAccountData: AdminAccountInput): Promise<unknown> {
    return this.request<unknown>(`/admin/${email}`, {
      method: 'PATCH',
      body: JSON.stringify(adminAccountData),
    });
  }

  async updateAdminAccountById(id: string, adminAccountData: AdminAccountInput): Promise<unknown> {
    return this.request<unknown>(`/admin/id/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(adminAccountData),
    });
  }

  async deleteAdminAccount(id: string): Promise<void> {
    return this.request<void>(`/admin/id/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();