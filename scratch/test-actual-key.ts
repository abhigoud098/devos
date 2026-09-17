import "dotenv/config";

async function testKey() {
  const apiKey = (process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();

  console.log("AI API key configured:", Boolean(apiKey));
  console.log("Key length:", apiKey.length);

  const models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash", "gemini-3.6-flash", "gemini-3.8-flash"];

  for (const model of models) {
    console.log(`\n--- Testing model: ${model} ---`);
    // Method 1: query param key=
    const url1 = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    try {
      const res1 = await fetch(url1, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "Respond with the single word: DEVOS_WORKING" }] }],
        }),
      });
      console.log(`[key param] Status: ${res1.status} ${res1.statusText}`);
      const text1 = await res1.text();
      try {
        const json = JSON.parse(text1);
        if (json.candidates?.[0]?.content?.parts?.[0]?.text) {
          console.log(`[key param] SUCCESS:`, json.candidates[0].content.parts[0].text.trim());
        } else {
          console.log(`[key param] Error:`, json.error?.message || text1.slice(0, 200));
        }
      } catch {
        console.log(`[key param] Raw:`, text1.slice(0, 200));
      }
    } catch (e: any) {
      console.log(`[key param] Fetch exception:`, e.message);
    }

    // Method 2: Authorization: Bearer
    const url2 = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    try {
      const res2 = await fetch(url2, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "Respond with the single word: DEVOS_WORKING" }] }],
        }),
      });
      console.log(`[Bearer header] Status: ${res2.status} ${res2.statusText}`);
      const text2 = await res2.text();
      try {
        const json = JSON.parse(text2);
        if (json.candidates?.[0]?.content?.parts?.[0]?.text) {
          console.log(`[Bearer header] SUCCESS:`, json.candidates[0].content.parts[0].text.trim());
        } else {
          console.log(`[Bearer header] Error:`, json.error?.message || text2.slice(0, 200));
        }
      } catch {
        console.log(`[Bearer header] Raw:`, text2.slice(0, 200));
      }
    } catch (e: any) {
      console.log(`[Bearer header] Fetch exception:`, e.message);
    }
  }
}

testKey();
