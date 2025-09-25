// APIクライアント - Next.js APIルート経由
import { AdminLoginInput, RegisterInput, RefreshTokenInput, AuthResponse, RefreshResponse } from '@tamanomi/schemas';

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
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log('🚀 API Request (via Next.js API Route):', { url, method: options.method || 'GET', endpoint });

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: 'Unknown error',
          error: { message: 'Failed to parse error response' }
        }));
        
        // エラーオブジェクトを作成して投げる
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        (error as any).response = {
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
    });
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    console.log('📝 API: register called (via Next.js API Route)');
    return this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refreshToken(refreshData: RefreshRequest): Promise<RefreshResponse> {
    console.log('🔄 API: refreshToken called (via Next.js API Route)');
    return this.request<RefreshResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify(refreshData),
    });
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

  // 事業者関連
  async getMerchants(): Promise<any> {
    console.log('🌐 API: getMerchants called (via Next.js API Route)');
    console.log('🔗 API Base URL:', this.baseUrl);
    console.log('🔗 Full URL:', `${this.baseUrl}/merchants`);
    
    const token = localStorage.getItem('accessToken');
    return this.request<any>('/merchants', {
      method: 'GET',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  }

  async getMerchant(id: string): Promise<any> {
    console.log('🏢 API: getMerchant called (via Next.js API Route)', { id });
    const token = localStorage.getItem('accessToken');
    return this.request<any>(`/merchants/${id}`, {
      method: 'GET',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  }

  async createMerchant(merchantData: any): Promise<any> {
    console.log('➕ API: createMerchant called (via Next.js API Route)');
    const token = localStorage.getItem('accessToken');
    return this.request<any>('/merchants', {
      method: 'POST',
      body: JSON.stringify(merchantData),
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  }

  async updateMerchant(id: string, merchantData: any): Promise<any> {
    console.log('✏️ API: updateMerchant called (via Next.js API Route)', { id });
    const token = localStorage.getItem('accessToken');
    return this.request<any>(`/merchants/${id}`, {
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

  async updateMerchantStatus(id: string, status: string): Promise<any> {
    console.log('🔄 API: updateMerchantStatus called (via Next.js API Route)', { id, status });
    const token = localStorage.getItem('accessToken');
    return this.request<any>(`/merchants/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  }
}

export const apiClient = new ApiClient();