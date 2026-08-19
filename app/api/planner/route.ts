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

    const tasks = await prisma.plannerTask.findMany({
      where: { userId: user.id },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("GET /api/planner error:", error);
    return NextResponse.json({ error: "Failed to fetch planner tasks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, date, hours = "1", status = "Pending", image } = body;

    if (!title || !description || !date) {
      return NextResponse.json(
        { error: "Title, description, and date are required." },
        { status: 400 },
      );
    }

    const task = await prisma.plannerTask.create({
      data: {
        userId: user.id,
        title: title.trim(),
        description: description.trim(),
        date: date.trim(),
        hours: String(hours),
        status,
        image: image || null,
      },
    });

    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (error) {
    console.error("POST /api/planner error:", error);
    return NextResponse.json({ error: "Failed to create planner task" }, { status: 500 });
  }
}
