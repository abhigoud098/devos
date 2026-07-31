import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  const whole = Math.floor(hours);
  const mins = Math.round((hours - whole) * 60);
  return mins > 0 ? `${whole}h ${mins}m` : `${whole}h`;
}
