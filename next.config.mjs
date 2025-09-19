export default {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false }, // si necesito salir del paso, luego puedo poner true temporalmente
  typedRoutes: true, // <-- mover aquí
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" }
    ]
  }
};
