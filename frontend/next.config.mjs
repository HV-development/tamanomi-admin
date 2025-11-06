/** @type {import('next').NextConfig} */
const nextConfig = {
  // 管理画面は動的レンダリングが適切（認証・データベース依存）
  output: 'standalone',
  // Next.js 15で移動
  serverExternalPackages: ['@prisma/client'],
  
  // 動的レンダリング用の設定
  trailingSlash: false,
  
  // 静的生成を完全に無効化（ローカルビルドエラー回避）
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  
  // 静的ページ生成を無効化
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  
  // 静的エクスポートを無効化（App Routerでエラーページ生成を防ぐ）
  distDir: '.next',
  
  // 静的ページ生成を完全に無効化（/_errorページ生成を防ぐ）
  generateEtags: false,
  
  // 画像最適化の設定
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dev-images.tamanomi.com',
      },
      {
        protocol: 'https',
        hostname: 'images.tamanomi.com',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // 環境変数による設定
  ...(process.env.NODE_ENV === 'development' && {
    // 開発環境でのキャッシュ無効化
    onDemandEntries: {
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
    },
    
    // 開発環境でのWebpack設定
    webpack: (config, { dev }) => {
      if (dev) {
        // 環境変数でキャッシュを制御
        if (process.env.NEXT_CACHE_DISABLED === '1') {
          config.cache = false;
        }
        
        // 環境変数でポーリングを制御
        if (process.env.WATCHPACK_POLLING === 'true') {
          config.watchOptions = {
            poll: 1000,
            aggregateTimeout: 300,
          };
        }
      }
      return config;
    },
  }),
  
  // セキュリティヘッダー（全環境で適用）
  async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'X-DNS-Prefetch-Control',
              value: 'off',
            },
            {
              key: 'Cross-Origin-Opener-Policy',
              value: 'same-origin',
            },
            {
              key: 'Cross-Origin-Resource-Policy',
              value: 'same-origin',
            },
            {
              key: 'Cross-Origin-Embedder-Policy',
              value: 'unsafe-none',
            },
            {
              key: 'Origin-Agent-Cluster',
              value: '?1',
            },
            {
              key: 'X-Permitted-Cross-Domain-Policies',
              value: 'none',
            },
            {
              key: 'Referrer-Policy',
              value: 'origin-when-cross-origin',
            },
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=31536000; includeSubDomains; preload',
            },
            {
              key: 'Content-Security-Policy',
              value: (() => {
                const isDev = process.env.NODE_ENV === 'development';
                const directives = [
                  "default-src 'self'",
                  // 開発環境ではReact Refreshのためにunsafe-evalが必要
                  isDev 
                    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
                    : "script-src 'self' 'unsafe-inline'",
                  "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'",
                  // 開発環境では外部フォントも許可（ブラウザ拡張機能などに対応）
                  isDev
                    ? "font-src 'self' https://fonts.gstatic.com https: data:"
                    : "font-src 'self' https://fonts.gstatic.com",
                  "img-src 'self' data: blob: https://dev-images.tamanomi.com https://images.tamanomi.com",
                  // 開発環境ではlocalhostへの接続も許可
                  isDev
                    ? "connect-src 'self' https://zipcloud.ibsnet.co.jp http://localhost:* ws://localhost:* wss://localhost:*"
                    : "connect-src 'self' https://zipcloud.ibsnet.co.jp",
                  "base-uri 'self'",
                  "form-action 'self'",
                  "object-src 'none'",
                  "frame-ancestors 'none'",
                  "report-uri /api/security/csp-report",
                  "report-to csp-endpoint",
                ];
                return directives.join('; ');
              })(),
            },
            {
              key: 'Reporting-Endpoints',
              value: 'csp-endpoint="/api/security/csp-report"',
            },
            {
              key: 'Permissions-Policy',
              value: 'camera=(), microphone=(), geolocation=(), fullscreen=(), payment=(), usb=(), serial=(), magnetometer=(), gyroscope=(), accelerometer=()',
            },
          ],
        },
      ];
    },
  
  // 本番環境での最適化設定
  ...(process.env.NODE_ENV === 'production' && {
    // 本番環境でのパフォーマンス最適化
    compress: true,
    poweredByHeader: false,
  }),
};

export default nextConfig;