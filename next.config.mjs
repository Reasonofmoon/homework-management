/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Configure SWC compiler explicitly
  swcMinify: true,
  compiler: {
    // Disable emotion for static export
    emotion: false,
  },
  experimental: {
    // Keep only necessary experimental features
    appDir: true,
  },
  // Add ESLint configuration to ignore errors during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add TypeScript configuration to ignore errors during builds
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
