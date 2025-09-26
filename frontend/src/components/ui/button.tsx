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
          "bg-emerald-600 text-white shadow-sm border border-emerald-600",
          "hover:bg-emerald-700 hover:border-emerald-700",
          "focus:bg-emerald-700 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-400/50",
        ],
        success: [
          "bg-green-600 text-white shadow-sm border border-green-600",
          "hover:bg-green-700 hover:border-green-700",
          "focus:bg-green-700 focus:border-green-700",
        ],
        subtle: [
          "bg-gray-50 text-gray-900 shadow-sm border border-gray-200",
          "hover:bg-gray-100 hover:border-gray-300",
          "focus:bg-gray-100 focus:border-gray-300",
        ],
        outline: [
          "border border-gray-300 bg-white text-gray-700 shadow-sm",
          "hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400",
          "focus:bg-gray-50 focus:border-gray-400",
        ],
        ghost: [
          "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
          "focus:bg-gray-100",
        ],
        destructive: [
          "bg-red-600 text-white shadow-sm border border-red-600",
          "hover:bg-red-700 hover:border-red-700",
          "focus:bg-red-700 focus:border-red-700",
        ],
        link: [
          "text-emerald-600 underline-offset-4 hover:underline",
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
