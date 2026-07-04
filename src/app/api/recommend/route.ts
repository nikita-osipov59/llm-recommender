import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getModelsFromHF } from "@/lib/huggingface";
import { estimateVram } from "@/lib/vramCalculator";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const vram = Number(body.vram) || 0;
    const ram = Number(body.ram) || 0;
    const gpu = String(body.gpu || "");
    const cpu = String(body.cpu || "");

    if (!vram && !ram) {
      return NextResponse.json(
        { error: "Укажите хотя бы VRAM или RAM" },
        { status: 400 }
      );
    }

    let cached = true;

    let models = await prisma.model.findMany({
      orderBy: { downloads: "desc" },
    });

    const needsRefresh =
      models.length === 0 ||
      models.some((m) => Date.now() - m.updatedAt.getTime() > CACHE_TTL_MS);

    if (needsRefresh) {
      try {
        const hfModels = await getModelsFromHF();

        for (const hf of hfModels) {
          const vramEst = estimateVram(hf.parameters);
          const existing = await prisma.model.findUnique({ where: { slug: hf.slug } });

          const data = {
            name: hf.name,
            provider: hf.provider,
            description: hf.description || null,
            parameters: hf.parameters,
            vramQ4: vramEst.vramQ4,
            vramQ8: vramEst.vramQ8,
            ramMin: vramEst.ramMin,
            cpuRec: null,
            hfUrl: hf.hfUrl,
            downloads: hf.downloads,
            tags: null,
          };

          if (existing) {
            await prisma.model.update({ where: { slug: hf.slug }, data });
          } else {
            await prisma.model.create({ data: { slug: hf.slug, ...data } });
          }
        }

        models = await prisma.model.findMany({
          orderBy: { downloads: "desc" },
        });
        cached = false;
      } catch (hfError) {
        console.error("HF fetch error:", hfError);
      }
    }

    const filtered = models.filter((m) => {
      if (vram > 0 && m.vramQ4 !== null && m.vramQ4 > vram) return false;
      if (ram > 0 && m.ramMin !== null && m.ramMin > ram) return false;
      return true;
    });

    return NextResponse.json({ models: filtered.slice(0, 50), cached });
  } catch (err) {
    console.error("/api/recommend error:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
