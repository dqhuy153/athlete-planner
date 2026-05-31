const createNextIntlPlugin = require('next-intl/plugin')
const withPWA = require('@ducanh2912/next-pwa').default

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@athlete-planner/ui', '@athlete-planner/contracts'],
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
}

const withPWAConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',

  // SỬA TẠI ĐÂY: Tắt tính năng cache dồn dập gây deadlock trên iOS Safari
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,

  reloadOnOnline: false,
  workboxOptions: {
    runtimeCaching: [
      {
        // API routes — network first, fall back to cache
        urlPattern: /^https?:\/\/.*\/api\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 }, // 1 hour
          networkTimeoutSeconds: 10,
        },
      },
      {
        // Media assets (GIFs, images) from any CDN — cache first
        urlPattern: /\.(gif|png|jpg|jpeg|svg|webp)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'media-cache',
          expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }, // 30 days
        },
      },
    ],
  },
})

module.exports = withPWAConfig(withNextIntl(nextConfig))
