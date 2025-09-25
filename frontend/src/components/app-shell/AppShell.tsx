"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Navigation from "@/components/Navigation";
import Header from "@/components/Header";

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
  showNavigation?: boolean;
  showHeader?: boolean;
}

const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(
  (
    { children, className, showNavigation = true, showHeader = true, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn("min-h-screen bg-chalk-bg notebook-bg", className)}
        {...props}
      >
        {showHeader && <Header />}

        <div className="flex">
          {showNavigation && (
            <aside className="w-64 bg-chalk-panel border-r border-chalk-border min-h-[calc(100vh-4rem)] sticky top-16">
              <Navigation />
            </aside>
          )}

          <main
            className={cn(
              "flex-1 min-h-[calc(100vh-4rem)]",
              showNavigation ? "max-w-[calc(100vw-16rem)]" : "max-w-full"
            )}
          >
            <div className="container mx-auto px-6 py-8 max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.24,
                  ease: [0.2, 0.8, 0.2, 1],
                }}
              >
                {children}
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    );
  }
);

AppShell.displayName = "AppShell";

export { AppShell };
