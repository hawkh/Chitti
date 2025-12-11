/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  turbopack: {},
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  webpack: (config, { isServer }) => {
    // Ignore problematic directories
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/microservices/**', '**/python-backend/**', '**/terraform/**', '**/k8s/**'],
    };
    
    // Exclude bull from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
