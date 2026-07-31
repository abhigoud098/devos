import { parseISO, differenceInCalendarDays } from "date-fns";

type HistoryItem = {
  reviewedAt: string;
};

export function calculateRevisionStreak(history: HistoryItem[]) {
  if (history.length === 0) {
    return 0;
  }

  const uniqueDays = Array.from(
    new Set(history.map((item) => item.reviewedAt.split("T")[0])),
  )
    .sort()
    .reverse();

  let streak = 1;

  for (let i = 0; i < uniqueDays.length - 1; i++) {
    const current = parseISO(uniqueDays[i]);

    const previous = parseISO(uniqueDays[i + 1]);

    const diff = differenceInCalendarDays(current, previous);

    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
