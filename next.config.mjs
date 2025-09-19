export default {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false }, // si falla por types y necesitas desplegar YA, cambia a true temporalmente
  experimental: { typedRoutes: true },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.supabase.in" },
      { protocol: "https", hostname: "images.unsplash.com" }
    ]
  },
  headers: async () => ([
    { source: '/_next/static/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    { source: '/_next/image', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
  ]),
  webpack: (config, { isServer }) => {
    // Excluir `pdfkit` del empaquetado del lado del servidor
    if (isServer) {
      if (!config.externals) {
        config.externals = [];
      }
      config.externals.push('pdfkit');
    }
    return config;
  }
};
