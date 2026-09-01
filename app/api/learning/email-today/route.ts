import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { sendTodaysLearningTasksEmail } from "@/lib/email-service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await sendTodaysLearningTasksEmail(user.id);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.message,
          count: result.count,
          email: result.email,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      count: result.count,
      email: result.email,
      message: result.message,
    });
  } catch (error) {
    console.error("POST /api/learning/email-today error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while sending the email." },
      { status: 500 },
    );
  }
}
