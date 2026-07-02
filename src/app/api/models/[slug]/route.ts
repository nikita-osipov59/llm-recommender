import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const model = await prisma.model.findUnique({
      where: { slug },
    });

    if (!model) {
      return NextResponse.json(
        { error: "Модель не найдена" },
        { status: 404 }
      );
    }

    return NextResponse.json({ model });
  } catch (err) {
    console.error("/api/models/[slug] error:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
