import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 backdrop-blur-md shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/20 text-primary hover:bg-primary/30",
        emergency:
          "border-[var(--color-emergency)] bg-[var(--color-emergency)]/10 text-[var(--color-emergency)] hover:bg-[var(--color-emergency)]/20",
        warning:
          "border-[var(--color-warning)] bg-[var(--color-warning)]/10 text-[var(--color-warning)] hover:bg-[var(--color-warning)]/20",
        success:
          "border-[var(--color-success)] bg-[var(--color-success)]/10 text-[var(--color-success)] hover:bg-[var(--color-success)]/20",
        info:
          "border-[var(--color-info)] bg-[var(--color-info)]/10 text-[var(--color-info)] hover:bg-[var(--color-info)]/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface GlassBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function GlassBadge({ className, variant, ...props }: GlassBadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { GlassBadge, badgeVariants };
