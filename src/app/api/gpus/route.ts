import { NextResponse } from "next/server";
import { getGpus } from "@/lib/gpuDatabase";

export async function GET() {
  try {
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
