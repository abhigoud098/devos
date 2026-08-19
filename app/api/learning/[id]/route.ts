import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";

export const dynamic = "force-dynamic";
import { buildRevisionSchedule } from "@/lib/revision";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const topic = await prisma.learningTopic.findFirst({
      where: { id: params.id, userId: user.id },
      include: {
        revisionSchedule: {
          orderBy: { offsetDays: "asc" },
        },
      },
    });

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    return NextResponse.json({ topic });
  } catch (error) {
    console.error("GET /api/learning/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch topic" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.learningTopic.findFirst({
      where: { id: params.id, userId: user.id },
      include: { revisionSchedule: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      technology,
      topic,
      subtopic,
      status,
      confidence,
      difficulty,
      hoursStudied,
      notes,
      scheduledDate,
      scheduledTime,
      needRevision,
    } = body;

    let scheduledAt: Date | undefined = undefined;
    if (scheduledDate) {
      scheduledAt = new Date(
        scheduledTime ? `${scheduledDate}T${scheduledTime}` : `${scheduledDate}T09:00:00`,
      );
    }

    const isRevisionRequested = Boolean(
      needRevision !== undefined ? needRevision : existing.needRevision,
    );

    // Handle revision schedule transition
    let revisionOps = {};
    if (isRevisionRequested && existing.revisionSchedule.length === 0) {
      const schedule = buildRevisionSchedule();
      revisionOps = {
        revisionSchedule: {
          create: schedule.map((r) => ({
            date: r.date,
            offsetDays: r.offsetDays,
            done: false,
            source: r.source || "system",
            notes: r.notes || "",
          })),
        },
      };
    } else if (!isRevisionRequested && existing.revisionSchedule.length > 0) {
      revisionOps = {
        revisionSchedule: {
          deleteMany: {},
        },
      };
    }

    const updated = await prisma.learningTopic.update({
      where: { id: params.id },
      data: {
        ...(technology && { technology: technology.trim() }),
        ...(topic && { topic: topic.trim() }),
        subtopic: subtopic !== undefined ? subtopic?.trim() || null : existing.subtopic,
        ...(status && { status }),
        ...(confidence !== undefined && { confidence: String(confidence) }),
        ...(difficulty && { difficulty }),
        ...(hoursStudied !== undefined && { hoursStudied: Number(hoursStudied) }),
        lastStudied: new Date(),
        scheduledDate: scheduledDate !== undefined ? scheduledDate || null : existing.scheduledDate,
        scheduledTime: scheduledTime !== undefined ? scheduledTime || null : existing.scheduledTime,
        scheduledAt: scheduledDate !== undefined ? scheduledAt || null : existing.scheduledAt,
        notes: notes !== undefined ? notes?.trim() || null : existing.notes,
        needRevision: isRevisionRequested,
        ...revisionOps,
      },
      include: {
        revisionSchedule: true,
      },
    });

    return NextResponse.json({ success: true, topic: updated });
  } catch (error) {
    console.error("PUT /api/learning/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update topic" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.learningTopic.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    await prisma.learningTopic.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Topic deleted" });
  } catch (error) {
    console.error("DELETE /api/learning/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete topic" },
      { status: 500 },
    );
  }
}
