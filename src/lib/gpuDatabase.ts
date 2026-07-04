import { prisma } from "./prisma";

const GPU_CSV_URL = "https://raw.githubusercontent.com/RonnyMuthomi/GPUs-Specs/main/gpu_1986-2026.csv";
const MIN_RELEASE_YEAR = 2020;
const MIN_VRAM = 4;

export interface GpuEntry {
  name: string;
  vramGb: number;
  vendor: string;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let inQuotes = false;
  let current = "";
  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function normalizeVendor(raw: string): string {
  const v = raw.toLowerCase();
  if (v.includes("nvidia")) return "NVIDIA";
  if (v.includes("amd") || v.includes("ati") || v.includes("radeon")) return "AMD";
  if (v.includes("intel")) return "Intel";
  if (v.includes("apple")) return "Apple";
  if (v.includes("qualcomm") || v.includes("snapdragon")) return "Qualcomm";
  return raw;
}

async function fetchGpuCsv(): Promise<string> {
  const res = await fetch(GPU_CSV_URL, {
    headers: { "User-Agent": "llm-recommender/1.0" },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`CSV fetch error: ${res.status}`);
  return res.text();
}

function parseGpuCsv(text: string): GpuEntry[] {
  const lines = text.split("\n").filter(Boolean);
  if (lines.length < 2) return [];

  const header = parseCsvLine(lines[0]);
  const nameIdx = header.findIndex((h) => h.toLowerCase().includes("name") || h.toLowerCase().includes("product"));
  const memoryIdx = header.findIndex((h) => h.toLowerCase().includes("memory") && (h.toLowerCase().includes("size") || h.toLowerCase().includes("mb")));
  const brandIdx = header.findIndex((h) => h.toLowerCase() === "brand" || h.toLowerCase().includes("vendor") || h.toLowerCase().includes("manufacturer"));
  const yearIdx = header.findIndex((h) => h.toLowerCase().includes("year") || h.toLowerCase().includes("date") || h.toLowerCase().includes("released"));

  if (nameIdx === -1 || memoryIdx === -1) return [];

  const gpus: GpuEntry[] = [];
  const seen = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);

    const name = cols[nameIdx]?.trim();
    if (!name || name === "-" || name === "N/A") continue;

    let vramMb = parseFloat(cols[memoryIdx]?.replace(/[^0-9.]/g, "") || "0");
    if (vramMb > 10000) vramMb = vramMb / 1024;
    if (Number.isNaN(vramMb) || vramMb < MIN_VRAM) continue;

    if (yearIdx !== -1) {
      const yearStr = cols[yearIdx]?.trim() || "";
      const year = parseInt(yearStr);
      if (!Number.isNaN(year) && year < MIN_RELEASE_YEAR) continue;
    }

    const vendor = brandIdx !== -1 ? normalizeVendor(cols[brandIdx]?.trim() || "Unknown") : "Unknown";
    const vramGb = Math.round(vramMb * 10) / 10;
    const key = `${vendor} ${name}`;
    if (seen.has(key)) continue;
    seen.add(key);

    gpus.push({ name, vramGb, vendor });
  }

  return gpus.sort((a, b) => {
    if (a.vendor !== b.vendor) return a.vendor.localeCompare(b.vendor);
    return b.vramGb - a.vramGb;
  });
}

export async function refreshGpuDatabase(): Promise<GpuEntry[]> {
  const csvText = await fetchGpuCsv();
  const gpus = parseGpuCsv(csvText);

  for (const gpu of gpus) {
    await prisma.gpu.upsert({
      where: { name: gpu.name },
      update: { vramGb: gpu.vramGb, vendor: gpu.vendor },
      create: { name: gpu.name, vramGb: gpu.vramGb, vendor: gpu.vendor },
    });
  }

  return gpus;
}

export async function getGpus(): Promise<GpuEntry[]> {
  const fromDb = await prisma.gpu.findMany({ orderBy: [{ vendor: "asc" }, { vramGb: "desc" }] });

  if (fromDb.length > 0) return fromDb;

  return refreshGpuDatabase();
}
