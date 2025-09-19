export default {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false }, // si necesitas desplegar YA puedes poner true temporalmente
  experimental: { typedRoutes: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" }
    ]
  }
};
