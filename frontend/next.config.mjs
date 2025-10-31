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
  
  // 本番環境での最適化設定
  ...(process.env.NODE_ENV === 'production' && {
    // 本番環境でのパフォーマンス最適化
    compress: true,
    poweredByHeader: false,
    
    // セキュリティヘッダー
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
              key: 'Referrer-Policy',
              value: 'origin-when-cross-origin',
            },
            {
              key: 'Content-Security-Policy',
              value: [
                "default-src 'self'",
                "script-src 'self'",
                "style-src 'self' https://fonts.googleapis.com",
                "font-src 'self' https://fonts.gstatic.com",
                "img-src 'self' data: blob:",
                "connect-src 'self'",
                "object-src 'none'",
                "frame-ancestors 'none'",
              ].join('; '),
            },
            {
              key: 'Permissions-Policy',
              value: 'camera=(), microphone=(), geolocation=()',
            },
          ],
        },
      ];
    },
  }),
};

export default nextConfig;