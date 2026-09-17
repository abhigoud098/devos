import "dotenv/config";
import fs from "fs";
import path from "path";

async function diagnose() {
  console.log("=== DIAGNOSTIC REPORT FOR AI FEATURE ===");

  // 1. Environment Variable Loading
  const envPath = path.join(process.cwd(), ".env");
  const envLocalPath = path.join(process.cwd(), ".env.local");

  console.log(".env exists:", fs.existsSync(envPath));
  console.log(".env.local exists:", fs.existsSync(envLocalPath));

  const key1 = process.env.AI_API_KEY;
  const key2 = process.env.GEMINI_API_KEY;
  const model = process.env.AI_MODEL;

  console.log("AI_API_KEY loaded:", key1 ? `YES (length ${key1.length}, starts with '${key1.slice(0, 4)}...')` : "NO (undefined/empty)");
  console.log("GEMINI_API_KEY loaded:", key2 ? `YES (length ${key2.length}, starts with '${key2.slice(0, 4)}...')` : "NO (undefined/empty)");
  console.log("AI_MODEL loaded:", model || "NOT SET (will default)");

  const apiKey = key1 || key2;

  if (!apiKey) {
    console.log("\n❌ ERROR: Neither AI_API_KEY nor GEMINI_API_KEY is defined in process.env!");
    return;
  }

  if (apiKey === "YOUR_GEMINI_API_KEY" || apiKey.startsWith("your-") || apiKey.startsWith("YOUR_")) {
    console.log("\n⚠️ NOTICE: The API key is set to the placeholder string. A real API key from Google AI Studio is required for live generation.");
  }

  // 2. Test direct REST request to Gemini API
  console.log("\n=== TESTING GEMINI API REST ENDPOINT ===");
  const testModels = [model || "gemini-1.5-flash", "gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash", "gemini-3.6-flash"];
  const uniqueModels = Array.from(new Set(testModels.filter(Boolean)));

  for (const m of uniqueModels) {
    console.log(`\nTesting Model: ${m}`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "Hello" }] }],
        }),
      });

      console.log(`HTTP Status: ${res.status} ${res.statusText}`);
      const body = await res.text();
      try {
        const json = JSON.parse(body);
        console.log("Response JSON:", JSON.stringify(json, null, 2));
      } catch {
        console.log("Response Raw:", body);
      }
    } catch (err: any) {
      console.error(`Fetch exception for ${m}:`, err?.message || err);
    }
  }
}

diagnose();
