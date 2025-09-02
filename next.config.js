/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { 
    unoptimized: true,
    domains: ['localhost', 'vercel.app'],
  },
  serverExternalPackages: ['@react-pdf/renderer'],
  output: 'standalone',
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  outputFileTracingRoot: '/Users/santiagosaralegui/Downloads/Catalogo CTI - project 10',
  // Configuración específica para Vercel
  async rewrites() {
    return [
      {
        source: '/admin',
        destination: '/admin',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;