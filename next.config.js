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
  // Incluir archivos AFM de PDFKit en el bundle
  experimental: {
    serverExternalPackages: ['pdfkit', 'fontkit'],
    outputFileTracingIncludes: {
      // Incluir archivos AFM de PDFKit para que estén disponibles en runtime
      'app/api/order/pdf/route': [
        './node_modules/pdfkit/js/data/*',           // incluye todos los AFM
      ],
    },
  },
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push({ canvas: 'commonjs canvas' });
    return config;
  },
};

module.exports = nextConfig;
