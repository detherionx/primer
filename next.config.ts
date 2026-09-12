import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["yaml"],
  agentRules: false,
  // Preview and local clients may hit 127.0.0.1 while the server logs localhost.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
