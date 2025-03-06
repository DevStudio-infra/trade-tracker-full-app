import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🔄 Starting database migration workflow...");

    // Step 1: Generate Prisma Client
    console.log("\n📦 Generating Prisma Client...");
    execSync("npx prisma generate", { stdio: "inherit" });

    // Step 2: Run migrations
    console.log("\n⬆️ Running database migrations...");
    execSync("npx prisma migrate deploy", { stdio: "inherit" });

    // Step 3: Check database connection
    console.log("\n🔍 Checking database connection...");
    await prisma.$connect();
    console.log("✅ Database connection successful");

    // Step 4: Run seeds if in development
    if (process.env.NODE_ENV === "development") {
      console.log("\n🌱 Running database seeds...");
      execSync("npm run db:seed", { stdio: "inherit" });
    }

    console.log("\n✅ Migration workflow completed successfully");
  } catch (error) {
    console.error("\n❌ Migration workflow failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute migration workflow
main();
