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

    const existing = await prisma.resourceItem.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const body = await req.json();
    const { title, url, description, type, image } = body;

    const updated = await prisma.resourceItem.update({
      where: { id: params.id },
      data: {
        ...(title && { title: title.trim() }),
        ...(url && { url: url.trim() }),
        ...(description && { description: description.trim() }),
        ...(type && { type: type.trim() }),
        image: image !== undefined ? image || null : existing.image,
      },
    });

    return NextResponse.json({ success: true, resource: updated });
  } catch (error) {
    console.error("PUT /api/resources/[id] error:", error);
    return NextResponse.json({ error: "Failed to update resource" }, { status: 500 });
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

    const existing = await prisma.resourceItem.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    await prisma.resourceItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Resource deleted" });
  } catch (error) {
    console.error("DELETE /api/resources/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 });
  }
}
