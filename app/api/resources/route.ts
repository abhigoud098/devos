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

    const resources = await prisma.resourceItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ resources });
  } catch (error) {
    console.error("GET /api/resources error:", error);
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, url, description, type = "Article", image } = body;

    if (!title || !url || !description) {
      return NextResponse.json(
        { error: "Title, url, and description are required." },
        { status: 400 },
      );
    }

    const resource = await prisma.resourceItem.create({
      data: {
        userId: user.id,
        title: title.trim(),
        url: url.trim(),
        description: description.trim(),
        type: type.trim(),
        image: image || null,
      },
    });

    return NextResponse.json({ success: true, resource }, { status: 201 });
  } catch (error) {
    console.error("POST /api/resources error:", error);
    return NextResponse.json({ error: "Failed to create resource" }, { status: 500 });
  }
}
