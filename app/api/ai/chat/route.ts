import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { generateAIResponse } from "@/lib/ai-service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in to use DevOS AI." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const history = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      return NextResponse.json({ error: "Please enter a valid question." }, { status: 400 });
    }

    if (message.length > 4000) {
      return NextResponse.json({ error: "Message exceeds maximum allowed length of 4000 characters." }, { status: 400 });
    }

    const result = await generateAIResponse({
      userId: user.id,
      message,
      history,
    });

    if (result.error && result.intent === "RATE_LIMITED") {
      return NextResponse.json(
        { error: result.response },
        { status: 429 },
      );
    }

    return NextResponse.json({
      response: result.response,
      intent: result.intent,
    });
  } catch (error: any) {
    console.error("POST /api/ai/chat error:", error);
    return NextResponse.json(
      { error: "AI service is temporarily unavailable. Please try again." },
      { status: 500 },
    );
  }
}
