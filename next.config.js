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
      // Clave = ruta del archivo de la route, con extensión
      'app/api/order/pdf/route.tsx': ['./app/api/order/pdf/data/*'],

      // (opcionales, "por si acaso"; no molestan)
      'app/api/order/pdf/route.ts': ['./app/api/order/pdf/data/*'],
      'app/api/order/pdf/route': ['./app/api/order/pdf/data/*'],
    },
  },
};

module.exports = nextConfig;