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
      'node_modules/@swc/**',
      'node_modules/bull/**',
      'node_modules/prisma/**',
      'node_modules/@prisma/**',
      'node_modules/sharp/**',
      'node_modules/canvas/**',
      'node_modules/bcryptjs/**',
      'node_modules/ioredis/**',
      'node_modules/ws/**',
      '.next/cache/**',
      'public/models/**',
      'python-backend/**',
      'microservices/**',
      'terraform/**',
      'k8s/**',
      '__tests__/**',
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
    
    // Exclude heavy dependencies from server bundle
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push(
          '@tensorflow/tfjs',
          '@tensorflow/tfjs-core', 
          '@tensorflow/tfjs-backend-cpu',
          '@tensorflow/tfjs-backend-webgl',
          '@prisma/client',
          'prisma',
          'bull',
          'sharp',
          'canvas'
        );
      }
    }
    
    return config;
  },
};

module.exports = nextConfig;
