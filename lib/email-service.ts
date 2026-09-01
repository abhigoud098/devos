import nodemailer from "nodemailer";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

export interface LearningTaskItem {
  id: string;
  technology: string;
  topic: string;
  subtopic?: string | null;
  status: string;
  scheduledTime?: string | null;
  type: "scheduled" | "revision";
}

/**
 * Validates whether an email string is well-formed.
 */
export function validateEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 254) return false;
  // Standard strict email regex rejecting double @, missing domain, spaces
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(trimmed);
}

/**
 * Returns today's date formatted as YYYY-MM-DD in the specified timezone (default: Asia/Kolkata).
 */
export function getTodayDateString(timeZone: string = "Asia/Kolkata"): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(new Date());
  } catch {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  }
}

/**
 * Returns the current time in HH:mm (24-hour) in the specified timezone.
 */
export function getCurrentTimeString(timeZone: string = "Asia/Kolkata"): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return formatter.format(new Date());
  } catch {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  }
}

/**
 * Formats YYYY-MM-DD into "Month DD, YYYY" (e.g. September 1, 2026).
 */
export function formatHumanDate(dateStr: string, timeZone: string = "Asia/Kolkata"): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Formats HH:mm (24-hr) to 12-hour AM/PM string (e.g. 19:00 -> 7:00 PM).
 */
export function formatHumanTime(timeStr?: string | null): string {
  if (!timeStr) return "Scheduled Time";
  try {
    const [h, m] = timeStr.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    return `${displayHour}:${String(m).padStart(2, "0")} ${period}`;
  } catch {
    return timeStr;
  }
}

/**
 * Unified email sender supporting Resend (API key) and Nodemailer (SMTP).
 */
export async function sendEmailMessage({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // 1. Try Resend if RESEND_API_KEY is configured
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const from = process.env.EMAIL_FROM || "DevOS <onboarding@resend.dev>";
      const result = await resend.emails.send({
        from,
        to,
        subject,
        text,
        html,
      });

      if (result.error) {
        console.error("Resend API error:", result.error);
        return { success: false, error: result.error.message };
      }

      return { success: true, messageId: result.data?.id };
    } catch (err: any) {
      console.error("Resend send failed:", err);
      return { success: false, error: err?.message || "Failed to send email via Resend" };
    }
  }

  // 2. Fallback to Nodemailer SMTP
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT) || 587;
  const userAuth = process.env.EMAIL_USER;
  const passAuth = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
  const from = process.env.EMAIL_FROM || (userAuth ? `DevOS <${userAuth}>` : "DevOS <no-reply@devos.dev>");

  if (host && userAuth && passAuth) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user: userAuth,
          pass: passAuth,
        },
      });

      const info = await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });

      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.error("SMTP send failed:", err);
      return { success: false, error: err?.message || "Failed to send email via SMTP" };
    }
  }

  return {
    success: false,
    error: "No email provider configured. Please set RESEND_API_KEY or EMAIL_HOST / EMAIL_USER / EMAIL_PASSWORD in .env.",
  };
}

/**
 * Builds the Individual Study Reminder email.
 */
