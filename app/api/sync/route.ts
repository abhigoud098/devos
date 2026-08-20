import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      learningTopics = [],
      notes = [],
      projects = [],
      resources = [],
      plannerTasks = [],
      dsaProblems = [],
      studySessions = [],
    } = body;

    // Use transaction to ensure data integrity
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Sync Notes
      for (const note of notes) {
        if (note.title && note.content) {
          await tx.note.create({
            data: {
              userId: user.id,
              title: note.title,
              content: note.content,
              type: note.type || "General",
              image: note.image || null,
            },
          });
        }
      }

      // 2. Sync Projects
      for (const proj of projects) {
        if (proj.title && proj.tech) {
          await tx.project.create({
            data: {
              userId: user.id,
              title: proj.title,
              description: proj.description || "",
              tech: proj.tech,
              github: proj.github || "",
              live: proj.live || "",
              status: proj.status || "Idea",
              image: proj.image || null,
            },
          });
        }
      }

      // 3. Sync Resources
      for (const res of resources) {
        if (res.title && res.url) {
          await tx.resourceItem.create({
            data: {
              userId: user.id,
              title: res.title,
              url: res.url,
              description: res.description || "",
              type: res.type || "Article",
              image: res.image || null,
            },
          });
        }
      }

      // 4. Sync Planner Tasks
      for (const task of plannerTasks) {
        if (task.title && task.date) {
          await tx.plannerTask.create({
            data: {
              userId: user.id,
              title: task.title,
              description: task.description || "",
              date: task.date,
              hours: String(task.hours || "1"),
              status: task.status || "Pending",
              image: task.image || null,
            },
          });
        }
      }

      // 5. Sync DSA Problems
      for (const dsa of dsaProblems) {
        if (dsa.name) {
          await tx.dSAProblem.create({
            data: {
              userId: user.id,
              name: dsa.name,
              number: String(dsa.number || ""),
              pattern: dsa.pattern || "Arrays",
              method: dsa.method || "Two Pointer",
              difficulty: dsa.difficulty || "Medium",
              status: dsa.status || "Solved",
              struggle: dsa.struggle || "",
              learning: dsa.learning || "",
              revisionEnabled: Boolean(dsa.revision?.enabled),
              revisionDate: dsa.revision?.date || null,
              revisionInterval: dsa.revision?.interval || null,
              revisionNotes: dsa.revision?.notes || null,
              revisionDone: Boolean(dsa.revision?.done),
              image: dsa.image || null,
            },
          });
        }
      }

      // 6. Sync Study Sessions
      for (const session of studySessions) {
        if (session.duration) {
          await tx.studySession.create({
            data: {
              userId: user.id,
              type: session.type || "focus",
              duration: Number(session.duration) || 25,
              completedAt: session.completedAt ? new Date(session.completedAt) : new Date(),
            },
          });
        }
      }

      // 7. Sync Learning Topics
      for (const top of learningTopics) {
        if (top.technology && top.topic) {
          const createdTopic = await tx.learningTopic.create({
            data: {
              userId: user.id,
              technology: top.technology,
              topic: top.topic,
              subtopic: top.subtopic || null,
              status: top.status || "not-started",
              confidence: String(top.confidence || "3"),
              difficulty: top.difficulty || "medium",
              hoursStudied: Number(top.hoursStudied) || 0,
              scheduledDate: top.scheduledDate || null,
              scheduledTime: top.scheduledTime || null,
              notes: top.notes || null,
              needRevision: Boolean(top.needRevision),
              revisionSchedule: {
                create: Array.isArray(top.revisionSchedule)
                  ? top.revisionSchedule.map((rev: any) => ({
                      date: rev.date,
                      offsetDays: Number(rev.offsetDays) || 0,
                      done: Boolean(rev.done),
                      doneAt: rev.doneAt ? new Date(rev.doneAt) : null,
                      reviewCount: Number(rev.reviewCount) || 0,
                      source: rev.source || "system",
                      notes: rev.notes || null,
                    }))
                  : [],
              },
            },
          });
        }
      }
    });

    return NextResponse.json({ success: true, message: "Sync complete" });
  } catch (error) {
    console.error("POST /api/sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync local data to PostgreSQL" },
      { status: 500 },
    );
  }
}
