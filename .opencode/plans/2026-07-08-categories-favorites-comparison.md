# Category Filter, Favorites Page & Improved Comparison — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 3 UX features — category-based model filter, dedicated favorites page, and improved comparison table with best/worst highlighting and tags row.

**Architecture:** All 3 features are frontend-only (no DB schema changes). Favorites page reads localStorage and fetches models via a new JSON endpoint. Category filter replaces the existing tag filter in ResultsList. Comparison table gets per-cell best/worst coloring.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind v4, lucide-react, Vitest

## Global Constraints

- Interface language: Russian
- No auth, no emoji
- Use lucide-react for icons
- Follow existing code patterns (client/server components, Tailwind classes)
- ModelCard keeps existing tag display as-is

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/components/ResultsList.tsx` | Modify | Replace tag filter with 4 category buttons (Чат/Код/Зрение/Рассуждение) |
| `src/app/favorites/page.tsx` | Create | Client page showing user's favorited models |
| `src/app/api/models/route.ts` | Create | `GET /api/models?slugs=a,b,c` returning model JSON |
| `src/components/ComparisonTable.tsx` | Modify | Add tags row, best/worst per-cell highlighting |

---

### Task 1: Category Filter in ResultsList

**Files:**
- Modify: `src/components/ResultsList.tsx`

**Interfaces:**
- Consumes: same `ModelData` interface (unchanged), includes `tags?: string | null`
- Produces: category-filtered model list replacing the old tag filter

- [ ] **Step 1: Replace tag filter state and tags with category constants**

Replace the `tagFilter` state and `allTags` computed value with a `CATEGORY_MAP` and `categoryFilter` state:

```tsx
// Replace these lines (~line 56-57):
//   const [tagFilter, setTagFilter] = useState<string | null>(null);
// With:
const CATEGORY_MAP: Record<string, string> = {
  Чат: "instruct",
  Код: "code",
  Зрение: "vision",
  Рассуждение: "reasoning",
};
const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
```

- [ ] **Step 2: Remove `allTags` useMemo**

Remove the `allTags` useMemo block (~lines 63-69). It is no longer needed since categories are fixed.

- [ ] **Step 3: Update filtered useMemo**

Change the filter logic inside `useMemo`. Replace:
```tsx
//     if (tagFilter) result = result.filter((m) => m.tags?.includes(tagFilter));
// With:
if (categoryFilter) {
  const tag = CATEGORY_MAP[categoryFilter];
  result = result.filter((m) => m.tags?.includes(tag));
}
```

Also update the dependency array: replace `tagFilter` with `categoryFilter`.

- [ ] **Step 4: Update selectTag and references**

Rename `selectTag` to `selectCategory`. Remove the `selectFavorites`
function — we keep the Bookmark button but integrate it differently.

```tsx
function selectCategory(cat: string | null) {
  setCategoryFilter(cat);
  setShowFavorites(false);
  setDisplayCount(PAGE_SIZE);
}

function selectFavorites() {
  setShowFavorites(true);
  setCategoryFilter(null);
  setDisplayCount(PAGE_SIZE);
}
```

- [ ] **Step 5: Replace tag filter buttons with category buttons in JSX**

In the JSX (~lines 192-228), replace the tag filter section. The category buttons are:

```tsx
{Object.keys(CATEGORY_MAP).length > 0 && (
  <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
    <button
      onClick={() => selectCategory(null)}
      className={`text-sm px-3 py-1 rounded-md transition cursor-pointer ${
        !categoryFilter && !showFavorites
          ? "bg-white dark:bg-gray-600 shadow-sm font-medium"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
      }`}
    >
      Все
    </button>
    {Object.keys(CATEGORY_MAP).map((cat) => (
      <button
        key={cat}
        onClick={() => selectCategory(cat)}
        className={`text-sm px-3 py-1 rounded-md transition cursor-pointer ${
          categoryFilter === cat
            ? "bg-white dark:bg-gray-600 shadow-sm font-medium"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        }`}
      >
        {cat}
      </button>
    ))}
    <button
      onClick={selectFavorites}
      className={`text-sm px-3 py-1 rounded-md transition cursor-pointer ${
        showFavorites
          ? "bg-white dark:bg-gray-600 shadow-sm font-medium"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
      }`}
    >
      <Bookmark size={14} className="inline" /> {favorites.size}
    </button>
  </div>
)}
```

- [ ] **Step 6: Run tests to verify nothing broke**

Run: `npx vitest run`
Expected: all 7 tests pass

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: replace tag filter with category filter (Чат/Код/Зрение/Рассуждение)"
```

---

### Task 2: Favorites Page

**Files:**
- Create: `src/app/api/models/route.ts`
- Create: `src/app/favorites/page.tsx`

