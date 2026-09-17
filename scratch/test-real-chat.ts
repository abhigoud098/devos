import "dotenv/config";
import { generateAIResponse } from "../lib/ai-service";

async function verifyAI() {
  console.log("=== VERIFYING AI GENERATION FROM .ENV CONFIGURATION ===");
  console.log("AI API key configured:", Boolean(process.env.AI_API_KEY));
  console.log("AI_MODEL from env:", process.env.AI_MODEL);

  const res = await generateAIResponse({
    userId: "test-user-id",
    message: "What is quicksort? Give a 1-sentence definition.",
  });

  console.log("\nIntent:", res.intent);
  console.log("Error:", res.error || "None");
  console.log("\nResponse:\n" + res.response);
}

verifyAI();
