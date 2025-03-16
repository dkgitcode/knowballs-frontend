import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // DISABLE TYPESCRIPT CHECKING DURING BUILD 🚫
  typescript: {
    // ⚠️ IGNORING TYPE CHECKING DURING BUILD
    ignoreBuildErrors: true,
  },
  
  // DISABLE ESLINT DURING BUILD 🔇
  eslint: {
    // ⚠️ IGNORING ESLINT ERRORS DURING BUILD
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
