/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Force rebuild - Vercel cache bust
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  // 👇 outputFileTracingIncludes se movió a la raíz en Next.js 15.5.2
  outputFileTracingIncludes: {
    'app/api/order/pdf/route': [
      './app/api/order/pdf/data/*',
    ],
    'app/api/order/pdf/route.tsx': [
      './app/api/order/pdf/data/*',
    ],
  },
};

module.exports = nextConfig;