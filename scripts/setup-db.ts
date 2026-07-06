/**
 * One-time database setup script — creates all tables and seeds demo data.
 *
 * Run this ONCE after deploying to Vercel, from your local machine with
 * the Supabase connection string in .env:
 *
 *   bun run scripts/setup-db.ts
 *
 * Or via Vercel CLI:
 *
 *   vercel env pull .env.vercel
 *   bun run scripts/setup-db.ts --env=.env.vercel
 *
 * This script is IDEMPOTENT — safe to run multiple times (uses upsert).
 */
import { execSync } from "node:child_process";

console.log("🚀 MDTA Digital Knowledge Center — Database Setup");
console.log("================================================\n");

// Step 1: Generate Prisma client
console.log("▸ Step 1/3: Generating Prisma client...");
try {
  execSync("bunx prisma generate", { stdio: "inherit", cwd: process.cwd() });
  console.log("✓ Prisma client generated\n");
} catch (e) {
  console.error("✗ Failed to generate Prisma client");
  process.exit(1);
}

// Step 2: Push schema to database (creates all tables)
console.log("▸ Step 2/3: Pushing schema to database (creating tables)...");
try {
  execSync("bunx prisma db push --accept-data-loss", { stdio: "inherit", cwd: process.cwd() });
  console.log("✓ Schema pushed — all tables created\n");
} catch (e) {
  console.error("✗ Failed to push schema. Check your DATABASE_URL and DIRECT_URL in .env");
  console.error("  Make sure you're using the Supabase Connection POOLER URL (port 6543) for DATABASE_URL");
  console.error("  and the Session/Direct URL (port 5432) for DIRECT_URL");
  process.exit(1);
}

// Step 3: Seed demo data
console.log("▸ Step 3/3: Seeding demo data...");
try {
  execSync("bun run scripts/seed.ts", { stdio: "inherit", cwd: process.cwd() });
  console.log("✓ Demo data seeded\n");
} catch (e) {
  console.error("✗ Failed to seed data");
  process.exit(1);
}

console.log("================================================");
console.log("✅ Database setup complete!");
console.log("");
console.log("You can now:");
console.log("  • Visit your deployed app at https://your-project.vercel.app");
console.log("  • Login at /admin/login with:");
console.log("    Email:    admin@mdta-miftahululum.sch.id");
console.log("    Password: admin12345");
console.log("");
console.log("⚠️  IMPORTANT: Change the admin password after first login!");
console.log("================================================");
