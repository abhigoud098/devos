import "dotenv/config";
import { prisma } from "../lib/prisma";

async function runProfileTests() {
  console.log("==========================================");
  console.log("🧪 RUNNING DEVOS PROFILE & SAAS TEST SUITE");
  console.log("==========================================");

  // 1. Fetch test user
  const user = await prisma.user.findFirst({
    include: { preference: true },
  });

  if (!user) {
    console.error("❌ No test user found in database.");
    process.exit(1);
  }

  console.log(`✓ Test user found: ${user.email} (ID: ${user.id})`);

  // 2. Test User Update with username & phone
  console.log("\n1. Testing User Info Update (Name, Username, Phone):");
  const testUsername = `dev_${Date.now().toString().slice(-6)}`;
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: "Student User",
      username: testUsername,
      phone: "+91 98765 43210",
    },
  });

  if (updatedUser.username === testUsername && updatedUser.phone === "+91 98765 43210") {
    console.log(`  ✓ Username and phone updated successfully: @${testUsername}`);
  } else {
    throw new Error("Failed to update user profile fields.");
  }

  // 3. Test Academic / Learning Profile Update
  console.log("\n2. Testing Academic Profile Fields:");
  const pref = await prisma.userPreference.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      education: "B.Tech / B.E.",
      fieldOfStudy: "Computer Science & Engineering",
      institution: "Indian Institute of Technology",
      graduationYear: "2026",
      currentSemester: "6th Semester",
      skillLevel: "Advanced",
      primaryGoal: "Placement Preparation",
    },
    update: {
      education: "B.Tech / B.E.",
      fieldOfStudy: "Computer Science & Engineering",
      institution: "Indian Institute of Technology",
      graduationYear: "2026",
      currentSemester: "6th Semester",
      skillLevel: "Advanced",
      primaryGoal: "Placement Preparation",
    },
  });

  if (pref.institution === "Indian Institute of Technology" && pref.skillLevel === "Advanced") {
    console.log("  ✓ Academic profile persisted successfully!");
  } else {
    throw new Error("Failed to persist academic profile.");
  }

  // 4. Test AI Preferences
  console.log("\n3. Testing AI Assistant Preferences:");
  const aiPref = await prisma.userPreference.update({
    where: { userId: user.id },
    data: {
      aiLanguage: "JavaScript / TypeScript",
      aiDifficulty: "Advanced",
      aiResponseStyle: "Concise",
      aiRecommendationsEnabled: true,
    },
  });

  if (aiPref.aiResponseStyle === "Concise" && aiPref.aiDifficulty === "Advanced") {
    console.log("  ✓ AI Preferences (Language, Difficulty, Response Style) persisted successfully!");
  } else {
    throw new Error("Failed to persist AI preferences.");
  }

  // 5. Test Learning Targets & Study Preferences
  console.log("\n4. Testing Learning Targets & Study Duration:");
  const targetPref = await prisma.userPreference.update({
    where: { userId: user.id },
    data: {
      dailyStudyTargetHours: 3.5,
      preferredStudyDurationMinutes: 60,
      preferredTopics: "DSA, System Design, React",
    },
  });

  if (targetPref.dailyStudyTargetHours === 3.5 && targetPref.preferredStudyDurationMinutes === 60) {
    console.log("  ✓ Learning targets (3.5 hours, 60 mins duration) persisted successfully!");
  } else {
    throw new Error("Failed to persist study targets.");
  }

  // 6. Test Email Notification Settings
  console.log("\n5. Testing Notification Settings Integration:");
  const emailPref = await prisma.userPreference.update({
    where: { userId: user.id },
    data: {
      learningNotificationEmail: "student.dev@gmail.com",
      dailyLearningEmailEnabled: true,
      reminderMinutesBefore: 15,
    },
  });

  if (emailPref.learningNotificationEmail === "student.dev@gmail.com" && emailPref.reminderMinutesBefore === 15) {
    console.log("  ✓ Email notification settings (student.dev@gmail.com, 15 mins) persisted successfully!");
  } else {
    throw new Error("Failed to persist notification settings.");
  }

  // 7. Verify Uniqueness check on username
  console.log("\n6. Testing Username Uniqueness Constraint:");
  try {
    // Attempt duplicate username with different dummy user ID
    await prisma.user.create({
      data: {
        id: "dummy-unique-test-user-id",
        name: "Duplicate Tester",
        email: "duplicate.tester@devos.test",
        password: "testpassword",
        username: testUsername, // duplicate username
      },
    });
    console.error("❌ Failed: Duplicate username was allowed!");
    process.exit(1);
  } catch (err: any) {
    console.log("  ✓ Duplicate username properly rejected by unique constraint!");
  }

  console.log("\n==========================================");
  console.log("🎉 ALL PROFILE & PREFERENCE TESTS PASSED!");
  console.log("==========================================");
}

runProfileTests()
  .catch((e) => {
    console.error("Test failure:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
