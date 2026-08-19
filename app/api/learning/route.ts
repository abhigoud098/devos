import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";

export const dynamic = "force-dynamic";
import { buildRevisionSchedule } from "@/lib/revision";

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const topics = await prisma.learningTopic.findMany({
      where: { userId: user.id },
      include: {
        revisionSchedule: {
          orderBy: { offsetDays: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ topics });
  } catch (error) {
    console.error("GET /api/learning error:", error);
    return NextResponse.json(
      { error: "Failed to fetch learning topics" },
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
    const {
      technology,
      topic,
      subtopic,
      status = "not-started",
      confidence = "3",
      difficulty = "medium",
      hoursStudied = 0,
      notes,
      scheduledDate,
      scheduledTime,
      needRevision = false,
    } = body;

    if (!technology || !topic) {
      return NextResponse.json(
        { error: "Technology and topic are required." },
        { status: 400 },
      );
    }

    let scheduledAt: Date | undefined = undefined;
    if (scheduledDate) {
      scheduledAt = new Date(
        scheduledTime ? `${scheduledDate}T${scheduledTime}` : `${scheduledDate}T09:00:00`,
      );
    }

    const revisionEntries =
      needRevision || status === "revising"
        ? buildRevisionSchedule().map((r) => ({
            date: r.date,
            offsetDays: r.offsetDays,
            done: false,
            source: r.source || "system",
            notes: r.notes || "",
          }))
        : [];

    const newTopic = await prisma.learningTopic.create({
      data: {
        userId: user.id,
        technology: technology.trim(),
        topic: topic.trim(),
        subtopic: subtopic?.trim() || null,
        status,
        confidence: String(confidence),
        difficulty,
        hoursStudied: Number(hoursStudied) || 0,
        lastStudied: status === "not-started" ? null : new Date(),
        scheduledDate: scheduledDate || null,
        scheduledTime: scheduledTime || null,
        scheduledAt: scheduledAt || null,
        notes: notes?.trim() || null,
        needRevision: Boolean(needRevision || status === "revising"),
        revisionSchedule: {
          create: revisionEntries,
        },
      },
      include: {
        revisionSchedule: true,
      },
    });

    return NextResponse.json({ success: true, topic: newTopic }, { status: 201 });
  } catch (error) {
    console.error("POST /api/learning error:", error);
    return NextResponse.json(
      { error: "Failed to create learning topic" },
      { status: 500 },
    );
  }
}
