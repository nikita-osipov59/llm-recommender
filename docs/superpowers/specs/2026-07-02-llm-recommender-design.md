# LLM Recommender — Design Document

## Overview
Веб-приложение, которое помогает подобрать локальную LLM под характеристики железа пользователя. Пользователь вводит GPU, VRAM, RAM, CPU — получает список подходящих моделей с квантизациями.

## Stack
- **Frontend/Backend**: Next.js 15+ (App Router, `src/`)
- **Database**: SQLite через Prisma ORM
- **External API**: HuggingFace Hub API (поиск моделей, парсинг model cards)
- **Language**: TypeScript (весь проект)

## MVP Scope (v1)
- Форма ввода: GPU, VRAM (GB), RAM (GB), CPU
- Вывод списка моделей, подходящих под железо
- Кеш результатов в SQLite (TTL 24ч)
- Сайт на русском языке
- Без регистрации

## Pages
| Route | Type | Description |
|-------|------|-------------|
| `/` | Server + Client | Форма + список результатов |
| `/models/[slug]` | Server | Детальная страница модели |

## Components
- `HardwareForm` (Client) — форма с селектами GPU и числовыми инпутами VRAM/RAM/CPU
- `ResultsList` (Client) — список найденных моделей
- `ModelCard` (Client) — карточка модели (название, параметры, VRAM, ссылка)
- `ModelDetail` (Server) — детальное описание модели

## API Routes
- `POST /api/recommend` — принимает `{ gpu, vram, ram, cpu }`, возвращает модели из кеша/HuggingFace
- `GET /api/models/[slug]` — детали модели

## Data Model (Prisma)
```prisma
model Model {
  id           Int      @id @default(autoincrement())
  slug         String   @unique
  name         String
  provider     String   // e.g. "Meta", "Mistral", "DeepSeek"
  description  String?
  parameters   Float    // B (billions)
  vramQ4       Float?   // GB required for Q4_K_M
  vramQ8       Float?   // GB required for Q8
  ramMin       Float?   // GB minimum RAM
  cpuRec       String?  // recommended CPU
  hfUrl        String?  // HuggingFace URL
  tags         String?  // comma-separated
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

## HuggingFace API Integration
**Endpoint:** `GET https://huggingface.co/api/models?search=llm+text-generation&sort=downloads&direction=-1&limit=100`
**Парсинг metadata:** из секции `cardData` ответа читаем:
- `parameters` (B) → `model-index[0].results[0].metrics.parameters`
- Вручную поддерживаемый маппинг модель→VRAM (т.к. HuggingFace не хранит VRAM): таблица `modelVramMap` в коде, где для популярных моделей указан VRAM для Q4/Q8

## Filtering Logic
Модель подходит, если:
- `vramQ4 <= userVRAM` (если vramQ4 известен)
- `ramMin <= userRAM` (если ramMin известен)
- Сортировка: сначала по популярности (downloads), потом по Parameters

## Caching Flow
1. User submits form
2. Check SQLite: есть ли модели, соответствующие фильтру и обновлённые < 24ч?
3. Если да — отдаём из кеша
4. Если нет — запрос к HuggingFace API
5. Парсинг: извлекаем имя, провайдера, параметры. Накладываем `modelVramMap` для VRAM
6. Сохранение в SQLite
7. Возврат отфильтрованного списка

## Non-MVP (Future)
- Сравнение моделей
- Отзывы пользователей
- Фильтр по квантизации (Q4/Q6/Q8)
- HuggingFace-виджет "все модели"
- Админка для ручного добавления
