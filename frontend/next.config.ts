import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['via.placeholder.com', 'solana.com', 'arweave.net'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Add proxy for API calls to avoid CORS issues
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // Add default value if environment variable is not set
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/:path*`,
      },
    ];
  },
};

export default nextConfig;