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

    const existing = await prisma.plannerTask.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const body = await req.json();
    const { title, description, date, hours, status, image } = body;

    const updated = await prisma.plannerTask.update({
      where: { id: params.id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description && { description: description.trim() }),
        ...(date && { date: date.trim() }),
        ...(hours !== undefined && { hours: String(hours) }),
        ...(status && { status }),
        image: image !== undefined ? image || null : existing.image,
      },
    });

    return NextResponse.json({ success: true, task: updated });
  } catch (error) {
    console.error("PUT /api/planner/[id] error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
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

    const existing = await prisma.plannerTask.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.plannerTask.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Task deleted" });
  } catch (error) {
    console.error("DELETE /api/planner/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
