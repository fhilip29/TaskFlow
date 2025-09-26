import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    // Base styles
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium",
    "ring-offset-chalk-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chalk-primary-400 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    // Motion
    "transform active:scale-[0.98] hover:scale-[1.01] transition-transform",
    // Icon styling
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-chalk-primary-600 text-white shadow-sm border border-chalk-primary-600",
          "hover:bg-chalk-primary-700 hover:border-chalk-primary-700",
          "focus:bg-chalk-primary-700 focus:border-chalk-primary-700",
        ],
        success: [
          "bg-green-600 text-white shadow-sm border border-green-600",
          "hover:bg-green-700 hover:border-green-700",
          "focus:bg-green-700 focus:border-green-700",
        ],
        subtle: [
          "bg-chalk-subtle text-chalk-text shadow-sm border border-chalk-border",
          "hover:bg-chalk-hover hover:border-chalk-hover",
          "focus:bg-chalk-hover focus:border-chalk-hover",
        ],
        outline: [
          "border border-chalk-border bg-chalk-panel text-chalk-text shadow-sm",
          "hover:bg-chalk-hover hover:text-chalk-text hover:border-chalk-text-2",
          "focus:bg-chalk-hover focus:border-chalk-text-2",
        ],
        ghost: [
          "text-chalk-text hover:bg-chalk-hover hover:text-chalk-text",
          "focus:bg-chalk-hover",
        ],
        destructive: [
          "bg-red-600 text-white shadow-sm border border-red-600",
          "hover:bg-red-700 hover:border-red-700",
          "focus:bg-red-700 focus:border-red-700",
        ],
        link: [
          "text-chalk-primary-600 underline-offset-4 hover:underline",
          "focus:underline",
        ],
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {typeof children === "string" ? "Loading..." : children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
