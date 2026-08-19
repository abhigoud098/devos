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

    const sessions = await prisma.studySession.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: "desc" },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("GET /api/timer/sessions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch study sessions" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type = "focus", duration = 25, completedAt } = body;

    const session = await prisma.studySession.create({
      data: {
        userId: user.id,
        type,
        duration: Number(duration) || 25,
        completedAt: completedAt ? new Date(completedAt) : new Date(),
      },
    });

    return NextResponse.json({ success: true, session }, { status: 201 });
  } catch (error) {
    console.error("POST /api/timer/sessions error:", error);
    return NextResponse.json(
      { error: "Failed to record study session" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.studySession.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json({ success: true, message: "History cleared" });
  } catch (error) {
    console.error("DELETE /api/timer/sessions error:", error);
    return NextResponse.json(
      { error: "Failed to clear session history" },
      { status: 500 },
    );
  }
}
