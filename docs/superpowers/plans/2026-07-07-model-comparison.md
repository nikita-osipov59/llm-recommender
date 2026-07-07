# Model Comparison Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить сравнение моделей side-by-side на странице результатов

**Architecture:** Все изменения во фронтенде — чекбоксы в `ModelCard`, стейт выбора в `ResultsList`, новая таблица `ComparisonTable`

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/components/ModelCard.tsx` | Modify | Добавить пропсы `selected`/`onToggle`, чекбокс |
| `src/components/ResultsList.tsx` | Modify | Стейт `selectedSlugs`, кнопка "Сравнить (N)", рендер `ComparisonTable` |
| `src/components/ComparisonTable.tsx` | Create | Таблица сравнения моделей |

---

### Task 1: Add selection to ModelCard

**Files:**
- Modify: `src/components/ModelCard.tsx`

**Interfaces:**
- Produces: `ModelCard` now accepts `selected: boolean` and `onToggle: (slug: string) => void`

- [ ] **Step 1: Update the component props and add checkbox**

```typescript
"use client";

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

interface ModelCardProps {
  model: ModelData;
  selected: boolean;
  onToggle: (slug: string) => void;
}

export default function ModelCard({ model, selected, onToggle }: ModelCardProps) {
  return (
    <div className="border rounded-lg p-4 dark:border-gray-700 dark:bg-gray-800 hover:shadow-md transition">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(model.slug)}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <div className="flex-1">
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

- [ ] **Step 2: Commit**

```bash
git add src/components/ModelCard.tsx
git commit -m "feat: add checkbox and selection props to ModelCard"
```

---

### Task 2: Create ComparisonTable component

**Files:**
- Create: `src/components/ComparisonTable.tsx`

**Interfaces:**
- Produces: `<ComparisonTable models={ModelData[]} onClose={() => void} />`

- [ ] **Step 1: Create the component**

```typescript
"use client";

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

interface ComparisonTableProps {
  models: ModelData[];
  onClose: () => void;
}

export default function ComparisonTable({ models, onClose }: ComparisonTableProps) {
  if (models.length < 2) return null;

  return (
    <div className="mt-6 border rounded-lg dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
        <h3 className="font-semibold">Сравнение моделей</h3>
        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Закрыть
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="text-left px-4 py-2 font-medium text-gray-500 dark:text-gray-400 w-36">
                Характеристика
              </th>
              {models.map((m) => (
                <th key={m.slug} className="text-left px-4 py-2 font-semibold min-w-[150px]">
                  {m.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Row label="Провайдер" values={models.map((m) => m.provider)} />
            <Row label="Параметры" values={models.map((m) => `${m.parameters}B`)} />
            <Row label="VRAM (Q4)" values={models.map((m) => m.vramQ4 ? `${m.vramQ4} ГБ` : "—")} />
            <Row label="VRAM (Q8)" values={models.map((m) => m.vramQ8 ? `${m.vramQ8} ГБ` : "—")} />
            <Row label="RAM мин." values={models.map((m) => m.ramMin ? `${m.ramMin} ГБ` : "—")} />
            <Row label="Загрузки" values={models.map((m) => `${(m.downloads / 1000).toFixed(0)}K`)} />
            <Row label="HuggingFace" values={models.map((m) => m.hfUrl ? "Открыть" : "—")} isLink urls={models.map((m) => m.hfUrl)} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ label, values, isLink, urls }: {
  label: string;
  values: string[];
  isLink?: boolean;
  urls?: (string | null)[];
}) {
  return (
    <tr className="border-b dark:border-gray-700 even:bg-gray-50 dark:even:bg-gray-800/50">
      <td className="px-4 py-2 text-gray-500 dark:text-gray-400 font-medium">{label}</td>
      {values.map((val, i) => (
        <td key={i} className="px-4 py-2">
          {isLink && urls?.[i] ? (
            <a href={urls[i]!} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
              {val}
            </a>
          ) : (
            val
          )}
        </td>
      ))}
    </tr>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ComparisonTable.tsx
git commit -m "feat: create ComparisonTable component"
```

---

### Task 3: Wire up selection state in ResultsList

**Files:**
- Modify: `src/components/ResultsList.tsx`

**Interfaces:**
- Consumes: `ModelCard` with `selected`/`onToggle`, `ComparisonTable`
- Produces: Integrated comparison flow

- [ ] **Step 1: Add imports and state, update rendering**

```typescript
"use client";

import { useState } from "react";
import ModelCard from "./ModelCard";
import ComparisonTable from "./ComparisonTable";

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
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);

  const handleToggle = (slug: string) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
    setShowComparison(false);
  };

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
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Найдено моделей: {models.length}
        </p>
        {selectedSlugs.size >= 2 && !showComparison && (
          <button
            onClick={() => setShowComparison(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 px-3 rounded-lg transition"
          >
            Сравнить ({selectedSlugs.size})
          </button>
        )}
      </div>

      {models.map((model) => (
        <ModelCard
          key={model.slug}
          model={model}
          selected={selectedSlugs.has(model.slug)}
          onToggle={handleToggle}
        />
      ))}

      {showComparison && selectedSlugs.size >= 2 && (
        <ComparisonTable
          models={models.filter((m) => selectedSlugs.has(m.slug))}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ResultsList.tsx
git commit -m "feat: wire up model selection and comparison in ResultsList"
```

---

### Task 4: Verify build

- [ ] **Step 1: Full build**

```bash
npx next build
```

Expected: Build passes with no TypeScript errors.

- [ ] **Step 2: Commit any fixes**

```bash
git add .
git commit -m "chore: fix build issues from model comparison"
```
