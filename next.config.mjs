/** @type {import('next').NextConfig} */
const nextConfig = {
  // Désactiver toutes les optimisations
  reactStrictMode: false,
  swcMinify: false,
  
  // Ignorer toutes les erreurs pendant le build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  
  // Désactiver la compression
  compress: false,
  
  // Configuration webpack minimale
  webpack: (config) => {
    // Désactiver toute optimisation webpack
    config.optimization = {
      ...config.optimization,
      minimize: false,
      minimizer: [],
      splitChunks: false,
    };
    
    // Polyfills pour le navigateur
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve?.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        net: false,
        tls: false,
        child_process: false,
        dns: false,
        module: false,
      },
    };
    
    return config;
  },
  
  // Désactiver les fonctionnalités expérimentales
  experimental: {
    serverActions: false,
    serverComponents: false,
    appDir: true,
  },
};

export default nextConfig;
