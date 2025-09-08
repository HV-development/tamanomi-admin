// 認証関連の型定義
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: string[];
  lastLoginAt?: string;
}

export type UserRole = 'operation' | 'facility' | 'care_manager';

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: string;
}

// API レスポンス用の型
export interface LoginResponse {
  user: AuthUser;
  token: string;
  expiresAt: string;
}

export interface PasswordResetResponse {
  message: string;
  success: boolean;
}

// フォーム用の型定義（バリデーションで使用される型と対応）
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RequestPasswordResetFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}
