import { NextResponse } from "next/server";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || "";
  const prismaUrl = process.env.PRISMA_DATABASE_URL || "";
  const pgUrl = process.env.POSTGRES_URL || "";

  return NextResponse.json({
    hasDbUrl: !!dbUrl,
    dbUrlPrefix: dbUrl.substring(0, dbUrl.indexOf("://") + 3),
    hasPrismaUrl: !!prismaUrl,
    prismaUrlPrefix: prismaUrl.substring(0, prismaUrl.indexOf("://") + 3),
    hasPgUrl: !!pgUrl,
    pgUrlPrefix: pgUrl.substring(0, pgUrl.indexOf("://") + 3),
    nodeEnv: process.env.NODE_ENV,
  });
}
