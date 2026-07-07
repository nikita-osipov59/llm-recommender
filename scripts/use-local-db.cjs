const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const schemaDir = path.join(__dirname, "..", "prisma");
const mainSchema = path.join(schemaDir, "schema.prisma");
const sqliteSchema = path.join(schemaDir, "schema.sqlite.prisma");
const backupSchema = path.join(schemaDir, "schema.prisma.bak");

// Backup current schema if not already a backup
if (!fs.existsSync(backupSchema)) {
  fs.copyFileSync(mainSchema, backupSchema);
  console.log("Backed up original schema");
}

// Read current content
const current = fs.readFileSync(mainSchema, "utf-8");

// If already SQLite, skip copy
if (current.includes('provider = "sqlite"')) {
  console.log("Already on SQLite schema");
} else {
  fs.copyFileSync(sqliteSchema, mainSchema);
  console.log("Switched to SQLite schema");
}

// Generate + push + seed
execSync("npx prisma generate && npx prisma db push --accept-data-loss && npx tsx scripts/seed-gpus.ts", {
  stdio: "inherit",
  cwd: path.join(__dirname, ".."),
});
