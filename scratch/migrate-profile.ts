import "dotenv/config";
import { Client } from "pg";

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  console.log("Connecting directly to Supabase via pg client...");

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  await client.connect();
  console.log("✅ Connected! Applying DDL alterations for user profile and preferences...");

  // 1. Add columns to users table
  await client.query(`
    ALTER TABLE "users" 
    ADD COLUMN IF NOT EXISTS "username" TEXT,
    ADD COLUMN IF NOT EXISTS "phone" TEXT;

    CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");
  `);

  // 2. Add columns to user_preferences table
  await client.query(`
    ALTER TABLE "user_preferences" 
    ADD COLUMN IF NOT EXISTS "education" TEXT,
    ADD COLUMN IF NOT EXISTS "fieldOfStudy" TEXT,
    ADD COLUMN IF NOT EXISTS "institution" TEXT,
    ADD COLUMN IF NOT EXISTS "graduationYear" TEXT,
    ADD COLUMN IF NOT EXISTS "currentSemester" TEXT,
    ADD COLUMN IF NOT EXISTS "skillLevel" TEXT DEFAULT 'Intermediate',
    ADD COLUMN IF NOT EXISTS "primaryGoal" TEXT DEFAULT 'Placement Preparation',
    ADD COLUMN IF NOT EXISTS "aiLanguage" TEXT DEFAULT 'JavaScript/TypeScript',
    ADD COLUMN IF NOT EXISTS "aiDifficulty" TEXT DEFAULT 'Intermediate',
    ADD COLUMN IF NOT EXISTS "aiResponseStyle" TEXT DEFAULT 'Balanced',
    ADD COLUMN IF NOT EXISTS "aiRecommendationsEnabled" BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS "dailyStudyTargetHours" DOUBLE PRECISION DEFAULT 2.0,
    ADD COLUMN IF NOT EXISTS "preferredStudyDurationMinutes" INTEGER DEFAULT 45,
    ADD COLUMN IF NOT EXISTS "preferredTopics" TEXT;
  `);

  console.log("✅ Supabase database schema updated successfully with all profile fields!");
  await client.end();
}

main()
  .catch((e) => {
    console.error("Migration error:", e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
