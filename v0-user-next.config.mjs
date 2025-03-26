/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // This ensures paths work correctly when opened directly from the file system
  basePath: '',
  // Disable server components for static export
  experimental: {
    appDir: true,
  },
};

export default nextConfig;

