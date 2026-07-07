import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const slugs = request.nextUrl.searchParams.get("slugs");
    if (!slugs) {
      return NextResponse.json({ models: [] });
    }
    const slugList = slugs.split(",").filter(Boolean);
    const models = await prisma.model.findMany({
      where: { slug: { in: slugList } },
    });
    return NextResponse.json({ models });
  } catch (err) {
    console.error("/api/models error:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
