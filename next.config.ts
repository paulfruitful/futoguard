import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // ← This ignores ALL TypeScript errors during build
  },
};

export default nextConfig;