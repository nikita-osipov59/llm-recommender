# Model Comparison — Design Document

## Overview
Добавить возможность сравнения моделей side-by-side на странице результатов.

## Scope
- Чекбоксы на карточках моделей в ResultsList
- Кнопка "Сравнить (N)" при выборе ≥2 моделей
- Таблица сравнения под списком карточек
- Не-MVP: отдельная страница /compare, подсветка совместимости, отзывы

## Architecture
- Все изменения во фронтенде (клиентские компоненты)
- API/POST /api/recommend без изменений
- Новый файл: `src/components/ComparisonTable.tsx`
- Изменяемые: `ResultsList.tsx`, `ModelCard.tsx`

## Data Flow
```
page.tsx (без изменений)
  → ResultsList (добавить selectedSlugs, handleToggle)
     → ModelCard (пропсы: selected, onToggle + чекбокс)
     → [Модели выбраны ≥2?]
         → ComparisonTable (columns=модели, rows=характеристики)
```

## ComparisonTable Props
```typescript
interface ComparisonTableProps {
  models: ModelData[];
  onClose: () => void;
}
```

## ComparisonTable Layout
- `<div>` с кнопкой "Закрыть" в правом верхнем углу
- `<table>`: заголовки = имена моделей (по одному столбцу на модель), строки:
  - Провайдер
  - Параметры (B)
  - VRAM Q4 (ГБ)
  - VRAM Q8 (ГБ)
  - RAM мин. (ГБ)
  - Загрузки
  - HuggingFace (ссылка)
- Стили: Tailwind, border, striped rows, responsive (горизонтальный скролл)

## Files Changed
| File | Change |
|------|--------|
| `src/components/ModelCard.tsx` | +prop `selected`, `onToggle`; чекбокс перед названием |
| `src/components/ResultsList.tsx` | +state `selectedSlugs`, кнопка "Сравнить (N)", рендер ComparisonTable |
| `src/components/ComparisonTable.tsx` | Новый файл |
