import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 },
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 },
      );
    }

    const user = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password, // In a production setup, bcrypt/argon2 hashing can be applied
        preference: {
          create: {
            theme: "dark",
            dimMode: false,
          },
        },
        revisionGoal: {
          create: {
            dailyTarget: 5,
            weeklyTarget: 30,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please check your database connection." },
      { status: 500 },
    );
  }
}
