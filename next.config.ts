// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Deshabilitar ESLint durante el build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // ✅ Deshabilitar TypeScript errors durante el build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;