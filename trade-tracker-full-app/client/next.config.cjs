const { withContentlayer } = require("next-contentlayer2");

import("./env.mjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
  // Improve static generation handling
  output: 'standalone',
  typescript: {
    // Dangerously allow production builds to successfully complete even if your project has type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if your project has ESLint errors
    ignoreDuringBuilds: true,
  },
  // Add fallback for content pages
  async redirects() {
    return [
      {
        source: '/blog/:path*',
        destination: '/',
        permanent: false,
      },
      {
        source: '/docs/:path*',
        destination: '/',
        permanent: false,
      },
      {
        source: '/guides/:path*',
        destination: '/',
        permanent: false,
      },
    ]
  }
};

module.exports = withContentlayer(nextConfig);
