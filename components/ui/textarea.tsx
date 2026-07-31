import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-lg border border-base-border bg-base-elevated px-3 py-2 text-[13.5px] text-ink placeholder:text-ink-faint outline-none transition-colors focus:border-accent resize-none",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
