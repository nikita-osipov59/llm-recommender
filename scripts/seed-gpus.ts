import "dotenv/config";

const __dbUrl = process.env.DATABASE_URL || "";

import { PrismaClient } from "../src/generated/prisma/client";

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

const CSV_URL =
  "https://raw.githubusercontent.com/RonnyMuthomi/GPUs-Specs/main/gpu_1986-2026.csv";

const dbUrl = process.env.DATABASE_URL || "";
const isSqlite = dbUrl.startsWith("file:") || dbUrl.startsWith("libsql:");

async function createDatabaseClient() {
  if (isSqlite) {
    const { PrismaLibSql } = await import("@prisma/adapter-libsql");
    const adapter = new PrismaLibSql({ url: dbUrl });
    return new PrismaClient({ adapter });
  }
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const pg = await import("pg");
  const pool = new pg.default.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

async function main() {
  const prisma = await createDatabaseClient();

  for (const gpu of APPLE_GPUS) {
    await prisma.gpu.upsert({
      where: { name: gpu.name },
      update: { vramGb: gpu.vramGb, vendor: gpu.vendor },
      create: { name: gpu.name, vramGb: gpu.vramGb, vendor: gpu.vendor },
    });
  }
  console.log(`Seeded ${APPLE_GPUS.length} Apple GPUs`);

  try {
    const res = await fetch(CSV_URL, {
      headers: { "User-Agent": "llm-recommender/1.0" },
      signal: AbortSignal.timeout(20000),
    });

    if (res.ok) {
      const text = await res.text();
      const lines = text.split("\n").filter(Boolean);
      if (lines.length >= 2) {
        const header = parseCsvLine(lines[0]);
        const nameIdx = header.findIndex(
          (h) =>
            h.toLowerCase().includes("name") || h.toLowerCase().includes("product")
        );
        const memoryIdx = header.findIndex(
          (h) =>
            h.toLowerCase().includes("memory") &&
            (h.toLowerCase().includes("size") || h.toLowerCase().includes("mb"))
        );
        const brandIdx = header.findIndex(
          (h) =>
            h.toLowerCase() === "brand" ||
            h.toLowerCase().includes("vendor") ||
            h.toLowerCase().includes("manufacturer")
        );
        const yearIdx = header.findIndex(
          (h) =>
            h.toLowerCase().includes("year") ||
            h.toLowerCase().includes("date") ||
            h.toLowerCase().includes("released")
        );

        if (nameIdx !== -1 && memoryIdx !== -1) {
          let count = 0;
          const seen = new Set<string>();

          for (let i = 1; i < lines.length; i++) {
            const cols = parseCsvLine(lines[i]);
            const name = cols[nameIdx]?.trim();
            if (!name || name === "-" || name === "N/A") continue;

            const vramGb = parseMemoryGb(cols[memoryIdx] || "");
            if (vramGb === 0 || vramGb < 4) continue;

            if (yearIdx !== -1) {
              const yearStr = cols[yearIdx]?.trim() || "";
              const yearMatch = yearStr.match(/(\d{4})/);
              const year = yearMatch ? parseInt(yearMatch[1]) : NaN;
              if (!Number.isNaN(year) && year < 2020) continue;
            }

            const vendor =
              brandIdx !== -1
                ? normalizeVendor(cols[brandIdx]?.trim() || "Unknown")
                : "Unknown";
            const key = `${vendor} ${name}`;
            if (seen.has(key)) continue;
            seen.add(key);

            await prisma.gpu.upsert({
              where: { name },
              update: { vramGb, vendor },
              create: { name, vramGb, vendor },
            });
            count++;
          }

          console.log(`Seeded ${count} GPUs from CSV`);
        }
      }
    }
  } catch (e) {
    console.warn("CSV fetch failed (GPUs from CSV not available):", e instanceof Error ? e.message : e);
  }

  await prisma.$disconnect();
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

function parseMemoryGb(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  if (Number.isNaN(num)) return 0;
  if (raw.toUpperCase().includes("MB") || num > 100) {
    return Math.round((num / 1024) * 10) / 10;
  }
  return Math.round(num * 10) / 10;
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

main().catch((e) => {
  console.error("Seed failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
