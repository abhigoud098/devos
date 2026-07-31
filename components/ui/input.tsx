import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-9 w-full rounded-lg border border-base-border bg-base-elevated px-3 text-[13.5px] text-ink placeholder:text-ink-faint outline-none transition-colors focus:border-accent",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
