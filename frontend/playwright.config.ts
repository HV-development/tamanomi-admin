import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';
import { config } from 'dotenv';

// E2Eテスト用の.envファイルを読み込む
const envPath = path.resolve(__dirname, 'e2e', '.env');
config({ path: envPath });

// 認証状態ファイルのパス
const authFile = '.auth/admin.json';

/**
 * Playwright設定ファイル
 * 
 * テストプロジェクトの分類:
 * 1. setup - 認証セットアップ（パスワード認証を実行してstorageStateを保存）
 * 2. authenticated - storageStateを使用する全テスト（実データ使用）
 * 3. auth-flow - 認証フローのテスト（認証状態を使用しない）
 * 4. error-handling - エラーハンドリングテスト
 * 5. crud-operations - CRUD操作テスト
 * 6. role-permissions - ロール別権限テスト
 * 
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* テストの最大実行時間 */
  timeout: 60 * 1000,
  expect: {
    /* アサーションのタイムアウト */
    timeout: 10000,
  },
  /* テストを並列実行 */
  fullyParallel: true,
  /* CIで失敗したテストを再実行しない */
  forbidOnly: !!process.env.CI,
  /* CIでのみ失敗したテストを再実行 */
  retries: process.env.CI ? 2 : 0,
  /* 並列実行数を設定 */
  workers: process.env.CI ? 2 : 4,
  /* レポーター設定 */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['line'],
  ],
  /* 共有設定 */
  use: {
    /* ベースURL */
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3001',
    /* アクションのタイムアウト */
    actionTimeout: 15 * 1000,
    /* ナビゲーションのタイムアウト */
    navigationTimeout: 30 * 1000,
    /* スクリーンショット設定 */
    screenshot: {
      mode: 'on',
      fullPage: true,
    },
    /* 動画設定 */
    video: {
      mode: 'on',
      size: { width: 1280, height: 720 },
    },
    /* トレース */
    trace: 'on',
  },

  /* プロジェクト設定 */
  projects: [
    // セットアップ: 認証状態を作成（パスワード認証を実行）
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        slowMo: 0,
      },
    },
    // 認証済みテスト: storageStateを使用して認証を再利用（実データ使用）
    {
      name: 'authenticated',
      dependencies: ['setup'],
      testMatch: [
        'merchants.spec.ts',
        'shops.spec.ts',
        'coupons-crud.spec.ts',
        'admins.spec.ts',
        'users.spec.ts',
        'headers.spec.ts',
        'role_based_display.spec.ts',
        'api-requests.spec.ts',
      ],
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile,
        slowMo: 300,
      },
    },
    // 認証フローテスト: シリアル実行
    {
      name: 'auth-flow',
      testMatch: /(login|protection)\.spec\.ts/,
      fullyParallel: false, // 認証フローの競合を避けるためシリアル実行
      use: { 
        ...devices['Desktop Chrome'],
        slowMo: 0,
      },
    },
    // エラーハンドリングテスト: シリアル実行
    {
      name: 'error-handling',
      testMatch: /error-handling\.spec\.ts/,
      fullyParallel: false, // エラー状態のテストはシリアル実行が望ましい
      dependencies: ['setup'],
      use: { 
        ...devices['Desktop Chrome'],
        storageState: authFile,
        slowMo: 300,
      },
    },
    // CRUD操作テスト
    {
      name: 'crud-operations',
      testMatch: /crud-operations\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile,
        slowMo: 300,
      },
    },
    // ロール別権限テスト
    {
      name: 'role-permissions',
      testMatch: /role-permissions\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        slowMo: 0,
      },
    },
  ],

  /* 開発サーバーの設定 */
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'pnpm dev --port 3001',
        url: 'http://localhost:3001',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
        stdout: 'ignore',
        stderr: 'pipe',
      },
});
