import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["yaml"],
  agentRules: false,
};

export default nextConfig;
