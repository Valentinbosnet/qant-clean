/** @type {import('next').NextConfig} */
const nextConfig = {
  // Désactiver les optimisations qui peuvent causer des problèmes
  reactStrictMode: false,
  swcMinify: false,
  
  // Ignorer les erreurs de lint et TypeScript pendant le build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Configuration des images
  images: {
    unoptimized: true,
  },
  
  // Configuration webpack simplifiée et robuste
  webpack: (config, { isServer }) => {
    // Polyfills pour le navigateur (côté client uniquement)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
        child_process: false,
      };
    }
    
    // Ignorer les avertissements problématiques
    config.ignoreWarnings = [
      { message: /Critical dependency/ },
      { message: /Failed to parse source map/ },
      { message: /Can't resolve '(fs|path|os)'/ },
    ];
    
    return config;
  },
  
  // Désactiver les optimisations expérimentales
  experimental: {
    serverActions: false,
    serverComponents: true,
    appDir: true,
  },
  
  // Augmenter les limites de taille des assets
  compiler: {
    styledComponents: true,
  },
  
  // Désactiver la compression pour le débogage
  compress: false,
};

export default nextConfig;
