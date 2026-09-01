import "dotenv/config";
import { prisma } from "../lib/prisma";
import {
  validateEmail,
  getTodayDateString,
  getCurrentTimeString,
  formatHumanTime,
  buildStudyReminderEmail,
  checkAndSendDueReminders,
} from "../lib/email-service";
import { buildStudentContext, generateAIResponse } from "../lib/ai-service";

async function runTests() {
  console.log("\n==========================================");
  console.log("🧪 RUNNING DEVOS FEATURE TEST SUITE");
  console.log("==========================================");

  // 1. Test Email Validation
  console.log("\n1. Testing Email Validation:");
  const validEmails = ["user@gmail.com", "student.work@company.co.in", "student.user@example.com"];
  const invalidEmails = ["user@", "@gmail.com", "user", "user@@gmail.com", "", "   ", "user @domain.com"];

  for (const email of validEmails) {
    const isValid = validateEmail(email);
    console.log(`  ✓ Valid email [${email}]:`, isValid ? "PASS" : "FAIL");
    if (!isValid) throw new Error(`Expected ${email} to be valid`);
  }

  for (const email of invalidEmails) {
    const isValid = validateEmail(email);
    console.log(`  ✓ Invalid email [${email}]:`, !isValid ? "PASS (Correctly rejected)" : "FAIL");
    if (isValid) throw new Error(`Expected ${email} to be invalid`);
  }

  // 2. Test Timezone & Time Formatting
  console.log("\n2. Testing Timezone & Formatters (Asia/Kolkata):");
  const todayStr = getTodayDateString("Asia/Kolkata");
  const timeStr = getCurrentTimeString("Asia/Kolkata");
  console.log(`  ✓ Today in IST: ${todayStr}`);
  console.log(`  ✓ Current time in IST: ${timeStr}`);
  console.log(`  ✓ 19:00 formatted: ${formatHumanTime("19:00")}`);
  console.log(`  ✓ 08:30 formatted: ${formatHumanTime("08:30")}`);

  // 3. Test Study Reminder Template
  console.log("\n3. Testing Study Reminder Email Template:");
  const emailTemplate = buildStudyReminderEmail({
    userName: "Abhishek",
    taskTitle: "Study Java Collections",
    technology: "Java",
    scheduledTime: "19:00",
    notes: "Revise ArrayList, HashMap and HashSet.",
    minutesBefore: 10,
  });
  console.log(`  ✓ Subject: ${emailTemplate.subject}`);
  console.log(`  ✓ Text Preview:\n${emailTemplate.text.split("\n").map(l => "    " + l).join("\n")}`);

  // 4. Test User & Preferences in Database
  console.log("\n4. Testing User and Preferences in Supabase:");
  const users = await prisma.user.findMany({
    include: { preference: true },
  });
  console.log(`  ✓ Found ${users.length} users in Supabase:`, users.map(u => ({ email: u.email, id: u.id })));

  if (users.length > 0) {
    const testUser = users[0];

    // Ensure preference exists
    const pref = await prisma.userPreference.upsert({
      where: { userId: testUser.id },
      create: {
        userId: testUser.id,
        learningNotificationEmail: "student.work@gmail.com",
        dailyLearningEmailEnabled: true,
        reminderMinutesBefore: 10,
      },
      update: {
        learningNotificationEmail: "student.work@gmail.com",
        dailyLearningEmailEnabled: true,
        reminderMinutesBefore: 10,
      },
    });
    console.log(`  ✓ Updated test user preference:`, {
      email: pref.learningNotificationEmail,
      enabled: pref.dailyLearningEmailEnabled,
      reminderMinutes: pref.reminderMinutesBefore,
    });

    // 5. Test AI Context Builder
    console.log("\n5. Testing AI Personalized Context Builder:");
    const todayContext = await buildStudentContext(testUser.id, "What should I study today?");
    console.log(`  ✓ Intent: ${todayContext.intent}`);
    console.log(`  ✓ Generated Context:\n${todayContext.contextText.split("\n").map(l => "    " + l).join("\n")}`);

    const dsaContext = await buildStudentContext(testUser.id, "Give me a DSA problem to practice");
    console.log(`  ✓ Intent: ${dsaContext.intent}`);
    console.log(`  ✓ DSA Context:\n${dsaContext.contextText.split("\n").map(l => "    " + l).join("\n")}`);

    // 6. Test AI Generation
    console.log("\n6. Testing AI Generation Function:");
    const aiResult = await generateAIResponse({
      userId: testUser.id,
      message: "What should I study today?",
    });
    console.log(`  ✓ AI Response Intent: ${aiResult.intent}`);
    console.log(`  ✓ AI Response:\n${aiResult.response.slice(0, 300)}...`);

    // 7. Test Cron Due Reminders Check
    console.log("\n7. Testing Cron Due Reminders Check:");
    const cronResult = await checkAndSendDueReminders({ timeZone: "Asia/Kolkata" });
    console.log(`  ✓ Cron execution result:`, cronResult);
  }

  console.log("\n==========================================");
  console.log("🎉 ALL TESTS COMPLETED SUCCESSFULLY!");
  console.log("==========================================\n");
}

runTests()
  .catch((e) => {
    console.error("Test failure:", e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
