/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Suppress warnings
  webpack: (config) => {
    config.ignoreWarnings = [
      { message: /Critical dependency: the request of a dependency is an expression/ },
      { message: /The 'punycode' module is deprecated/ },
    ];
    
    // Polyfills for browser
    if (!config.resolve) {
      config.resolve = {};
    }
    if (!config.resolve.fallback) {
      config.resolve.fallback = {};
    }
    
    Object.assign(config.resolve.fallback, {
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    });
    
    return config;
  },
};

export default nextConfig;
