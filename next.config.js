/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    domains: [],
  },
  // Disable ignoreBuildErrors to enforce TypeScript type checking
  typescript: {
    // Comment out ignoreBuildErrors to enforce TypeScript type checking
    // ignoreBuildErrors: true,
  },
  // Ignore errors related to useSearchParams and Suspense boundaries
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Output mode for deployment
  output: 'standalone',
};

module.exports = nextConfig;