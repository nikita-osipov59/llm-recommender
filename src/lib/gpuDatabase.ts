import { prisma } from "./prisma";

export interface GpuEntry {
  name: string;
  vramGb: number;
  vendor: string;
}

export async function getGpus(): Promise<GpuEntry[]> {
  return prisma.gpu.findMany({ orderBy: [{ vendor: "asc" }, { vramGb: "desc" }] });
}
