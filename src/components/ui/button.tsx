"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-foreground shadow-[0_1px_0_0_hsl(45_90%_75%/0.4)_inset,0_4px_12px_-4px_hsl(var(--accent)/0.5)] hover:bg-accent/90 hover:shadow-[0_1px_0_0_hsl(45_90%_75%/0.4)_inset,0_6px_16px_-4px_hsl(var(--accent)/0.65)]",
        outline: "border border-border bg-transparent hover:border-border-strong hover:bg-surface-2 text-foreground",
        ghost: "hover:bg-surface-2 text-foreground",
        destructive: "bg-danger text-white hover:bg-danger/90",
        link: "text-accent underline-offset-4 hover:underline",
        subtle: "bg-surface-2 text-foreground hover:bg-surface-raised",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-sm px-3 text-xs",
        lg: "h-12 rounded-md px-8",
        icon: "h-10 w-10",
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
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
