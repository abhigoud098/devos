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

    let pref = await prisma.userPreference.findUnique({
      where: { userId: user.id },
    });

    if (!pref) {
      pref = await prisma.userPreference.create({
        data: {
          userId: user.id,
          theme: "dark",
          dimMode: false,
        },
      });
    }

    return NextResponse.json({ preferences: pref });
  } catch (error) {
    console.error("GET /api/preferences error:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { theme, dimMode } = body;

    const pref = await prisma.userPreference.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        theme: theme || "dark",
        dimMode: Boolean(dimMode),
      },
      update: {
        ...(theme !== undefined && { theme }),
        ...(dimMode !== undefined && { dimMode: Boolean(dimMode) }),
      },
    });

    return NextResponse.json({ success: true, preferences: pref });
  } catch (error) {
    console.error("PUT /api/preferences error:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 },
    );
  }
}
