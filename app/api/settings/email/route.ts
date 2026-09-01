import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { validateEmail } from "@/lib/email-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const preference = await prisma.userPreference.findUnique({
      where: { userId: user.id },
      select: {
        learningNotificationEmail: true,
        dailyLearningEmailEnabled: true,
        reminderMinutesBefore: true,
      },
    });

    return NextResponse.json({
      email: preference?.learningNotificationEmail || "",
      enabled: preference?.dailyLearningEmailEnabled ?? false,
      reminderMinutes: preference?.reminderMinutesBefore ?? 10,
    });
  } catch (error) {
    console.error("GET /api/settings/email error:", error);
    return NextResponse.json({ error: "Failed to retrieve email settings." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { email, enabled, reminderMinutes } = body;

    let targetEmail: string | undefined = undefined;

    if (email !== undefined) {
      const trimmed = String(email).trim();
      if (trimmed !== "") {
        if (!validateEmail(trimmed)) {
          return NextResponse.json(
            { error: "Please enter a valid email address." },
            { status: 400 },
          );
        }
        targetEmail = trimmed;
      } else {
        targetEmail = "";
      }
    }

    // If attempting to enable notifications, ensure a valid email is configured
    if (enabled === true) {
      const currentPref = await prisma.userPreference.findUnique({
        where: { userId: user.id },
      });

      const effectiveEmail = targetEmail !== undefined ? targetEmail : currentPref?.learningNotificationEmail;

      if (!effectiveEmail || !validateEmail(effectiveEmail)) {
        return NextResponse.json(
          { error: "Please add a notification email first." },
          { status: 400 },
        );
      }
    }

    const updateData: any = {};
    if (targetEmail !== undefined) {
      updateData.learningNotificationEmail = targetEmail || null;
    }
    if (enabled !== undefined) {
      updateData.dailyLearningEmailEnabled = Boolean(enabled);
    }
    if (typeof reminderMinutes === "number" && reminderMinutes > 0) {
      updateData.reminderMinutesBefore = reminderMinutes;
    }

    const updated = await prisma.userPreference.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        learningNotificationEmail: targetEmail || null,
        dailyLearningEmailEnabled: enabled ?? false,
        reminderMinutesBefore: reminderMinutes ?? 10,
      },
      update: updateData,
    });

    return NextResponse.json({
      success: true,
      email: updated.learningNotificationEmail || "",
      enabled: updated.dailyLearningEmailEnabled,
      reminderMinutes: updated.reminderMinutesBefore,
      message: "Email settings saved successfully.",
    });
  } catch (error) {
    console.error("PATCH /api/settings/email error:", error);
    return NextResponse.json(
      { error: "Failed to update email settings." },
      { status: 500 },
    );
  }
}
