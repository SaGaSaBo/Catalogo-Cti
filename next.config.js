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
  experimental: {
    outputFileTracingIncludes: {
      // 👇 OJO: usa la ruta del archivo con extensión .ts .tsx (según corresponda)
      'app/api/order/pdf/route': [
        './app/api/order/pdf/data/*',
      ],
      'app/api/order/pdf/route.tsx': [
        './app/api/order/pdf/data/*',
      ],
    },
  },
};

module.exports = nextConfig;