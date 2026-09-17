import "dotenv/config";
import { generateAIResponse } from "../lib/ai-service";

async function runFullTest() {
  console.log("=== RUNNING FULL AI FEATURE DIAGNOSTIC TEST ===\n");

  console.log("Environment state:");
  console.log("- AI_MODEL:", process.env.AI_MODEL || "(not set)");
  console.log("- AI_API_KEY set:", !!process.env.AI_API_KEY);
  if (process.env.AI_API_KEY) {
    const key = process.env.AI_API_KEY;
    console.log("- AI_API_KEY length:", key.length);
    console.log("- AI_API_KEY starts with AIzaSy:", key.startsWith("AIzaSy"));
  }

  console.log("\nTesting generateAIResponse()...");
  const result = await generateAIResponse({
    userId: "test-user-id",
    message: "What should I study today?",
  });

  console.log("\nResult Intent:", result.intent);
  console.log("Result Error:", result.error || "None");
  console.log("Result Response Preview:\n----------------------------------------");
  console.log(result.response);
  console.log("----------------------------------------");
}

runFullTest();
