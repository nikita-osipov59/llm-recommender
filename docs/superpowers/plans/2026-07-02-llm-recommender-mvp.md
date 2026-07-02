# LLM Recommender MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Веб-приложение для подбора локальных LLM под характеристики железа пользователя (MVP).

**Architecture:** Next.js 15 App Router (`src/`), SQLite через Prisma ORM, данные моделей через HuggingFace Hub API с кешированием в БД.

**Tech Stack:** Next.js 15, TypeScript, Prisma, SQLite, Tailwind CSS, HuggingFace Hub API

## Global Constraints
- Язык интерфейса: русский
- Без регистрации/авторизации
- MVP без тестов (TDD вводится со следующей итерации)
- VRAM для моделей — хардкод-маппинг (HuggingFace не отдаёт VRAM)

---

## File Structure

```
llm-recommender/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── api/
│   │       ├── recommend/
│   │       │   └── route.ts
│   │       └── models/
│   │           └── [slug]/
│   │               └── route.ts
│   ├── components/
│   │   ├── HardwareForm.tsx
│   │   ├── ResultsList.tsx
│   │   └── ModelCard.tsx
│   └── lib/
│       ├── prisma.ts
│       ├── huggingface.ts
│       └── modelVramMap.ts
```

---

### Task 1: Project Scaffolding + Prisma Setup

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`

**Interfaces:**
- Produces: Project skeleton with Next.js 15, TypeScript, Prisma + SQLite

- [ ] **Step 1: Init Next.js project**

```bash
cd C:\Users\Никита\llm-recommender
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack --use-npm
```

Expected: Scaffolding complete with `src/`, `package.json`, `tsconfig.json`, `next.config.ts`.

- [ ] **Step 2: Install Prisma**

```bash
npm install @prisma/client
npm install -D prisma
npx prisma init --datasource-provider sqlite
```

Expected: `prisma/schema.prisma` created, `.env` with `DATABASE_URL`.

- [ ] **Step 3: Write Prisma schema**

Write to `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Model {
  id          Int      @id @default(autoincrement())
  slug        String   @unique
  name        String
  provider    String
  description String?
  parameters  Float
  vramQ4      Float?
  vramQ8      Float?
  ramMin      Float?
  cpuRec      String?
  hfUrl       String?
  downloads   Int      @default(0)
  tags        String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

- [ ] **Step 4: Run Prisma migration**

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Expected: SQLite DB created, Prisma client generated.

- [ ] **Step 5: Write Prisma client singleton**

Write to `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 6: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Next.js 15 with Prisma + SQLite"
```

---

### Task 2: VRAM Map + HuggingFace API Client

**Files:**
- Create: `src/lib/modelVramMap.ts`
- Create: `src/lib/huggingface.ts`

**Interfaces:**
- Produces: `getModelsFromHF()` → `Array<{ slug, name, provider, parameters, downloads }>`, `getVramForModel(name)` → `{ vramQ4, vramQ8, ramMin } | null`

- [ ] **Step 1: Write VRAM map**

Write to `src/lib/modelVramMap.ts`:

```typescript
export interface VramInfo {
  vramQ4: number;
  vramQ8: number;
  ramMin: number;
}

const vramMap: Record<string, VramInfo> = {
  "Llama 3.1 8B": { vramQ4: 5, vramQ8: 9, ramMin: 8 },
  "Llama 3.1 70B": { vramQ4: 40, vramQ8: 75, ramMin: 48 },
  "Llama 3.2 1B": { vramQ4: 0.8, vramQ8: 1.5, ramMin: 4 },
  "Llama 3.2 3B": { vramQ4: 2, vramQ8: 4, ramMin: 4 },
  "Mistral 7B": { vramQ4: 4.5, vramQ8: 8, ramMin: 8 },
  "Mistral Nemo 12B": { vramQ4: 7, vramQ8: 13, ramMin: 16 },
  "Mixtral 8x7B": { vramQ4: 25, vramQ8: 48, ramMin: 32 },
  "Qwen 2.5 7B": { vramQ4: 4.5, vramQ8: 8, ramMin: 8 },
  "Qwen 2.5 14B": { vramQ4: 8.5, vramQ8: 16, ramMin: 16 },
  "Qwen 2.5 32B": { vramQ4: 19, vramQ8: 35, ramMin: 32 },
  "Qwen 2.5 72B": { vramQ4: 42, vramQ8: 78, ramMin: 48 },
  "Qwen 2.5 Coder 7B": { vramQ4: 4.5, vramQ8: 8, ramMin: 8 },
  "Qwen 2.5 Coder 14B": { vramQ4: 8.5, vramQ8: 16, ramMin: 16 },
  "DeepSeek-Coder-V2-Lite 16B": { vramQ4: 9, vramQ8: 17, ramMin: 16 },
  "DeepSeek-V2-Lite 16B": { vramQ4: 9, vramQ8: 17, ramMin: 16 },
  "DeepSeek-R1-Distill-Qwen-7B": { vramQ4: 4.5, vramQ8: 8, ramMin: 8 },
  "DeepSeek-R1-Distill-Qwen-14B": { vramQ4: 8.5, vramQ8: 16, ramMin: 16 },
  "CodeLlama 7B": { vramQ4: 4.5, vramQ8: 8, ramMin: 8 },
  "CodeLlama 13B": { vramQ4: 7.5, vramQ8: 14, ramMin: 16 },
  "CodeLlama 34B": { vramQ4: 19, vramQ8: 36, ramMin: 32 },
  "Phi-3 Mini 3.8B": { vramQ4: 2.5, vramQ8: 4.5, ramMin: 4 },
  "Phi-3 Medium 14B": { vramQ4: 8.5, vramQ8: 16, ramMin: 16 },
  "Gemma 2 2B": { vramQ4: 1.5, vramQ8: 3, ramMin: 4 },
  "Gemma 2 9B": { vramQ4: 5.5, vramQ8: 10, ramMin: 8 },
  "Gemma 2 27B": { vramQ4: 16, vramQ8: 30, ramMin: 32 },
  "Falcon 7B": { vramQ4: 4.5, vramQ8: 8, ramMin: 8 },
  "Falcon 40B": { vramQ4: 23, vramQ8: 43, ramMin: 48 },
  "StableLM 2 1.6B": { vramQ4: 1.2, vramQ8: 2.2, ramMin: 4 },
  "StableLM 2 12B": { vramQ4: 7, vramQ8: 13, ramMin: 16 },
  "Yi 6B": { vramQ4: 4, vramQ8: 7.5, ramMin: 8 },
  "Yi 34B": { vramQ4: 19, vramQ8: 36, ramMin: 32 },
  "Solar 10.7B": { vramQ4: 6.5, vramQ8: 12, ramMin: 16 },
};

export function getVramForModel(slug: string): VramInfo | null {
  for (const [name, info] of Object.entries(vramMap)) {
    if (slug.includes(name.toLowerCase().replace(/\s+/g, "-")) || slug.includes(name.toLowerCase().replace(/\s+/g, ""))) {
      return info;
    }
  }
  return null;
}

export function getVramForExactName(name: string): VramInfo | null {
  return vramMap[name] ?? null;
}

export const knownModelNames = Object.keys(vramMap);
```

- [ ] **Step 2: Write HuggingFace API client**

Write to `src/lib/huggingface.ts`:

```typescript
export interface HFModelResult {
  slug: string;
  name: string;
  provider: string;
  parameters: number;
  downloads: number;
  hfUrl: string;
  description: string;
}

const HF_API = "https://huggingface.co/api/models";

export async function getModelsFromHF(): Promise<HFModelResult[]> {
  const url = `${HF_API}?search=llm+text-generation&sort=downloads&direction=-1&limit=100`;

  const res = await fetch(url, {
    headers: { "User-Agent": "llm-recommender/1.0" },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`HuggingFace API error: ${res.status}`);
  }

  const data = (await res.json()) as any[];

  return data.map((model) => {
    const cardData = model.cardData || {};
    const modelIndex = cardData["model-index"] || [];
    let parameters = 0;
    if (modelIndex[0]?.results?.[0]?.metrics?.parameters) {
      const raw = modelIndex[0].results[0].metrics.parameters;
      parameters = parseFloat(raw);
    }
    if (!parameters && model.pipeline_tag === "text-generation" && model.siblings) {
      const safetensors = model.siblings.filter(
        (s: any) => s.rfilename.endsWith(".safetensors")
      );
      if (safetensors.length > 0) {
        const totalBytes = safetensors.reduce((sum: number, s: any) => sum + (s.size || 0), 0);
        parameters = Math.round(totalBytes / (2 * 1024 * 1024 * 1024) * 10) / 10;
      }
    }

    const name = model.id.split("/").pop() || model.id;
    const provider = model.id.split("/")[0] || "unknown";
    const slug = model.id.replace(/\//g, "--");

    return {
      slug,
      name,
      provider,
      parameters: parameters || 0,
      downloads: model.downloads || 0,
      hfUrl: `https://huggingface.co/${model.id}`,
      description: cardData?.description || "",
    };
  }).filter((m) => m.parameters > 0);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/modelVramMap.ts src/lib/huggingface.ts