export function buildStudyReminderEmail({
  userName,
  taskTitle,
  technology,
  scheduledTime,
  notes,
  minutesBefore = 10,
}: {
  userName: string;
  taskTitle: string;
  technology: string;
  scheduledTime?: string | null;
  notes?: string | null;
  minutesBefore?: number;
}): { subject: string; text: string; html: string } {
  const subject = "DevOS — Study Reminder";
  const formattedTime = formatHumanTime(scheduledTime);
  const description = notes ? notes.slice(0, 300) : `Scheduled study session for ${technology} - ${taskTitle}.`;
  const goal = `Complete ${technology} ${taskTitle} study session.`;

  const text = `📚 DevOS Study Reminder

Your study session starts in ${minutesBefore} minutes.

Task:
${taskTitle}

Technology:
${technology}

Scheduled Time:
${formattedTime}

Description:
${description}

Goal:
${goal}

Open DevOS to start your study session.

— DevOS Workspace`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0e14; color: #e2e8f0; margin: 0; padding: 20px; }
    .card { max-width: 520px; margin: 0 auto; background-color: #151823; border: 1px solid #242b3d; border-radius: 14px; padding: 28px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .badge { display: inline-block; background-color: rgba(99, 102, 241, 0.15); color: #818cf8; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
    .title { font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0; }
    .subtitle { font-size: 15px; color: #94a3b8; margin: 0 0 24px 0; }
    .box { background-color: #0d111a; border: 1px solid #1e2538; border-radius: 10px; padding: 18px; margin-bottom: 20px; }
    .field-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .field-value { font-size: 15px; font-weight: 600; color: #f8fafc; margin-bottom: 14px; }
    .field-value:last-child { margin-bottom: 0; }
    .highlight { color: #60a5fa; font-weight: 700; }
    .btn-container { text-align: center; margin: 28px 0 12px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; }
    .footer { font-size: 12px; color: #475569; border-top: 1px solid #1e2538; padding-top: 16px; margin-top: 24px; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">📚 Study Reminder</div>
    <h1 class="title">Upcoming Study Session</h1>
    <p class="subtitle">Your scheduled session starts in <strong>${minutesBefore} minutes</strong>.</p>

    <div class="box">
      <div class="field-label">Task</div>
      <div class="field-value">${technology} — ${taskTitle}</div>

      <div class="field-label">Scheduled Time</div>
      <div class="field-value highlight">${formattedTime}</div>

      <div class="field-label">Description</div>
      <div class="field-value" style="font-size: 14px; color: #cbd5e1; font-weight: normal;">${description}</div>

      <div class="field-label">Goal</div>
      <div class="field-value" style="font-size: 14px; color: #cbd5e1; font-weight: normal;">${goal}</div>
    </div>

    <div class="btn-container">
      <a href="http://localhost:3000/learning" class="btn">Open DevOS & Start Studying</a>
    </div>

    <div class="footer">
      DevOS — Your personal developer second brain
    </div>
  </div>
</body>
</html>`;

  return { subject, text, html };
}

/**
 * Sends a study task reminder for a specific task.
 * Enforces duplicate protection, status validation, and recipient verification.
 */
export async function sendStudyTaskReminder(
  taskId: string,
  timeZone: string = "Asia/Kolkata",
): Promise<{ success: boolean; taskId: string; recipient?: string; message: string }> {
  // 1. Load the task with user and preference
  const task = await prisma.learningTopic.findUnique({
    where: { id: taskId },
    include: {
      user: {
        include: {
          preference: true,
        },
      },
    },
  });

  if (!task) {
    return { success: false, taskId, message: "Task not found." };
  }

  // 2. Status check: Only active/pending/in-progress tasks
  if (task.status === "completed") {
    return { success: false, taskId, message: "Task is already completed. Skipping reminder." };
  }

  // 3. Duplicate check: Never send if already marked sent
  if (task.reminderSentAt) {
    return { success: false, taskId, message: "Reminder has already been sent for this task." };
  }

  // 4. User preference check
  const preference = task.user?.preference;
  if (!preference?.dailyLearningEmailEnabled) {
    return { success: false, taskId, message: "Email notifications are disabled by the user." };
  }

  const recipient = preference.learningNotificationEmail;
  if (!recipient || !validateEmail(recipient)) {
    return { success: false, taskId, message: "Valid notification email is not configured." };
  }

  // 5. Build email
  const { subject, text, html } = buildStudyReminderEmail({
    userName: task.user.name || "Student",
    taskTitle: task.topic,
    technology: task.technology,
    scheduledTime: task.scheduledTime,
    notes: task.notes,
    minutesBefore: preference.reminderMinutesBefore || 10,
  });

  // 6. Send email
  const result = await sendEmailMessage({
    to: recipient,
    subject,
    text,
    html,
  });

  if (!result.success) {
    console.error(`Failed to send reminder for task ${taskId}:`, result.error);
    return {
      success: false,
      taskId,
      recipient,
      message: result.error || "Email delivery failed.",
    };
  }

  // 7. Mark reminderSentAt ONLY after successful send
  await prisma.learningTopic.update({
    where: { id: taskId },
    data: { reminderSentAt: new Date() },
  });

  return {
    success: true,
    taskId,
    recipient,
    message: `Reminder sent to ${recipient}.`,
  };
}

/**
 * Server-side cron runner: checks all active tasks scheduled for today
 * whose reminder time is due (scheduledTime - reminderMinutesBefore), and sends reminders.
 */
export async function checkAndSendDueReminders(options?: {
  timeZone?: string;
}): Promise<{ checkedCount: number; sentCount: number; skippedCount: number; results: any[] }> {
  const timeZone = options?.timeZone || "Asia/Kolkata";
  const todayStr = getTodayDateString(timeZone);
  const currentTimeStr = getCurrentTimeString(timeZone);

  // Parse current time in minutes from midnight
  const [currentH, currentM] = currentTimeStr.split(":").map(Number);
  const currentTotalMinutes = currentH * 60 + currentM;

  // Find all active topics scheduled for today with unsent reminders
  const candidateTopics = await prisma.learningTopic.findMany({
    where: {
      scheduledDate: todayStr,
      status: { not: "completed" },
      reminderSentAt: null,
      scheduledTime: { not: null },
      user: {
        preference: {
          dailyLearningEmailEnabled: true,
          learningNotificationEmail: { not: null },
        },
      },
    },
    include: {
      user: {
        include: {
          preference: true,
        },
      },
    },
  });

  let sentCount = 0;
  let skippedCount = 0;
  const results: any[] = [];

  for (const topic of candidateTopics) {
    if (!topic.scheduledTime) continue;

    const [taskH, taskM] = topic.scheduledTime.split(":").map(Number);
    const taskTotalMinutes = taskH * 60 + taskM;
    const reminderMinutesBefore = topic.user?.preference?.reminderMinutesBefore || 10;

    const targetReminderMinute = taskTotalMinutes - reminderMinutesBefore;

    // Check if the current time is within the reminder window:
    // e.g. current time is at or past the reminder time (targetReminderMinute)
    // but not excessively late (within 30 minutes after scheduled time)
    if (currentTotalMinutes >= targetReminderMinute && currentTotalMinutes <= taskTotalMinutes + 30) {
      const sendRes = await sendStudyTaskReminder(topic.id, timeZone);
      results.push(sendRes);
      if (sendRes.success) {
        sentCount++;
      } else {
        skippedCount++;
      }
    } else {
      skippedCount++;
    }
  }

  return {
    checkedCount: candidateTopics.length,
    sentCount,
    skippedCount,
    results,
  };
}

/**
 * Sends a summary of today's learning tasks to the user's notification email.
 */
export async function sendTodaysLearningTasksEmail(
  userId: string,
  timeZone: string = "Asia/Kolkata",
): Promise<{ success: boolean; count: number; email: string; message: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { preference: true },
  });

  if (!user) {
    return { success: false, count: 0, email: "", message: "User not found." };
  }

  const recipient = user.preference?.learningNotificationEmail || user.email;
  if (!recipient || !validateEmail(recipient)) {
    return {
      success: false,
      count: 0,
      email: "",
      message: "Please configure your notification email first.",
    };
  }

  const todayStr = getTodayDateString(timeZone);
  const tasks = await prisma.learningTopic.findMany({
    where: {
      userId,
      scheduledDate: todayStr,
      status: { not: "completed" },
    },
    select: {
      id: true,
      technology: true,
      topic: true,
      subtopic: true,
      status: true,
      scheduledTime: true,
    },
    orderBy: [{ scheduledTime: "asc" }, { technology: "asc" }],
  });

  const formattedDate = formatHumanDate(todayStr, timeZone);
  const subject =
    tasks.length > 0 ? "DevOS — Today's Learning Tasks" : "DevOS — No Learning Tasks Today";

  let text = `DevOS\nToday's Learning Tasks\n\nDate: ${formattedDate}\n\n`;
  if (tasks.length === 0) {
    text += `You don't have any learning tasks scheduled for today.\n\nUse this time to revise previous topics or plan your next learning goals.\n\n— DevOS Workspace`;
  } else {
    text += `Your tasks for today:\n\n`;
    tasks.forEach((t) => {
      text += `□ ${t.technology} — ${t.topic}${t.scheduledTime ? ` (${t.scheduledTime})` : ""}\n`;
    });
    text += `\nTotal Tasks: ${tasks.length}\n\nStay focused and complete today's learning goals.\n\n— DevOS Workspace`;
  }

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0c0e14; color: #e2e8f0; margin: 0; padding: 24px;">
  <div style="max-width: 540px; margin: 0 auto; background-color: #151823; border: 1px solid #242b3d; border-radius: 12px; padding: 28px;">
    <h2 style="color: #60a5fa; margin: 0 0 4px 0;">DevOS</h2>
    <h1 style="font-size: 20px; color: #ffffff; margin: 0 0 12px 0;">Today's Learning Tasks</h1>
    <div style="display: inline-block; background-color: #1e293b; color: #94a3b8; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 6px; margin-bottom: 20px;">
      Date: ${formattedDate}
    </div>

    ${
      tasks.length === 0
        ? `<p style="color: #cbd5e1;">You don't have any learning tasks scheduled for today.</p>`
        : `
        <ul style="padding-left: 0; margin: 16px 0; list-style: none;">
          ${tasks
            .map(
              (t) => `
            <li style="margin-bottom: 10px; padding: 10px 14px; background-color: #1e2433; border: 1px solid #2d3748; border-radius: 8px;">
              <span style="color: #60a5fa; margin-right: 8px;">□</span>
              <strong style="color: #ffffff;">${t.technology}</strong>
              <span style="color: #94a3b8;"> — ${t.topic}</span>
              ${
                t.scheduledTime
                  ? `<span style="font-size: 11px; background-color: #0f172a; color: #93c5fd; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">${t.scheduledTime}</span>`
                  : ""
              }
            </li>`,
            )
            .join("")}
        </ul>
        <div style="background-color: #0d111a; border: 1px solid #1e2538; border-radius: 8px; padding: 12px 16px; margin-top: 20px; font-weight: 600;">
          Total Tasks: <span style="color: #60a5fa;">${tasks.length}</span>
        </div>`
    }

    <p style="font-size: 13px; color: #94a3b8; margin-top: 24px; text-align: center; font-style: italic;">
      Stay focused and complete today's learning goals.
    </p>
    <div style="font-size: 11px; color: #475569; border-top: 1px solid #242b3d; padding-top: 14px; margin-top: 20px; text-align: center;">
      DevOS — Your personal developer second brain
    </div>
  </div>
</body>
</html>`;

  const sendRes = await sendEmailMessage({
    to: recipient,
    subject,
    text,
    html,
  });

  if (!sendRes.success) {
    return {
      success: false,
      count: tasks.length,
      email: recipient,
      message: sendRes.error || "Failed to deliver email.",
    };
  }

  return {
    success: true,
    count: tasks.length,
    email: recipient,
    message: `Today's learning tasks were sent successfully to ${recipient}.`,
  };
}

/**
 * Sends a secure password reset email with a single-use token link.
 */
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const subject = "Reset your DevOS password";

  const text = `Hi,

We received a request to reset your DevOS password.

Click the link below to create a new password:
${resetUrl}

This link expires in 1 hour.

If you did not request this, you can safely ignore this email.

Thanks,
DevOS Team`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0e14; color: #e2e8f0; margin: 0; padding: 24px; }
    .card { max-width: 520px; margin: 0 auto; background-color: #151823; border: 1px solid #242b3d; border-radius: 12px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .badge { display: inline-block; background-color: rgba(99, 102, 241, 0.15); color: #818cf8; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }
    .title { font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 12px 0; }
    .text { font-size: 14px; line-height: 1.6; color: #cbd5e1; margin-bottom: 24px; }
    .btn-container { text-align: center; margin: 30px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 13px 32px; border-radius: 8px; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35); }
    .link-alt { font-size: 12px; color: #94a3b8; word-break: break-all; margin-top: 20px; }
    .footer { font-size: 12px; color: #475569; border-top: 1px solid #242b3d; padding-top: 18px; margin-top: 28px; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Security</div>
    <h1 class="title">Reset your DevOS password</h1>
    <p class="text">Hi,</p>
    <p class="text">We received a request to reset your DevOS password. Click the button below to create a new password:</p>

    <div class="btn-container">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </div>

    <p class="text" style="font-size: 13px; color: #94a3b8;">
      This link will expire in <strong>1 hour</strong>.
    </p>

    <p class="text" style="font-size: 13px; color: #64748b;">
      If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
    </p>

    <div class="link-alt">
      Or copy this link to your browser:<br/>
      <a href="${resetUrl}" style="color: #60a5fa;">${resetUrl}</a>
    </div>

    <div class="footer">
      DevOS Workspace • Your personal developer second brain
    </div>
  </div>
</body>
</html>`;

  return sendEmailMessage({
    to: email,
    subject,
    text,
    html,
  });
}
