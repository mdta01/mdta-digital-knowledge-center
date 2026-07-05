import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles output automatically. For self-hosted/Docker, you can set `output: "standalone"`.
  // output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow Prisma client to be bundled correctly on serverless platforms
  serverExternalPackages: [
    "@prisma/client",
    "bcryptjs",
    "jsonwebtoken",
    "sharp",
  ],
  // PDF.js worker is served from /public, so we don't need special webpack config
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
