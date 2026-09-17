import "dotenv/config";

console.log("=== DATABASE ENVIRONMENT INSPECTION ===");
console.log("process.env.DATABASE_URL exists:", !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
  const parsed = new URL(process.env.DATABASE_URL.replace("postgresql://", "http://"));
  console.log("DATABASE_URL Host:", parsed.hostname);
  console.log("DATABASE_URL Port:", parsed.port);
  console.log("DATABASE_URL Path/DB:", parsed.pathname);
  console.log("DATABASE_URL User:", parsed.username);
}

console.log("\nprocess.env.DIRECT_URL exists:", !!process.env.DIRECT_URL);
if (process.env.DIRECT_URL) {
  const parsed = new URL(process.env.DIRECT_URL.replace("postgresql://", "http://"));
  console.log("DIRECT_URL Host:", parsed.hostname);
  console.log("DIRECT_URL Port:", parsed.port);
  console.log("DIRECT_URL Path/DB:", parsed.pathname);
  console.log("DIRECT_URL User:", parsed.username);
}
