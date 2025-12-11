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
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@tensorflow/**',
      'node_modules/@swc/core/**',
      '.next/cache/**',
    ],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/microservices/**', '**/python-backend/**', '**/terraform/**', '**/k8s/**'],
    };
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
      };
    }
    
    // Exclude TensorFlow.js from server bundle - it only runs client-side
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('@tensorflow/tfjs', '@tensorflow/tfjs-core', '@tensorflow/tfjs-backend-cpu', '@tensorflow/tfjs-backend-webgl');
      }
    }
    
    return config;
  },
};

module.exports = nextConfig;
