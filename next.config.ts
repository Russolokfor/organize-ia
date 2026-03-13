import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'date-fns', 'framer-motion'],
  },
  serverExternalPackages: ['pdf-parse', 'canvas', '@napi-rs/canvas'],
};

export default nextConfig;
