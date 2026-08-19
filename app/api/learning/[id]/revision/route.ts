import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { revisionDate, done = true, notes } = body;

    if (!revisionDate) {
      return NextResponse.json(
        { error: "revisionDate is required" },
        { status: 400 },
      );
    }

    const topic = await prisma.learningTopic.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const updatedEntry = await prisma.revisionEntry.updateMany({
      where: {
        topicId: params.id,
        date: revisionDate,
      },
      data: {
        done: Boolean(done),
        doneAt: done ? new Date() : null,
        reviewCount: { increment: done ? 1 : 0 },
        ...(notes !== undefined && { notes }),
      },
    });

    await prisma.learningTopic.update({
      where: { id: params.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, count: updatedEntry.count });
  } catch (error) {
    console.error("PUT /api/learning/[id]/revision error:", error);
    return NextResponse.json(
      { error: "Failed to update revision" },
      { status: 500 },
    );
  }
}
