import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "flex h-10 w-full rounded-xl border border-input bg-background/50 px-3.5 py-2",
          "text-[14px] ring-offset-background transition-all duration-200",
          // Placeholder
          "placeholder:text-muted-foreground/50",
          // File input
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          // Focus state
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-0 focus-visible:border-primary/50",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30",
          // Mobile: Prevent zoom on iOS (min 16px)
          "text-base sm:text-[14px]",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
