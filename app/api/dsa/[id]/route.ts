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

    const existing = await prisma.dSAProblem.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      name,
      number,
      pattern,
      method,
      difficulty,
      status,
      struggle,
      learning,
      revision,
      image,
    } = body;

    const updated = await prisma.dSAProblem.update({
      where: { id: params.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(number !== undefined && { number: String(number) }),
        ...(pattern && { pattern: pattern.trim() }),
        ...(method && { method: method.trim() }),
        ...(difficulty && { difficulty }),
        ...(status && { status }),
        ...(struggle !== undefined && { struggle }),
        ...(learning !== undefined && { learning }),
        ...(revision && {
          revisionEnabled: Boolean(revision.enabled),
          revisionDate: revision.date || null,
          revisionInterval: revision.interval || null,
          revisionNotes: revision.notes || null,
          revisionDone: Boolean(revision.done),
        }),
        image: image !== undefined ? image || null : existing.image,
      },
    });

    return NextResponse.json({ success: true, problem: updated });
  } catch (error) {
    console.error("PUT /api/dsa/[id] error:", error);
    return NextResponse.json({ error: "Failed to update problem" }, { status: 500 });
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

    const existing = await prisma.dSAProblem.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    await prisma.dSAProblem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Problem deleted" });
  } catch (error) {
    console.error("DELETE /api/dsa/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete problem" }, { status: 500 });
  }
}
