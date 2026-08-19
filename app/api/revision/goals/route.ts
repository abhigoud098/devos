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

    let goal = await prisma.revisionGoal.findUnique({
      where: { userId: user.id },
    });

    if (!goal) {
      goal = await prisma.revisionGoal.create({
        data: {
          userId: user.id,
          dailyTarget: 5,
          weeklyTarget: 30,
        },
      });
    }

    return NextResponse.json({
      goals: {
        dailyTarget: goal.dailyTarget,
        weeklyTarget: goal.weeklyTarget,
      },
    });
  } catch (error) {
    console.error("GET /api/revision/goals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch revision goals" },
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
    const { dailyTarget, weeklyTarget } = body;

    const goal = await prisma.revisionGoal.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        dailyTarget: Number(dailyTarget) || 5,
        weeklyTarget: Number(weeklyTarget) || 30,
      },
      update: {
        ...(dailyTarget !== undefined && { dailyTarget: Number(dailyTarget) }),
        ...(weeklyTarget !== undefined && { weeklyTarget: Number(weeklyTarget) }),
      },
    });

    return NextResponse.json({
      success: true,
      goals: {
        dailyTarget: goal.dailyTarget,
        weeklyTarget: goal.weeklyTarget,
      },
    });
  } catch (error) {
    console.error("PUT /api/revision/goals error:", error);
    return NextResponse.json(
      { error: "Failed to update revision goals" },
      { status: 500 },
    );
  }
}
