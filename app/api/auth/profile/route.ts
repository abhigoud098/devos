import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

// GET /api/auth/profile - Fetch complete profile and preferences
export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userRecord = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        avatar: true,
        createdAt: true,
        preference: true,
      },
    });

    if (!userRecord) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // If no preference record exists yet, create default
    if (!userRecord.preference) {
      const defaultPref = await prisma.userPreference.create({
        data: {
          userId: userRecord.id,
          theme: "dark",
          skillLevel: "Intermediate",
          primaryGoal: "Placement Preparation",
          aiLanguage: "JavaScript/TypeScript",
          aiDifficulty: "Intermediate",
          aiResponseStyle: "Balanced",
          aiRecommendationsEnabled: true,
          dailyStudyTargetHours: 2.0,
          preferredStudyDurationMinutes: 45,
        },
      });
      userRecord = { ...userRecord, preference: defaultPref };
    }

    return NextResponse.json({
      user: {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        username: userRecord.username || "",
        phone: userRecord.phone || "",
        avatar: userRecord.avatar || "",
        createdAt: userRecord.createdAt,
      },
      preferences: userRecord.preference,
    });
  } catch (error) {
    console.error("GET /api/auth/profile error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve profile." },
      { status: 500 },
    );
  }
}

// PUT /api/auth/profile - Update profile and preferences
export async function PUT(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      name,
      username,
      phone,
      avatar,
      // Academic / Learning Profile
      education,
      fieldOfStudy,
      institution,
      graduationYear,
      currentSemester,
      skillLevel,
      primaryGoal,
      // AI Preferences
      aiLanguage,
      aiDifficulty,
      aiResponseStyle,
      aiRecommendationsEnabled,
      // Study Targets
      dailyStudyTargetHours,
      preferredStudyDurationMinutes,
      preferredTopics,
      // Email Notifications
      learningNotificationEmail,
      dailyLearningEmailEnabled,
      reminderMinutesBefore,
    } = body;

    const userUpdates: any = {};

    // 1. Validate and sanitize Name
    if (name !== undefined) {
      const cleanName = String(name).trim();
      if (cleanName.length < 2) {
        return NextResponse.json(
          { error: "Full Name must be at least 2 characters long." },
          { status: 400 },
        );
      }
      userUpdates.name = cleanName;
    }

    // 2. Validate and check uniqueness of Username
    if (username !== undefined) {
      const cleanUsername = String(username).trim().toLowerCase();
      if (cleanUsername !== "") {
        if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
          return NextResponse.json(
            { error: "Username must be 3-30 characters long and can only contain letters, numbers, and underscores." },
            { status: 400 },
          );
        }

        const existingUsername = await prisma.user.findFirst({
          where: {
            username: cleanUsername,
            id: { not: authUser.id },
          },
        });

        if (existingUsername) {
          return NextResponse.json(
            { error: "This username is already taken. Please choose another." },
            { status: 400 },
          );
        }

        userUpdates.username = cleanUsername;
      } else {
        userUpdates.username = null;
      }
    }

    // 3. Validate Phone
    if (phone !== undefined) {
      const cleanPhone = String(phone).trim();
      userUpdates.phone = cleanPhone || null;
    }

    if (avatar !== undefined) {
      userUpdates.avatar = typeof avatar === "string" ? avatar : null;
    }

    // 4. Update user record if any user fields provided
    let updatedUser = authUser;
    if (Object.keys(userUpdates).length > 0) {
      updatedUser = await prisma.user.update({
        where: { id: authUser.id },
        data: userUpdates,
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          phone: true,
          avatar: true,
          createdAt: true,
        },
      });
    }

    // 5. Update or create user preferences
    const prefUpdates: any = {};
    if (education !== undefined) prefUpdates.education = education || null;
    if (fieldOfStudy !== undefined) prefUpdates.fieldOfStudy = fieldOfStudy || null;
    if (institution !== undefined) prefUpdates.institution = institution || null;
    if (graduationYear !== undefined) prefUpdates.graduationYear = graduationYear || null;
    if (currentSemester !== undefined) prefUpdates.currentSemester = currentSemester || null;
    if (skillLevel !== undefined) prefUpdates.skillLevel = skillLevel || "Intermediate";
    if (primaryGoal !== undefined) prefUpdates.primaryGoal = primaryGoal || "Placement Preparation";

    if (aiLanguage !== undefined) prefUpdates.aiLanguage = aiLanguage || "JavaScript/TypeScript";
    if (aiDifficulty !== undefined) prefUpdates.aiDifficulty = aiDifficulty || "Intermediate";
    if (aiResponseStyle !== undefined) prefUpdates.aiResponseStyle = aiResponseStyle || "Balanced";
    if (aiRecommendationsEnabled !== undefined) {
      prefUpdates.aiRecommendationsEnabled = Boolean(aiRecommendationsEnabled);
    }

    if (dailyStudyTargetHours !== undefined) {
      const targetHours = Number(dailyStudyTargetHours);
      if (!isNaN(targetHours) && targetHours >= 0.5 && targetHours <= 24) {
        prefUpdates.dailyStudyTargetHours = targetHours;
      }
    }

    if (preferredStudyDurationMinutes !== undefined) {
      const durationMins = Number(preferredStudyDurationMinutes);
      if (!isNaN(durationMins) && durationMins >= 5 && durationMins <= 240) {
        prefUpdates.preferredStudyDurationMinutes = durationMins;
      }
    }

    if (preferredTopics !== undefined) prefUpdates.preferredTopics = preferredTopics || null;

    if (learningNotificationEmail !== undefined) {
      prefUpdates.learningNotificationEmail = learningNotificationEmail ? String(learningNotificationEmail).trim() : null;
    }
    if (dailyLearningEmailEnabled !== undefined) {
      prefUpdates.dailyLearningEmailEnabled = Boolean(dailyLearningEmailEnabled);
    }
    if (reminderMinutesBefore !== undefined) {
      const mins = Number(reminderMinutesBefore);
      if (!isNaN(mins) && mins > 0) {
        prefUpdates.reminderMinutesBefore = mins;
      }
    }

    const updatedPref = await prisma.userPreference.upsert({
      where: { userId: authUser.id },
      create: {
        userId: authUser.id,
        ...prefUpdates,
      },
      update: prefUpdates,
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      preferences: updatedPref,
      message: "Profile updated successfully.",
    });
  } catch (error) {
    console.error("PUT /api/auth/profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile." },
      { status: 500 },
    );
  }
}

// DELETE /api/auth/profile - Delete account with password confirmation
export async function DELETE(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Please enter your password to confirm account deletion." },
        { status: 400 },
      );
    }

    // Retrieve user's stored password
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Validate password match
    if (user.password !== password) {
      return NextResponse.json(
        { error: "Incorrect password. Account deletion cancelled." },
        { status: 400 },
      );
    }

    // Transactionally delete user and all cascading data
    await prisma.user.delete({
      where: { id: authUser.id },
    });

    return NextResponse.json({
      success: true,
      message: "Your DevOS account and all associated workspace data have been permanently deleted.",
    });
  } catch (error) {
    console.error("DELETE /api/auth/profile error:", error);
    return NextResponse.json(
      { error: "Failed to delete account. Please try again later." },
      { status: 500 },
    );
  }
}
