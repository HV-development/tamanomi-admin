'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../../lib/api';
import { type AdminLoginInput, type AdminRegisterInput } from '@hv-development/schemas';

type RegisterInput = AdminRegisterInput;

interface User {
  id: string;
  email: string;
  name: string;
  accountType: 'admin' | 'merchant' | 'user' | 'shop';
  shopId?: string; // 店舗アカウントの場合の店舗ID
  merchantId?: string; // 会社アカウントまたは店舗アカウントの場合の会社ID
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: AdminLoginInput) => Promise<void>;
  register: (userData: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType | null => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // 静的生成時やSSR時のエラーを防ぐため、nullを返す
    if (typeof window === 'undefined') {
      return null;
    }
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // 初期化時にトークンをチェック
  useEffect(() => {
    const initAuth = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (accessToken && refreshToken) {
          // トークンが有効かチェック（簡単な検証）
          try {
            await apiClient.refreshToken({ refreshToken });
            // ユーザー情報を取得（実際の実装では、トークンからユーザー情報を取得）
            const userData = localStorage.getItem('userData');
            if (userData) {
              const accountData = JSON.parse(userData);
              console.log('🔍 AuthContext: Loading user data from localStorage', {
                accountType: accountData.accountType,
                shopId: accountData.shopId,
                merchantId: accountData.merchantId,
                email: accountData.email
              });
              setUser({
                id: accountData.email,
                email: accountData.email,
                name: accountData.displayName || accountData.email,
                accountType: accountData.accountType,
                shopId: accountData.shopId,
                merchantId: accountData.merchantId
              });
            }
          } catch (error) {
            console.error('Token validation failed:', error);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userData');
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: AdminLoginInput) => {
    try {
      console.log('🔐 AuthContext: login called', { email: credentials.email });
      const response = await apiClient.login(credentials);
      
      console.log('🔑 AuthContext: Received tokens', { 
        hasAccessToken: !!response.accessToken,
        hasRefreshToken: !!response.refreshToken,
        accessTokenLength: response.accessToken?.length,
        refreshTokenLength: response.refreshToken?.length
      });
      
      // トークンを保存
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('userData', JSON.stringify(response.account));
      
      // 保存を確認
      const savedAccessToken = localStorage.getItem('accessToken');
      const savedRefreshToken = localStorage.getItem('refreshToken');
      console.log('💾 AuthContext: Tokens saved to localStorage', { 
        accessTokenSaved: !!savedAccessToken,
        refreshTokenSaved: !!savedRefreshToken,
        accessTokenMatch: savedAccessToken === response.accessToken,
        refreshTokenMatch: savedRefreshToken === response.refreshToken
      });
      
      const accountData = response.account as { accountType: string; shopId?: string; merchantId?: string };
      console.log('🔍 AuthContext: Received account data from API', {
        accountType: accountData.accountType,
        shopId: accountData.shopId,
        merchantId: accountData.merchantId,
        hasShopId: !!accountData.shopId,
        hasMerchantId: !!accountData.merchantId
      });
      
      setUser({
        id: accountData.email, // 仮のIDとしてemailを使用
        email: accountData.email,
        name: accountData.displayName || accountData.email,
        accountType: accountData.accountType as 'admin' | 'merchant' | 'user' | 'shop',
        shopId: accountData.shopId,
        merchantId: accountData.merchantId
      });
      console.log('✅ AuthContext: login successful', { 
        user: accountData,
        setShopId: accountData.shopId,
        setMerchantId: accountData.merchantId
      });
    } catch (error) {
      console.error('❌ AuthContext: login failed', error);
      throw error;
    }
  };

  const register = async (userData: RegisterInput) => {
    try {
      console.log('📝 AuthContext: register called', { email: userData.email });
      const response = await apiClient.register(userData);
      
      // トークンを保存
      const accountData = response.account as { accountType: string; shopId?: string; merchantId?: string };
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('userData', JSON.stringify(accountData));
      
      setUser({
        id: accountData.email, // 仮のIDとしてemailを使用
        email: accountData.email,
        name: accountData.displayName || accountData.email,
        accountType: accountData.accountType as 'admin' | 'merchant' | 'user' | 'shop',
        shopId: accountData.shopId,
        merchantId: accountData.merchantId
      });
      console.log('✅ AuthContext: register successful', { user: accountData });
    } catch (error) {
      console.error('❌ AuthContext: register failed', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 AuthContext: logout called');
      await apiClient.logout();
    } catch (error) {
      console.error('❌ AuthContext: logout failed', error);
    } finally {
      // ローカルストレージをクリア
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      setUser(null);
      console.log('✅ AuthContext: logout completed');
    }
  };

  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken');
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.refreshToken({ refreshToken: refreshTokenValue });
      
      // 新しいトークンを保存
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      console.log('✅ AuthContext: tokens refreshed');
    } catch (error) {
      console.error('❌ AuthContext: token refresh failed', error);
      // リフレッシュに失敗した場合はログアウト
      await logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};