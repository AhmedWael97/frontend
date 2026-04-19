import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "signature-glow text-on-primary-fixed hover:shadow-[0_0_20px_rgba(192,193,255,0.3)]",
        outline: "border border-outline-variant bg-transparent text-on-surface hover:bg-surface-container-high",
        ghost: "bg-transparent text-on-surface hover:bg-surface-container-high",
        secondary: "bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80",
        destructive: "bg-error-container text-on-error-container hover:bg-error-container/80",
        link: "underline-offset-4 hover:underline text-primary",
        surface: "bg-surface-container-high text-on-surface hover:bg-surface-container-highest",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
