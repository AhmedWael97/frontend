import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "secondary";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-primary/15 text-primary border-primary/20",
      success: "bg-green-500/15 text-green-400 border-green-500/20",
      warning: "bg-tertiary/15 text-tertiary border-tertiary/20",
      error: "bg-error/15 text-error border-error/20",
      info: "bg-secondary/15 text-secondary border-secondary/20",
      secondary: "bg-surface-container-high text-on-surface-variant border-outline-variant/30",
    };
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
