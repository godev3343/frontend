// next.config.ts
import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  // TODO: временно отключено. Чтобы вернуть индикатор — удали строку ниже
  // (default = включён) или поставь `devIndicators: { position: 'bottom-right' }`.
  devIndicators: false,
  images: {
    /**
     * R2 public bucket — нужен для next/image, чтобы рендерить фото мест,
     * чек-инов и аватары. Хост из env, чтобы prod-bucket менялся без правок кода.
     * Fallback на dev-хост на случай если env не передан (например в CI без .env).
     */
    remotePatterns: [
      {
        protocol: 'https',
        hostname:
          process.env.NEXT_PUBLIC_R2_PUBLIC_HOST ??
          'pub-68fe7e0e2a6347458fe9d9766dd42f9a.r2.dev',
        pathname: '/**',
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: 'go-realitymap',
  project: 'javascript-nextjs',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',
  disableLogger: true,
});