import "dotenv/config";
import { prisma } from "../lib/prisma";

async function testSignup() {
  console.log("=== TESTING SIGNUP QUERY DIRECTLY ===");

  const testEmail = `test_${Date.now()}@example.com`;
  const testName = "Test User";
  const testPassword = "Password123!";

  console.log("1. Checking connection & looking for existing user with email:", testEmail);
  try {
    const existing = await prisma.user.findUnique({
      where: { email: testEmail },
    });
    console.log("✓ findUnique succeeded. Found:", existing);
  } catch (err: any) {
    console.error("❌ findUnique failed!");
    console.error("Error name:", err.name);
    console.error("Error code:", err.code);
    console.error("Error message:", err.message);
    console.error("Full error:", err);
    return;
  }

  console.log("\n2. Attempting prisma.user.create with nested preference & revisionGoal...");
  try {
    const user = await prisma.user.create({
      data: {
        name: testName,
        email: testEmail,
        password: testPassword,
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

    console.log("✓ User created successfully:", user);

    // Clean up test user
    console.log("\n3. Cleaning up test user...");
    await prisma.user.delete({ where: { id: user.id } });
    console.log("✓ Cleaned up test user successfully.");
  } catch (err: any) {
    console.error("❌ prisma.user.create failed!");
    console.error("Error name:", err.name);
    console.error("Error code:", err.code);
    console.error("Error message:", err.message);
    console.error("Full error:", err);
  }
}

testSignup()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Fatal test error:", e);
    process.exit(1);
  });
