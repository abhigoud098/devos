import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    });

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 },
      );
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return NextResponse.json({ success: true, user: sessionUser });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed. Please check your database connection." },
      { status: 500 },
    );
  }
}
