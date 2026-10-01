import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles builds automatically — no standalone output needed.
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
