# Category Filter, Favorites Page & Improved Comparison

## Overview

Three UX improvements for LLM Recommender.

## Feature 1: Category Filter

Replace the current tag chips (instruct/code/vision/reasoning/math/base) in ResultsList with 4 main category buttons: Чат / Код / Зрение / Рассуждение.

### Mapping

| Category | Tag |
|----------|-----|
| Чат      | instruct |
| Код      | code |
| Зрение   | vision |
| Рассуждение | reasoning |

`math` and `base` tags remain displayed on model cards but are **not** exposed as top-level category filters.

### Behaviour

- Category buttons are mutually exclusive (radio-like). Selecting one shows only models whose `tags` field includes the mapped tag.
- Clicking the active category again deselects it (shows all).
- The existing tag filter (`tagFilter` state) is replaced by `categoryFilter`.
- The "Все" button shows all models regardless of category.
- Visual: plain buttons matching the existing chip style, without icons, but slightly larger.

### Files to change

- `src/components/ResultsList.tsx` — replace tag filter buttons with category buttons
- `src/components/ModelCard.tsx` — keep tag display as-is

## Feature 2: Favorites Page

### Route

- `/favorites` — client component (`"use client"`)
- Renders a list of model cards identical to ResultsList layout, but sourced from favorites in localStorage

### Data flow

1. On mount, read `llm-recommender-favorites` from localStorage (same key as main page)
2. Parse the JSON array of slug strings
3. Fetch model data via: `GET /api/models?slugs=a,b,c`
4. Display models in a grid of ModelCards

### API

- `GET /api/models` — new query handler in `src/app/api/models/route.ts`
- Accepts `?slugs=slug1,slug2,...` query param
- Returns `{ models: Model[] }` from `prisma.model.findMany({ where: { slug: { in: slugs } } })`

### UI

- Header: "Избранное" with count
- If no favorites: empty state with text "Добавьте модели в избранное на главной странице" and a link back to `/`
- Each card has a bookmark button (filled by default) to remove from favorites
- Search/filter on favorites page: same as main page — text search, category filter, quantisation filter, sort
- Back link to main page

### Files to create/change

- `src/app/favorites/page.tsx` (new)
- `src/app/api/models/route.ts` (new)

## Feature 3: Improved Comparison

### Tags row

Add a row "Теги" to `ComparisonTable` showing each model's tags as comma-separated Russian labels (using the same mapping as Feature 1, plus `math`→"Математика", `base`→"Базовая").

### Best/worst highlighting

For each numeric row (Параметры, VRAM Q4, VRAM Q8, RAM мин., Загрузки):

| Direction | Greater is better | Lesser is better |
|-----------|-------------------|------------------|
| Params    | ✓                 |                  |
| Downloads | ✓                 |                  |
| VRAM Q4   |                   | ✓                |
| VRAM Q8   |                   | ✓                |
| RAM Min   |                   | ✓                |

- Best value → `bg-green-100 dark:bg-green-900`
- Worst value → `bg-red-100 dark:bg-red-900`
- If all equal → `bg-green-100` (current behaviour)
- If only 2 models and one is better/worse → straightforward
- Non-numeric rows (Провайдер, HuggingFace, Теги) are not highlighted

### State filter for already-highlighted rows

The current "совпадающие строки" green highlight and the new best/worst highlight are independent:
- Green row bg (all equal) → kept as-is
- Best/worst cell bg → new, per-cell

### Files to change

- `src/components/ComparisonTable.tsx`

## Implementation order

1. Category Filter (simplest, isolated)
2. Favorites Page (new route, depends on nothing)
3. Improved Comparison (isolated)

## Testing

- Category Filter: update existing ResultsList tests if any reference tags
- Favorites Page: new tests for empty state + model rendering
- Comparison: update ComparisonTable tests for best/worst highlighting and tags row
