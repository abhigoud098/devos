import { NextResponse } from "next/server";
import { checkAndSendDueReminders } from "@/lib/email-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return handleCron(req);
}

export async function POST(req: Request) {
  return handleCron(req);
}

async function handleCron(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecretHeader = req.headers.get("x-cron-secret");
    const expectedSecret = process.env.CRON_SECRET;

    // Secure cron endpoint if CRON_SECRET is defined in environment
    if (expectedSecret) {
      const isBearerMatch = authHeader === `Bearer ${expectedSecret}`;
      const isCustomHeaderMatch = cronSecretHeader === expectedSecret;

      if (!isBearerMatch && !isCustomHeaderMatch) {
        return NextResponse.json({ error: "Unauthorized cron request." }, { status: 401 });
      }
    }

    const result = await checkAndSendDueReminders({ timeZone: "Asia/Kolkata" });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      timeZone: "Asia/Kolkata",
      ...result,
    });
  } catch (error: any) {
    console.error("Cron study-reminders execution error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to run study reminders cron." },
      { status: 500 },
    );
  }
}
