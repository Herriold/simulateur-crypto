import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-bold transition-[filter] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light/60 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-b from-brand-light to-brand text-white shadow-glow hover:brightness-110",
        outline:
          "border border-white/15 text-ink-cool hover:bg-white/5",
        ghost: "text-ink-soft hover:text-ink hover:bg-white/5",
      },
      size: {
        sm: "px-4 py-2 text-[13px]",
        md: "px-5 py-3 text-sm",
        lg: "px-6 py-[15px] text-[14.5px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
