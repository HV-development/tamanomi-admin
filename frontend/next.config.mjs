/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  // 開発環境でのキャッシュ無効化
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      // ページがメモリに保持される時間（ミリ秒）
      maxInactiveAge: 25 * 1000,
      // 同時に保持されるページ数
      pagesBufferLength: 2,
    },
    // 開発環境でのキャッシュを無効化
    webpack: (config, { dev }) => {
      if (dev) {
        config.cache = false;
        // ファイル監視の設定
        config.watchOptions = {
          poll: 1000,
          aggregateTimeout: 300,
        };
      }
      return config;
    },
  }),
};

export default nextConfig;