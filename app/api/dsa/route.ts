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

    const problems = await prisma.dSAProblem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ problems });
  } catch (error) {
    console.error("GET /api/dsa error:", error);
    return NextResponse.json({ error: "Failed to fetch DSA problems" }, { status: 500 });
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
      name,
      number = "",
      pattern = "Arrays",
      method = "Two Pointer",
      difficulty = "Medium",
      status = "Solved",
      struggle = "",
      learning = "",
      revision,
      image,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Problem name is required." },
        { status: 400 },
      );
    }

    const problem = await prisma.dSAProblem.create({
      data: {
        userId: user.id,
        name: name.trim(),
        number: String(number || ""),
        pattern: pattern.trim(),
        method: method.trim(),
        difficulty: difficulty.trim(),
        status: status.trim(),
        struggle: struggle.trim(),
        learning: learning.trim(),
        revisionEnabled: Boolean(revision?.enabled),
        revisionDate: revision?.date || null,
        revisionInterval: revision?.interval || null,
        revisionNotes: revision?.notes || null,
        revisionDone: Boolean(revision?.done),
        image: image || null,
      },
    });

    return NextResponse.json({ success: true, problem }, { status: 201 });
  } catch (error) {
    console.error("POST /api/dsa error:", error);
    return NextResponse.json({ error: "Failed to create DSA problem" }, { status: 500 });
  }
}
