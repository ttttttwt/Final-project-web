import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    unoptimized: process.env.NODE_ENV === "development", // Disable optimization in dev for localhost images
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "http://localhost:8088/uploads/:path*",
      },
      {
        source: "/api/v1/files/:path*",
        destination: "http://localhost:8088/api/v1/files/:path*",
      },
    ];
  },
};

export default nextConfig;
