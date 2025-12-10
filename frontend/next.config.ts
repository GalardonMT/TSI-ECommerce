import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ignorar errores de linter en build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorar errores de tipo en build
    ignoreBuildErrors: true,
  },
  /* Si tenías otras configuraciones (como images), agrégalas aquí abajo */
};

export default nextConfig;