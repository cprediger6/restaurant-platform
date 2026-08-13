// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Ignorar errores de ESLint en build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // ✅ Ignorar errores de TypeScript en build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;