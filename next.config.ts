import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration for Next.js 16+
  // Empty config silences the webpack config warning as suggested by Next.js
  turbopack: {},

  // Keep webpack config for backward compatibility when using --webpack flag
  webpack: (config) => {
    config.externals.push('pino-pretty', 'encoding');
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };

    // Ignore specific warnings
    config.ignoreWarnings = [
      { module: /node_modules\/@metamask\/sdk/ },
      { module: /node_modules\/pino/ },
    ];

    return config;
  },
};

export default nextConfig;
