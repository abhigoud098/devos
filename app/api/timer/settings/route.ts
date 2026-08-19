import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let pref = await prisma.userPreference.findUnique({
      where: { userId: user.id },
    });

    if (!pref) {
      pref = await prisma.userPreference.create({
        data: {
          userId: user.id,
          focusDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
        },
      });
    }

    return NextResponse.json({
      settings: {
        focusDuration: pref.focusDuration,
        shortBreakDuration: pref.shortBreakDuration,
        longBreakDuration: pref.longBreakDuration,
      },
    });
  } catch (error) {
    console.error("GET /api/timer/settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch timer settings" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { focusDuration, shortBreakDuration, longBreakDuration } = body;

    const pref = await prisma.userPreference.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        focusDuration: Number(focusDuration) || 25,
        shortBreakDuration: Number(shortBreakDuration) || 5,
        longBreakDuration: Number(longBreakDuration) || 15,
      },
      update: {
        ...(focusDuration !== undefined && { focusDuration: Number(focusDuration) }),
        ...(shortBreakDuration !== undefined && { shortBreakDuration: Number(shortBreakDuration) }),
        ...(longBreakDuration !== undefined && { longBreakDuration: Number(longBreakDuration) }),
      },
    });

    return NextResponse.json({
      success: true,
      settings: {
        focusDuration: pref.focusDuration,
        shortBreakDuration: pref.shortBreakDuration,
        longBreakDuration: pref.longBreakDuration,
      },
    });
  } catch (error) {
    console.error("PUT /api/timer/settings error:", error);
    return NextResponse.json(
      { error: "Failed to update timer settings" },
      { status: 500 },
    );
  }
}
