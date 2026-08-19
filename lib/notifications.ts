import { format, isBefore, isSameDay, isToday, isTomorrow, parseISO, startOfDay } from "date-fns";
import type { LearningTopic } from "./types";
import { db } from "./db";
import { markRevisionDone } from "./learning-repo";

export interface NotificationItem {
  id: string;
  topicId: string;
  title: string;
  technology: string;
  subtopic?: string;
  type: "topic-schedule" | "revision";
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime?: string; // HH:mm or undefined
  status: "due-today" | "overdue" | "upcoming" | "completed";
  isDone: boolean;
  notes?: string;
  difficulty?: string;
  confidence?: number | "NA";
  revisionEntryId?: string;
}

export interface DayGroupedNotifications {
  date: string;
  displayDate: string;
  relativeLabel: string;
  isToday: boolean;
  isTomorrow: boolean;
  isPast: boolean;
  items: NotificationItem[];
}

export interface TopicNotificationsSummary {
  all: NotificationItem[];
  dueToday: NotificationItem[];
  overdue: NotificationItem[];
  upcoming: NotificationItem[];
  completed: NotificationItem[];
  groupedByDay: DayGroupedNotifications[];
}

export function getTopicNotifications(
  topics: LearningTopic[],
  referenceDate = new Date(),
): TopicNotificationsSummary {
  const today = startOfDay(referenceDate);
  const items: NotificationItem[] = [];

  topics.forEach((topic) => {
    // 1. Scheduled Topic Study Task
    if (topic.scheduledDate) {
      try {
        const itemDate = parseISO(topic.scheduledDate);
        const isDone = topic.status === "completed";
        let status: NotificationItem["status"] = "upcoming";

        if (isDone) {
          status = "completed";
        } else if (isSameDay(itemDate, today)) {
          status = "due-today";
        } else if (isBefore(itemDate, today)) {
          status = "overdue";
        } else {
          status = "upcoming";
        }

        items.push({
          id: `topic-${topic.id}`,
          topicId: topic.id,
          title: topic.topic,
          technology: topic.technology,
          subtopic: topic.subtopic,
          type: "topic-schedule",
          scheduledDate: topic.scheduledDate,
          scheduledTime: topic.scheduledTime,
          status,
          isDone,
          notes: topic.notes,
          difficulty: topic.difficulty,
          confidence: topic.confidence,
        });
      } catch (e) {
        // ignore date parsing error
      }
    }

    // 2. Scheduled Spaced Repetition Revisions
    if (topic.needRevision && Array.isArray(topic.revisionSchedule)) {
      topic.revisionSchedule.forEach((rev) => {
        try {
          const revDate = parseISO(rev.date);
          let status: NotificationItem["status"] = "upcoming";

          if (rev.done) {
            status = "completed";
          } else if (isSameDay(revDate, today)) {
            status = "due-today";
          } else if (isBefore(revDate, today)) {
            status = "overdue";
          } else {
            status = "upcoming";
          }

          items.push({
            id: `rev-${topic.id}-${rev.id}`,
            topicId: topic.id,
            title: topic.topic,
            technology: topic.technology,
            subtopic: topic.subtopic,
            type: "revision",
            scheduledDate: rev.date,
            status,
            isDone: rev.done,
            notes: rev.notes || topic.notes,
            difficulty: topic.difficulty,
            confidence: topic.confidence,
            revisionEntryId: rev.id,
          });
        } catch (e) {
          // ignore date parse error
        }
      });
    }
  });

  // Sort items chronologically by date and time
  items.sort((a, b) => {
    const dateDiff = a.scheduledDate.localeCompare(b.scheduledDate);
    if (dateDiff !== 0) return dateDiff;
    if (a.scheduledTime && b.scheduledTime) {
      return a.scheduledTime.localeCompare(b.scheduledTime);
    }
    return 0;
  });

  const dueToday = items.filter((i) => i.status === "due-today");
  const overdue = items.filter((i) => i.status === "overdue");
  const upcoming = items.filter((i) => i.status === "upcoming");
  const completed = items.filter((i) => i.status === "completed");

  // Group by Day (for line-by-line day-by-day view)
  const dayMap = new Map<string, NotificationItem[]>();
  items.forEach((item) => {
    const list = dayMap.get(item.scheduledDate) || [];
    list.push(item);
    dayMap.set(item.scheduledDate, list);
  });

  const sortedDates = Array.from(dayMap.keys()).sort();
  const groupedByDay: DayGroupedNotifications[] = sortedDates.map((dateStr) => {
    let d: Date;
    try {
      d = parseISO(dateStr);
    } catch {
      d = new Date();
    }

    const isTod = isToday(d);
    const isTom = isTomorrow(d);
    const isPast = isBefore(startOfDay(d), today) && !isTod;

    let relativeLabel = format(d, "EEEE, MMMM d, yyyy");
    if (isTod) relativeLabel = "Today";
    else if (isTom) relativeLabel = "Tomorrow";
    else if (isPast) relativeLabel = "Overdue / Past";

    return {
      date: dateStr,
      displayDate: format(d, "MMM d, yyyy"),
      relativeLabel,
      isToday: isTod,
      isTomorrow: isTom,
      isPast,
      items: dayMap.get(dateStr) || [],
    };
  });

  return {
    all: items,
    dueToday,
    overdue,
    upcoming,
    completed,
    groupedByDay,
  };
}

/**
 * Trigger browser notification when opening application
 */
export function triggerAppOpenBrowserNotification(dueItems: NotificationItem[]) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (!dueItems || dueItems.length === 0) return;

  // Prevent spamming notification if triggered in the last 15 minutes
  const lastKey = "devos_last_app_open_notif";
  const lastTime = sessionStorage.getItem(lastKey);
  const now = Date.now();
  if (lastTime && now - Number(lastTime) < 15 * 60 * 1000) {
    return;
  }

  sessionStorage.setItem(lastKey, String(now));

  const count = dueItems.length;
  const sampleTopics = dueItems
    .slice(0, 3)
    .map((i) => i.title)
    .join(", ");
  const more = count > 3 ? ` and ${count - 3} more` : "";

  try {
    const notification = new Notification("DevOS — Today's Study Tasks 📚", {
      body: `You have ${count} topic${count > 1 ? "s" : ""} scheduled today: ${sampleTopics}${more}. Click to start learning!`,
      icon: "/icon.png",
      tag: "devos-daily-reminder",
    });

    notification.onclick = () => {
      window.focus();
      window.location.href = "/notifications";
    };
  } catch (err) {
    console.error("Failed to send browser notification:", err);
  }
}

/**
 * Mark notification completed
 */
export async function markNotificationItemDone(item: NotificationItem) {
  if (item.type === "topic-schedule") {
    await db.learningTopics.update(item.topicId, {
      status: "completed",
      updatedAt: new Date().toISOString(),
    });
  } else if (item.type === "revision") {
    await markRevisionDone(item.topicId, item.scheduledDate);
  }
}
