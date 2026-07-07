const { execSync } = require("child_process");

if (!process.env.DATABASE_URL) {
  console.log("DATABASE_URL not set, skipping db setup.");
  process.exit(0);
}

try {
  execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
} catch (e) {
  process.exit(1);
}

// Seed GPU data at build time
try {
  execSync("npx tsx scripts/seed-gpus.ts", { stdio: "inherit" });
} catch (e) {
  console.warn("GPU seeding failed (non-fatal):", e instanceof Error ? e.message : e);
}
