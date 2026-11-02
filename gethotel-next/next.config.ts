import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  // Proxy /api requests to local backend during local dev
  async rewrites() {
    return process.env.NODE_ENV === "production"
      ? []
      : [
          {
            source: "/api/:path*",
            destination: "http://localhost:5000/api/:path*",
          },
        ];
  },
};

export default nextConfig;
