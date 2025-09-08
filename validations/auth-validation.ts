import { z } from 'zod';

// ログインフォームのバリデーション
export const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスは必須です')
    .email('正しいメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードは必須です'),
});

// パスワードリセット要求フォームのバリデーション
export const requestPasswordResetSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスは必須です')
    .email('正しいメールアドレスを入力してください'),
});

// パスワードリセットフォームのバリデーション
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'パスワードは8文字以上で設定してください')
      .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, '英数字を含むパスワードを入力してください'),
    confirmPassword: z.string().min(1, 'パスワード確認は必須です'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  });
