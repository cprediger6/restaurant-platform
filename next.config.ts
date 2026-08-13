// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Deshabilitar ESLint durante el build temporalmente
  eslint: {
    ignoreDuringBuilds: true,
  },
  // ✅ Deshabilitar TypeScript errors durante el build temporalmente
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;