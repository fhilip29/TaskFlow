import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-chalk-primary-400 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-chalk-primary-500 text-white shadow hover:bg-chalk-primary-600",
        secondary:
          "border-transparent bg-chalk-subtle text-chalk-text hover:bg-chalk-subtle/80",
        destructive:
          "border-transparent bg-red-500 text-white shadow hover:bg-red-600",
        outline:
          "text-chalk-text border-chalk-border bg-chalk-bg hover:bg-chalk-subtle",
        // Status variants
        todo: "border-transparent bg-chalk-subtle text-chalk-text-2",
        "in-progress": "border-transparent bg-blue-100 text-blue-800",
        done: "border-transparent bg-green-100 text-green-800",
        blocked: "border-transparent bg-red-100 text-red-800",
        // Priority variants
        low: "border-transparent bg-green-100 text-green-800",
        medium: "border-transparent bg-yellow-100 text-yellow-800",
        high: "border-transparent bg-orange-100 text-orange-800",
        urgent: "border-transparent bg-red-100 text-red-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  mono?: boolean;
}

function Badge({ className, variant, mono, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant }), mono && "font-mono", className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
