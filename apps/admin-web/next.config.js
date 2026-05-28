/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  experimental: {
    optimizePackageImports: ['@monorepo-template/ui', '@monorepo-template/contracts'],
  },
};
module.exports = nextConfig;
