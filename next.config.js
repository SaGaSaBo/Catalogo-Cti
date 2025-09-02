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
};

module.exports = nextConfig;