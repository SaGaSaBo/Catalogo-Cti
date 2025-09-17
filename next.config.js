/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.supabase.in' },
    ],
  },
  headers: async () => ([
    { source: '/_next/static/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    { source: '/_next/image', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
  ]),
};

// Wrapper para asegurar que `nextConfig` se exporte correctamente
const withCustomWebpack = (config) => {
  // Clonar para evitar mutaciones directas
  const nextConfig = { ...config };

  // Asegurar que `webpack` sea una función
  const originalWebpack = nextConfig.webpack;
  nextConfig.webpack = (webpackConfig, options) => {
    // Llamar al webpack original si existe
    const newConfig = originalWebpack ? originalWebpack(webpackConfig, options) : webpackConfig;

    // Excluir `pdfkit` del empaquetado del lado del servidor
    if (options.isServer) {
      if (!newConfig.externals) {
        newConfig.externals = [];
      }
      newConfig.externals.push('pdfkit');
    }

    // Devolver la configuración modificada
    return newConfig;
  };

  return nextConfig;
};

module.exports = withCustomWebpack(nextConfig);
