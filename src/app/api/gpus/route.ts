import { NextResponse } from "next/server";
import { getGpus, refreshGpuDatabase } from "@/lib/gpuDatabase";
import { prisma } from "@/lib/prisma";

const APPLE_GPUS = [
  { name: "Apple M1 (7 GPU cores)", vramGb: 7, vendor: "Apple" },
  { name: "Apple M1 (8 GPU cores)", vramGb: 8, vendor: "Apple" },
  { name: "Apple M1 Pro (14 GPU cores)", vramGb: 14, vendor: "Apple" },
  { name: "Apple M1 Max (32 GPU cores)", vramGb: 32, vendor: "Apple" },
  { name: "Apple M2 (8 GPU cores)", vramGb: 8, vendor: "Apple" },
  { name: "Apple M2 Pro (19 GPU cores)", vramGb: 19, vendor: "Apple" },
  { name: "Apple M2 Max (38 GPU cores)", vramGb: 38, vendor: "Apple" },
  { name: "Apple M3 (10 GPU cores)", vramGb: 10, vendor: "Apple" },
  { name: "Apple M3 Pro (18 GPU cores)", vramGb: 18, vendor: "Apple" },
  { name: "Apple M3 Max (40 GPU cores)", vramGb: 40, vendor: "Apple" },
  { name: "Apple M4 (10 GPU cores)", vramGb: 10, vendor: "Apple" },
  { name: "Apple M4 Pro (20 GPU cores)", vramGb: 20, vendor: "Apple" },
  { name: "Apple M4 Max (40 GPU cores)", vramGb: 40, vendor: "Apple" },
];

async function seedAppleGpus() {
  for (const gpu of APPLE_GPUS) {
    await prisma.gpu.upsert({
      where: { name: gpu.name },
      update: { vramGb: gpu.vramGb, vendor: gpu.vendor },
      create: { name: gpu.name, vramGb: gpu.vramGb, vendor: gpu.vendor },
    });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const force = url.searchParams.get("refresh") === "1";

    if (force) {
      await refreshGpuDatabase();
    }

    await seedAppleGpus();

    const gpus = await getGpus();

    return NextResponse.json({ gpus });
  } catch (err) {
    console.error("/api/gpus error:", err);
    return NextResponse.json(
      { error: "Не удалось загрузить список GPU" },
      { status: 500 }
    );
  }
}
