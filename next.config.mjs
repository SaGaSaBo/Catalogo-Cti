/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // evita imports accidentales de server en cliente (Next 15 ayuda con esto)
    typedRoutes: true
  },
  eslint: {
    // seguimos chequeando en dev; en build ya lo desactivamos arriba con --no-lint
    ignoreDuringBuilds: true
  },
  typescript: {
    // si el build sigue bloqueado por types, pon temporalmente true y vuelve a false cuando pase
    ignoreBuildErrors: false
  },
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

export default nextConfig;
