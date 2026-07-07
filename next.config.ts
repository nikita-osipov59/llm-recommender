import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/adapter-pg", "pg", "@neondatabase/serverless"],
};

export default nextConfig;
