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
  // Externalizar PDFKit para usar fuentes Helvetica nativas
  experimental: {
    serverExternalPackages: ['pdfkit', 'fontkit'],
  },
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push({ canvas: 'commonjs canvas' });
    return config;
  },
};

module.exports = nextConfig;
