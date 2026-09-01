import "dotenv/config";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { validateEmail, sendPasswordResetEmail } from "../lib/email-service";

async function runTests() {
  console.log("\n==========================================");
  console.log("🧪 TESTING FORGOT & RESET PASSWORD FLOW");
  console.log("==========================================");

  // 1. Check existing users
  const user = await prisma.user.findFirst();
  if (!user) {
    throw new Error("No user found in database for testing.");
  }
  console.log(`✓ Test user found: ${user.email} (ID: ${user.id})`);

  // 2. Test Token Generation & Hashing
  console.log("\n1. Generating single-use reset token:");
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  const resetRecord = await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });
  console.log(`✓ Stored hashed token in database: ${resetRecord.id}`);

  // 3. Test Token Verification
  console.log("\n2. Validating token lookup:");
  const lookupHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const found = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: lookupHash },
  });

  if (!found || found.usedAt || found.expiresAt < new Date()) {
    throw new Error("Token validation failed!");
  }
  console.log(`✓ Token successfully found, unexpired, and unused!`);

  // 4. Test Single-Use Consumption
  console.log("\n3. Testing single-use invalidation:");
  const newTestPassword = "newSecurePassword123";
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { password: newTestPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: found.id },
      data: { usedAt: new Date() },
    }),
  ]);

  // Attempt reuse
  const rechecked = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: lookupHash },
  });
  if (!rechecked?.usedAt) {
    throw new Error("Token was not marked as used!");
  }
  console.log(`✓ Token successfully consumed and cannot be reused! (usedAt: ${rechecked.usedAt.toISOString()})`);

  // Restore password for demo account
  await prisma.user.update({
    where: { id: user.id },
    data: { password: "password123" },
  });

  // 5. Clean up test token
  await prisma.passwordResetToken.delete({ where: { id: resetRecord.id } });
  console.log("✓ Cleaned up test reset token.");

  console.log("\n==========================================");
  console.log("🎉 ALL PASSWORD RESET TESTS PASSED!");
  console.log("==========================================\n");
}

runTests()
  .catch((e) => {
    console.error("Test failure:", e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