**Interfaces:**
- Consumes: `GET /api/models?slugs=a,b,c` from favorites page
- Produces: `/favorites` page rendering model cards

- [ ] **Step 1: Create `GET /api/models/route.ts`**

Create `src/app/api/models/route.ts`:

```tsx
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
```

- [ ] **Step 2: Create `/favorites/page.tsx`**

Create `src/app/favorites/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bookmark, Search } from "lucide-react";
import ModelCard from "@/components/ModelCard";
import SkeletonCard from "@/components/SkeletonCard";

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
  tags?: string | null;
}

const FAV_KEY = "llm-recommender-favorites";
const CATEGORY_MAP: Record<string, string> = {
  Чат: "instruct",
  Код: "code",
  Зрение: "vision",
  Рассуждение: "reasoning",
};

function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

export default function FavoritesPage() {
  const [models, setModels] = useState<ModelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [favs, setFavs] = useState<Set<string>>(loadFavorites);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  useEffect(() => {
    const slugs = [...favs];
    if (slugs.length === 0) {
      setModels([]);
      setLoading(false);
      return;
    }
    fetch(`/api/models?slugs=${slugs.join(",")}`)
      .then((r) => r.json())
      .then((data) => {
        setModels(data.models ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem(FAV_KEY, JSON.stringify([...favs]));
  }, [favs]);

  function handleFavorite(slug: string) {
    setFavs((prev) => {
      const next = new Set(prev);
      next.delete(slug);
      return next;
    });
    setModels((prev) => prev.filter((m) => m.slug !== slug));
  }

  const filtered = models.filter((m) => {
    if (!m.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter) {
      const tag = CATEGORY_MAP[categoryFilter];
      if (!m.tags?.includes(tag)) return false;
    }
    return true;
  });

  const loadingContent = (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
    </div>
  );

  const emptyContent = (
    <div className="text-center py-12 text-gray-500">
      <Bookmark size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
      <p className="text-lg">Список избранного пуст</p>
      <p className="text-sm mt-1">Добавьте модели в избранное на главной странице</p>
      <Link
        href="/"
        className="inline-block mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
      >
        Перейти к поиску
      </Link>
    </div>
  );

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
        <ArrowLeft size={14} className="inline mr-1" /> Назад к поиску
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-2">Избранное</h1>
      <p className="text-sm text-gray-500 mb-4">
        {models.length} {models.length === 1 ? "модель" : models.length >= 2 && models.length <= 4 ? "модели" : "моделей"}
      </p>

      {loading && loadingContent}

      {!loading && models.length === 0 && emptyContent}

      {!loading && models.length > 0 && (
        <>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию..."
            className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700 text-sm mb-3"
          />

          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-4">
            <button
              onClick={() => setCategoryFilter(null)}
              className={`text-sm px-3 py-1 rounded-md transition cursor-pointer ${
                !categoryFilter
                  ? "bg-white dark:bg-gray-600 shadow-sm font-medium"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Все
            </button>
            {Object.keys(CATEGORY_MAP).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`text-sm px-3 py-1 rounded-md transition cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-white dark:bg-gray-600 shadow-sm font-medium"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filtered.map((model) => (
            <ModelCard
              key={model.slug}
              model={model}
              selected={false}
              onToggle={() => {}}
              userVram={0}
              isBest={false}
              favorited={true}
              onFavorite={handleFavorite}
            />
          ))}

          {filtered.length === 0 && (
            <p className="text-center py-8 text-gray-400 text-sm">Ничего не найдено</p>
          )}
        </>
      )}
    </main>
  );
}
```

- [ ] **Step 3: Run build to verify compilation**

Run: `npx next build`
Expected: succeeds, new route `/favorites` appears in output

- [ ] **Step 4: Run tests**

Run: `npx vitest run`
Expected: all tests pass

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add favorites page at /favorites"
```

---

### Task 3: Improved Comparison Table

**Files:**
- Modify: `src/components/ComparisonTable.tsx`

**Interfaces:**
- Consumes: `ModelData[]` with `tags?: string | null` and `downloads: number`
- Produces: updated table with tags row + best/worst highlighting

- [ ] **Step 1: Add `tags` to the ModelData interface and create tag mapping**

In `ComparisonTable.tsx`, add `tags?: string | null` to the local `ModelData` interface (line ~4-14), and add a `TAG_LABELS` const:

```tsx
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
  tags?: string | null;
}

const TAG_LABELS: Record<string, string> = {
  instruct: "Чат",
  code: "Код",
  vision: "Зрение",
  reasoning: "Рассуждение",
  math: "Математика",
  base: "Базовая",
};
```

- [ ] **Step 2: Add tags row after HuggingFace row**

In the `<tbody>` section, add after the HuggingFace Row:

```tsx
<Row
  label="Теги"
  values={models.map((m) => {
    const tags = m.tags?.split(",").filter(Boolean) ?? [];
    return tags.length > 0
      ? tags.map((t) => TAG_LABELS[t.trim()] || t.trim()).join(", ")
      : "—";
  })}
/>
```

- [ ] **Step 3: Refactor Row to accept numeric context for best/worst highlighting**

Replace the `Row` component with one that accepts row-level context about which value is best/worst. The `Row` function signature changes and we add a helper to determine best/worst indices:

```tsx
function Row({ label, values, isLink, urls, numericValues, lowerIsBetter }: {
  label: string;
  values: string[];
  isLink?: boolean;
  urls?: (string | null)[];
  numericValues?: (number | null)[];
  lowerIsBetter?: boolean;
}) {
  const allMatch = new Set(values).size === 1;

  let bestIndices: Set<number> = new Set();
  let worstIndices: Set<number> = new Set();

  if (!allMatch && numericValues && numericValues.length >= 2) {
    const valid = numericValues
      .map((v, i) => ({ val: v, idx: i }))
      .filter((x) => x.val !== null);

    if (valid.length >= 2) {
      const sorted = [...valid].sort((a, b) =>
        lowerIsBetter ? a.val! - b.val! : b.val! - a.val!
      );
      const bestVal = sorted[0].val;
      const worstVal = sorted[sorted.length - 1].val;

      if (bestVal !== worstVal) {
        bestIndices = new Set(valid.filter((x) => x.val === bestVal).map((x) => x.idx));
        worstIndices = new Set(valid.filter((x) => x.val === worstVal).map((x) => x.idx));
      }
    }
  }

  const rowBg = allMatch
    ? "bg-green-50 dark:bg-green-900/20 even:bg-green-50 dark:even:bg-green-900/20"
    : "";

  return (
    <tr className={`border-b dark:border-gray-700 even:bg-gray-50 dark:even:bg-gray-800/50 ${rowBg}`}>
      <td className="px-4 py-2 text-gray-500 dark:text-gray-400 font-medium">{label}</td>
      {values.map((val, i) => {
        let cellClass = "px-4 py-2";
        if (bestIndices.has(i)) cellClass += " bg-green-100 dark:bg-green-900";
        else if (worstIndices.has(i)) cellClass += " bg-red-100 dark:bg-red-900";
        return (
          <td key={i} className={cellClass}>
            {isLink && urls?.[i] ? (
              <a href={urls[i]!} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                {val}
              </a>
            ) : (
              val
            )}
          </td>
        );
      })}
    </tr>
  );
}
```

- [ ] **Step 4: Update existing Row calls to pass numericValues and lowerIsBetter**

In the `<tbody>`, update each numeric Row call to pass raw values:

```tsx
<Row label="Параметры" values={models.map((m) => `${m.parameters}B`)}
      numericValues={models.map((m) => m.parameters)} />

<Row label="VRAM (Q4)" values={models.map((m) => m.vramQ4 ? `${m.vramQ4} ГБ` : "—")}
      numericValues={models.map((m) => m.vramQ4)} lowerIsBetter />

<Row label="VRAM (Q8)" values={models.map((m) => m.vramQ8 ? `${m.vramQ8} ГБ` : "—")}
      numericValues={models.map((m) => m.vramQ8)} lowerIsBetter />

<Row label="RAM мин." values={models.map((m) => m.ramMin ? `${m.ramMin} ГБ` : "—")}
      numericValues={models.map((m) => m.ramMin)} lowerIsBetter />

<Row label="Загрузки" values={models.map((m) => `${(m.downloads / 1000).toFixed(0)}K`)}
      numericValues={models.map((m) => m.downloads)} />

<Row label="HuggingFace" values={models.map((m) => m.hfUrl ? "Открыть" : "—")}
      isLink urls={models.map((m) => m.hfUrl)} />

<Row label="Теги" values={models.map((m) => {
  const tags = m.tags?.split(",").filter(Boolean) ?? [];
  return tags.length > 0
    ? tags.map((t) => TAG_LABELS[t.trim()] || t.trim()).join(", ")
    : "—";
})} />
```

- [ ] **Step 5: Run tests to verify nothing broke**

Run: `npx vitest run`
Expected: all tests pass

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: improve comparison table with tags row and best/worst highlighting"
```

---

### Self-Review Checklist

1. **Spec coverage:** Category filter (Task 1), Favorites Page (Task 2), Comparison improvements (Task 3) — all covered.
2. **No placeholders:** All code is inlined. No "TBD", "TODO", "fill in details".
3. **Type consistency:** `ModelData` interface same shape across all tasks. Tag mapping consistent (CATEGORY_MAP in tasks 1+2, TAG_LABELS in task 3).
4. **Scope:** Each task is isolated and independently testable.
