"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import "react-day-picker/style.css";

export function Calendar({
  className,
  classNames,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      className={cn("p-0 mx-auto w-full max-w-full", className)}
      classNames={{
        root: "w-full max-w-full text-ink",
        months: "w-full flex flex-col space-y-3",
        month: "w-full space-y-3",
        month_caption: "flex justify-between pt-1 relative items-center mb-2 px-1",
        caption_label: "text-sm font-bold text-ink",
        nav: "flex items-center gap-1",
        button_previous: "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 text-ink rounded-lg hover:bg-base-elevated flex items-center justify-center transition-colors",
        button_next: "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 text-ink rounded-lg hover:bg-base-elevated flex items-center justify-center transition-colors",
        month_grid: "w-full border-collapse space-y-1 table-fixed",
        weekdays: "flex justify-between w-full mb-1",
        weekday: "text-ink-muted w-full text-center font-semibold text-[11px] uppercase tracking-wider",
        week: "flex justify-between w-full mt-1",
        day: "h-8 sm:h-9 w-full text-center text-xs p-0 relative font-medium flex items-center justify-center focus-within:relative focus-within:z-20",
        day_button: "h-7 w-7 sm:h-8 sm:w-8 p-0 font-normal aria-selected:opacity-100 rounded-lg hover:bg-base-elevated transition-colors text-ink flex items-center justify-center",
        selected: "bg-accent text-white font-bold hover:bg-accent focus:bg-accent rounded-lg",
        today: "text-accent font-bold ring-1 ring-accent/50 rounded-lg",
        outside: "text-ink-faint opacity-40",
        disabled: "text-ink-faint opacity-30 cursor-not-allowed",
        hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}
