import { prisma } from "@/lib/prisma";

export interface ServerUser {
  id: string;
  name: string;
  email: string;
}

/**
 * Resolves the authenticated user from the incoming request.
 * Checks Authorization header, x-user-id header, or provides a fallback demo user.
 */
export async function getAuthUser(req: Request): Promise<ServerUser | null> {
  try {
    const authHeader = req.headers.get("authorization");
    const customUserId = req.headers.get("x-user-id");

    let userId: string | null = null;

    if (customUserId) {
      userId = customUserId.trim();
    } else if (authHeader && authHeader.startsWith("Bearer ")) {
      const raw = authHeader.replace("Bearer ", "").trim();
      // Token format may be `userId.timestamp.random` or just `userId`
      if (raw.includes(".")) {
        userId = raw.split(".")[0];
      } else {
        userId = raw;
      }
    }

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true },
      });

      if (user) {
        return user;
      }
    }

    // If no userId header or user not found, find or create default demo user
    let defaultUser = await prisma.user.findFirst({
      select: { id: true, name: true, email: true },
    });

    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: {
          name: "Developer",
          email: "developer@devos.dev",
          password: "password123",
        },
        select: { id: true, name: true, email: true },
      });
    }

    return defaultUser;
  } catch (error) {
    console.error("Auth verification error:", error);
    return null;
  }
}
