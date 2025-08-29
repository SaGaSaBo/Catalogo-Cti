/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer']
  },
  webpack: (config) => {
    // Deshabilita el cache en disco de webpack para evitar EIO/ENOENT en entornos tipo Bolt
    config.cache = false;
    return config;
  },
};

export default nextConfig;