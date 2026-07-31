export async function requestRevisionNotificationPermission() {
  if (typeof window === "undefined") {
    return false;
  }

  if (!("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  const permission = await Notification.requestPermission();

  return permission === "granted";
}

export function sendRevisionNotification(count: number) {
  if (typeof window === "undefined") {
    return;
  }

  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission !== "granted") {
    return;
  }

  new Notification("DevOS Revision Reminder 🧠", {
    body: `You have ${count} pending revision${count > 1 ? "s" : ""} today.`,

    icon: "/icon.png",
  });
}
