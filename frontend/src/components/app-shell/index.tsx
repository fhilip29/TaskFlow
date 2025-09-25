import * as React from "react";
import { cn } from "@/lib/utils";

interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("min-h-screen bg-chalk-bg", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
AppShell.displayName = "AppShell";

const AppShellHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <header
    ref={ref}
    className={cn(
      "sticky top-0 z-50 w-full border-b border-chalk-border bg-chalk-panel/95 backdrop-blur supports-[backdrop-filter]:bg-chalk-panel/60",
      className
    )}
    {...props}
  />
));
AppShellHeader.displayName = "AppShellHeader";

const AppShellMain = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <main ref={ref} className={cn("flex-1", className)} {...props} />
));
AppShellMain.displayName = "AppShellMain";

const AppShellContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8",
      className
    )}
    {...props}
  />
));
AppShellContainer.displayName = "AppShellContainer";

const AppShellContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("py-chalk-6 space-y-chalk-8", className)}
    {...props}
  />
));
AppShellContent.displayName = "AppShellContent";

export {
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellContainer,
  AppShellContent,
};
