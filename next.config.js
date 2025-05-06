/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration ultra-minimale sans personnalisation
  reactStrictMode: true,
  swcMinify: false,

  // Désactiver l'app directory
  experimental: {
    appDir: false,
  },

  // Ignorer les erreurs
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
