/** @type {import('next').NextConfig} */
const nextConfig = {
  // Using 'standalone' output for SSR deployment on AWS Amplify
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Generate a consistent build ID for Amplify
  generateBuildId: async () => {
    return 'amplify-ssr-build';
  },
}

module.exports = nextConfig