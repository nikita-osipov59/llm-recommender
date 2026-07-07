const { execSync } = require("child_process");

if (process.env.DATABASE_URL) {
  try {
    execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
  } catch (e) {
    process.exit(1);
  }
}
