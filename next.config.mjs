/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Désactiver les avertissements de dépréciation
  webpack: (config, { isServer }) => {
    // Ignorer les avertissements de dépréciation de punycode
    config.ignoreWarnings = [
      { module: /node_modules\/punycode/ },
      { message: /Critical dependency: the request of a dependency is an expression/ },
      { message: /The 'punycode' module is deprecated/ },
      { message: /The `util._extend` API is deprecated/ },
    ]
    
    return config
  },
}

export default nextConfig
