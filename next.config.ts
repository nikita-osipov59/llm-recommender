import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg", "@prisma/adapter-pg", "@prisma/adapter-libsql", "@libsql/client"],
};

export default nextConfig;
