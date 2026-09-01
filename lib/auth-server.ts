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

    if (!userId) {
      const cookieHeader = req.headers.get("cookie");
      if (cookieHeader) {
        const cookies = Object.fromEntries(
          cookieHeader.split(";").map((c) => {
            const [k, ...v] = c.trim().split("=");
            return [k, decodeURIComponent(v.join("="))];
          }),
        );
        if (cookies.auth_token) {
          const raw = cookies.auth_token.trim();
          userId = raw.includes(".") ? raw.split(".")[0] : raw;
        } else if (cookies.auth_user) {
          try {
            const parsed = JSON.parse(cookies.auth_user);
            if (parsed.id) userId = parsed.id;
          } catch {}
        }
      }
    }

    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (user) {
      return user;
    }

    return null;
  } catch (error) {
    console.error("Auth verification error:", error);
    return null;
  }
}
