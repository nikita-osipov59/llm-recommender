-- CreateTable
CREATE TABLE "Gpu" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "vramGb" REAL NOT NULL,
    "vendor" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Gpu_name_key" ON "Gpu"("name");
