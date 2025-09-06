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
    // 👇 Next incluirá los .afm copiados por tu postinstall
    outputFileTracingIncludes: {
      'app/api/order/pdf/route': [
        './app/api/order/pdf/data/*',
      ],
    },
  },
};

module.exports = nextConfig;
