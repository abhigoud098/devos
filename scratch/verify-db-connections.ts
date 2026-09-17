import fs from "fs";
import { Pool } from "pg";

async function checkConnection(name: string, url: string) {
  console.log(`\nTesting connection to: ${name}`);
  const parsed = new URL(url.replace("postgresql://", "http://"));
  console.log(`  Host: ${parsed.hostname}`);
  console.log(`  Port: ${parsed.port}`);
  console.log(`  Database: ${parsed.pathname}`);
  console.log(`  User: ${parsed.username}`);

  const isLocal = parsed.hostname.includes("localhost") || parsed.hostname.includes("127.0.0.1");
  const pool = new Pool({
    connectionString: url,
    connectionTimeoutMillis: 5000,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();
    const res = await client.query("SELECT 1 as test, current_database() as db");
    console.log(`  ✓ Succeeded! Current DB: ${res.rows[0]?.db}`);
    client.release();
  } catch (err: any) {
    console.error(`  ❌ Failed to connect:`, err.message || err);
  } finally {
    await pool.end();
  }
}

async function run() {
  // 1. Read .env and .env.local URLs
  const envContent = fs.readFileSync(".env", "utf8");
  const envMatch = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)/);
  const envUrl = envMatch ? envMatch[1] : "";

  if (envUrl) {
    await checkConnection(".env / .env.local (Supabase URL)", envUrl);
  }

  // 2. Check process.env.DATABASE_URL (Local URL)
  if (process.env.DATABASE_URL) {
    await checkConnection("Local environment DATABASE_URL", process.env.DATABASE_URL);
  }
}

run();
