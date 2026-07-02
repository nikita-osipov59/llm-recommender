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