git commit -m "feat: add HF API client and VRAM mapping"
```

---

### Task 3: POST /api/recommend

**Files:**
- Create: `src/app/api/recommend/route.ts`

**Interfaces:**
- Consumes: `getModelsFromHF()`, `prisma`, `getVramForExactName()`, `knownModelNames`
- Produces: `POST /api/recommend` — request body `{ gpu?: string, vram: number, ram: number, cpu?: string }`, response `{ models: [...], cached: boolean }`

- [ ] **Step 1: Write the API route**

Write to `src/app/api/recommend/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getModelsFromHF } from "@/lib/huggingface";
import { getVramForExactName, knownModelNames } from "@/lib/modelVramMap";

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
          const vramInfo = getVramForExactName(hf.name);
          const existing = await prisma.model.findUnique({ where: { slug: hf.slug } });

          const data = {
            name: hf.name,
            provider: hf.provider,
            description: hf.description || null,
            parameters: hf.parameters,
            vramQ4: vramInfo?.vramQ4 ?? null,
            vramQ8: vramInfo?.vramQ8 ?? null,
            ramMin: vramInfo?.ramMin ?? null,
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
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/recommend/route.ts
git commit -m "feat: add POST /api/recommend endpoint"
```

---

### Task 4: HardwareForm Component

**Files:**
- Create: `src/components/HardwareForm.tsx`

**Interfaces:**
- Produces: `<HardwareForm onRecommend: (spec) => void>`

- [ ] **Step 1: Write HardwareForm**

Write to `src/components/HardwareForm.tsx`:

```typescript
"use client";

import { useState, FormEvent } from "react";

interface HardwareSpec {
  gpu: string;
  vram: number;
  ram: number;
  cpu: string;
}

interface Props {
  onRecommend: (spec: HardwareSpec) => void;
  loading: boolean;
}

const GPU_OPTIONS = [
  "NVIDIA GTX 1060 6GB",
  "NVIDIA RTX 3060 12GB",
  "NVIDIA RTX 3070 8GB",
  "NVIDIA RTX 3080 10GB",
  "NVIDIA RTX 3080 Ti 12GB",
  "NVIDIA RTX 3090 24GB",
  "NVIDIA RTX 4060 8GB",
  "NVIDIA RTX 4070 12GB",
  "NVIDIA RTX 4080 16GB",
  "NVIDIA RTX 4090 24GB",
  "NVIDIA RTX 5070 12GB",
  "NVIDIA RTX 5080 16GB",
  "NVIDIA RTX 5090 32GB",
  "AMD RX 6700 XT 12GB",
  "AMD RX 6800 16GB",
  "AMD RX 6900 XT 16GB",
  "AMD RX 7600 8GB",
  "AMD RX 7700 XT 12GB",
  "AMD RX 7800 XT 16GB",
  "AMD RX 7900 GRE 16GB",
  "AMD RX 7900 XT 20GB",
  "AMD RX 7900 XTX 24GB",
  "AMD RX 9070 16GB",
  "AMD RX 9070 XT 16GB",
  "Apple M1 (7 GPU)",
  "Apple M1 (8 GPU)",
  "Apple M1 Pro (14 GPU)",
  "Apple M1 Max (32 GPU)",
  "Apple M2 (8 GPU)",
  "Apple M2 Pro (19 GPU)",
  "Apple M2 Max (38 GPU)",
  "Apple M3 (10 GPU)",
  "Apple M3 Pro (18 GPU)",
  "Apple M3 Max (40 GPU)",
  "Apple M4 (10 GPU)",
  "Apple M4 Pro (20 GPU)",
  "Apple M4 Max (40 GPU)",
];

export default function HardwareForm({ onRecommend, loading }: Props) {
  const [gpu, setGpu] = useState("");
  const [vram, setVram] = useState("");
  const [ram, setRam] = useState("");
  const [cpu, setCpu] = useState("");

  const handleGpuChange = (value: string) => {
    setGpu(value);
    const match = value.match(/(\d+)\s*GB/);
    if (match) {
      setVram(match[1]);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onRecommend({
      gpu,
      vram: Number(vram) || 0,
      ram: Number(ram) || 0,
      cpu,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Видеокарта (GPU)</label>
        <select
          value={gpu}
          onChange={(e) => handleGpuChange(e.target.value)}
          className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="">— выберите GPU —</option>
          {GPU_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          VRAM (ГБ)  <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={vram}
          onChange={(e) => setVram(e.target.value)}
          placeholder="Например: 16"
          className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700"
          required
          min="1"
          step="0.1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          RAM (ГБ)  <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={ram}
          onChange={(e) => setRam(e.target.value)}
          placeholder="Например: 32"
          className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700"
          required
          min="1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Процессор (CPU) — необязательно</label>
        <input
          type="text"
          value={cpu}
          onChange={(e) => setCpu(e.target.value)}
          placeholder="Например: Ryzen 7 9800X3D"
          className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition"
      >
        {loading ? "Поиск..." : "Подобрать модель"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/HardwareForm.tsx
git commit -m "feat: add HardwareForm component"
```

---

### Task 5: ModelCard + ResultsList Components

**Files:**
- Create: `src/components/ModelCard.tsx`
- Create: `src/components/ResultsList.tsx`

**Interfaces:**
- Produces: `<ModelCard model: ModelData>`, `<ResultsList models: ModelData[], loading: boolean, error?: string>`

- [ ] **Step 1: Write ModelCard**

Write to `src/components/ModelCard.tsx`:

```typescript
interface ModelData {
  slug: string;
  name: string;
  provider: string;
  parameters: number;
  vramQ4: number | null;
  vramQ8: number | null;
  ramMin: number | null;
  hfUrl: string | null;
  downloads: number;
  description: string | null;
}

export default function ModelCard({ model }: { model: ModelData }) {
  return (
    <div className="border rounded-lg p-4 dark:border-gray-700 dark:bg-gray-800 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{model.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {model.provider} • {model.parameters}B параметров
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        {model.vramQ4 && (
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded p-2">
            <span className="text-gray-500 dark:text-gray-400">VRAM (Q4)</span>
            <p className="font-medium">{model.vramQ4} ГБ</p>
          </div>
        )}
        {model.vramQ8 && (
          <div className="bg-purple-50 dark:bg-purple-900/30 rounded p-2">
            <span className="text-gray-500 dark:text-gray-400">VRAM (Q8)</span>
            <p className="font-medium">{model.vramQ8} ГБ</p>
          </div>
        )}
        {model.ramMin && (
          <div className="bg-green-50 dark:bg-green-900/30 rounded p-2">
            <span className="text-gray-500 dark:text-gray-400">RAM мин.</span>
            <p className="font-medium">{model.ramMin} ГБ</p>
          </div>
        )}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2">
          <span className="text-gray-500 dark:text-gray-400">Загрузок</span>
          <p className="font-medium">{(model.downloads / 1000).toFixed(0)}K</p>
        </div>
      </div>

      {model.description && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {model.description}
        </p>
      )}

      {model.hfUrl && (
        <a
          href={model.hfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Открыть на HuggingFace →
        </a>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write ResultsList**

Write to `src/components/ResultsList.tsx`:

```typescript
import ModelCard from "./ModelCard";

interface ModelData {
  slug: string;
  name: string;
  provider: string;
  parameters: number;
  vramQ4: number | null;
  vramQ8: number | null;
  ramMin: number | null;
  hfUrl: string | null;
  downloads: number;
  description: string | null;
}

interface Props {
  models: ModelData[];
  loading: boolean;
  error?: string;
}

export default function ResultsList({ models, loading, error }: Props) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-gray-500">Ищем подходящие модели...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>Ошибка: {error}</p>
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">Ничего не найдено</p>
        <p className="text-sm mt-1">Попробуйте увеличить VRAM или RAM</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        Найдено моделей: {models.length}
      </p>
      {models.map((model) => (
        <ModelCard key={model.slug} model={model} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ModelCard.tsx src/components/ResultsList.tsx
git commit -m "feat: add ModelCard and ResultsList components"
```

---

### Task 6: Main Page + Integration

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx` (русский язык, мета-теги)
- Modify: `src/app/globals.css` (если нужно)

- [ ] **Step 1: Write layout**

Write to `src/app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LLM Recommender — подбор локальных моделей",
  description: "Введите характеристики вашего железа и получите список подходящих LLM для локального запуска",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Write main page**

Write to `src/app/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import HardwareForm from "@/components/HardwareForm";
import ResultsList from "@/components/ResultsList";

interface ModelData {
  slug: string;
  name: string;
  provider: string;
  parameters: number;
  vramQ4: number | null;
  vramQ8: number | null;
  ramMin: number | null;
  hfUrl: string | null;
  downloads: number;
  description: string | null;
}

interface HardwareSpec {
  gpu: string;
  vram: number;
  ram: number;
  cpu: string;
}

export default function Home() {
  const [models, setModels] = useState<ModelData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [hasSearched, setHasSearched] = useState(false);

  const handleRecommend = async (spec: HardwareSpec) => {
    setLoading(true);
    setError(undefined);
    setHasSearched(true);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(spec),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Ошибка сервера");
      }

      const data = await res.json();
      setModels(data.models);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">LLM Recommender</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Подберите локальную модель под ваше железо
        </p>
      </header>

      <section className="mb-8">
        <HardwareForm onRecommend={handleRecommend} loading={loading} />
      </section>

      <section>
        {hasSearched && (
          <ResultsList models={models} loading={loading} error={error} />
        )}
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Build and verify**

```bash
npx next build
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx
git commit -m "feat: add main page with form and results integration"
```

---

### Task 7: GET /api/models/[slug]

**Files:**
- Create: `src/app/api/models/[slug]/route.ts`

- [ ] **Step 1: Write the API route**

Write to `src/app/api/models/[slug]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const model = await prisma.model.findUnique({
      where: { slug: params.slug },
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
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/models/[slug]/route.ts
git commit -m "feat: add GET /api/models/[slug] endpoint"
```

---

### Task 8: Final Build Verification

- [ ] **Step 1: Full build check**

```bash
npx next build
```

Expected: Build succeeds, all routes compiled, no TypeScript errors.

- [ ] **Step 2: Start dev server and quick smoke test**

```bash
npx next dev -p 3000
```

Open browser at `http://localhost:3000`, fill form, verify results appear.

- [ ] **Step 3: Commit any final fixes**

```bash
git add .
git commit -m "chore: final MVP adjustments"
```
