import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/:lang(en|hi|es|fr|de|zh|ja|ar|ru|pt|bn|ta|te|mr|gu|kn|ml|pa|ur)/:path*",
        destination: "/:path*",
      },
      {
        source: "/:lang(en|hi|es|fr|de|zh|ja|ar|ru|pt|bn|ta|te|mr|gu|kn|ml|pa|ur)",
        destination: "/",
      },
    ];
  },
};

export default nextConfig;
