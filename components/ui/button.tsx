import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // Primary Button - Deep Blue (Version B)
        default:
          "bg-[#1A73E8] text-white hover:bg-[#1557B0] dark:bg-[#8AB4F8] dark:text-[#121212] dark:hover:bg-[#A8C7FA] shadow-sm",
        // Accent Button - Warm Yellow (Version B)
        accent:
          "bg-[#FFB300] text-[#202124] hover:bg-[#E09F00] dark:bg-[#FDD663] dark:text-[#121212] dark:hover:bg-[#FEE89D] shadow-sm",
        // Destructive Button - Red
        destructive:
          "bg-[#EA4335] text-white hover:bg-[#D33426] dark:bg-[#F28B82] dark:text-[#121212] dark:hover:bg-[#F5A8A0] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 shadow-sm",
        // Outline Button
        outline:
          "border border-[#1A73E8] dark:border-[#8AB4F8] text-[#1A73E8] dark:text-[#8AB4F8] bg-white dark:bg-[#121212] hover:bg-[#1A73E8]/10 dark:hover:bg-[#8AB4F8]/10",
        // Secondary Button
        secondary:
          "bg-[#F8F9FA] dark:bg-[#1E1E1E] text-[#202124] dark:text-[#E8EAED] hover:bg-[#E0E0E0] dark:hover:bg-[#2E2E2E] border border-[#E0E0E0] dark:border-[#2E2E2E]",
        // Ghost Button
        ghost:
          "text-[#202124] dark:text-[#E8EAED] hover:bg-[#F8F9FA] dark:hover:bg-[#1E1E1E] hover:text-[#202124] dark:hover:text-[#E8EAED]",
        // Link Button
        link: "text-[#1A73E8] dark:text-[#8AB4F8] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-11 rounded-md px-6 has-[>svg]:px-4 text-base",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
