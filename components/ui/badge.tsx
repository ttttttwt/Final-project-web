import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        // Primary Badge - Deep Blue (Version B)
        default:
          "border-transparent bg-[#1A73E8] dark:bg-[#8AB4F8] text-white dark:text-[#121212] [a&]:hover:bg-[#1557B0] dark:[a&]:hover:bg-[#A8C7FA]",
        // Accent Badge - Warm Yellow (Version B)
        accent:
          "border-transparent bg-[#FFB300] dark:bg-[#FDD663] text-[#202124] dark:text-[#121212] [a&]:hover:bg-[#E09F00] dark:[a&]:hover:bg-[#FEE89D]",
        // Success Badge - Green
        success:
          "border-transparent bg-[#34A853] dark:bg-[#81C995] text-white dark:text-[#121212] [a&]:hover:bg-[#2D9249] dark:[a&]:hover:bg-[#9DD4A9]",
        // Secondary Badge
        secondary:
          "border-transparent bg-[#F8F9FA] dark:bg-[#1E1E1E] text-[#202124] dark:text-[#E8EAED] [a&]:hover:bg-[#E0E0E0] dark:[a&]:hover:bg-[#2E2E2E]",
        // Destructive Badge
        destructive:
          "border-transparent bg-[#EA4335] dark:bg-[#F28B82] text-white dark:text-[#121212] [a&]:hover:bg-[#D33426] dark:[a&]:hover:bg-[#F5A8A0] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        // Outline Badge
        outline:
          "border-[#E0E0E0] dark:border-[#2E2E2E] text-[#5F6368] dark:text-[#9AA0A6] [a&]:hover:bg-[#F8F9FA] dark:[a&]:hover:bg-[#1E1E1E] [a&]:hover:text-[#202124] dark:[a&]:hover:text-[#E8EAED]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
