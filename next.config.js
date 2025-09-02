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
    domains: ['localhost'],
  },
  serverExternalPackages: ['@react-pdf/renderer'],
  output: 'standalone',
};

module.exports = nextConfig;
