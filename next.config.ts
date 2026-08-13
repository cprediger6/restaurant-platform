// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Permitir cookies en todos los dominios
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Set-Cookie",
            value: "SameSite=Lax; Secure",
          },
        ],
      },
    ];
  },
};

export default nextConfig;