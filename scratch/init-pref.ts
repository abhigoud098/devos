import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "user_preferences" 
    ADD COLUMN IF NOT EXISTS "learningNotificationEmail" TEXT,
    ADD COLUMN IF NOT EXISTS "dailyLearningEmailEnabled" BOOLEAN NOT NULL DEFAULT false;
  `);
  console.log("✅ Successfully verified user_preferences schema in Supabase!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => process.exit(0));
