import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: "./",
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://127.0.0.1:3002/api/v1/:path*' // Proxy to Backend on both Local & VPS
      }
    ]
  }
};

export default nextConfig;
