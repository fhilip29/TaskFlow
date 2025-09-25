"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  progress: number;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "success" | "warning" | "danger";
  label?: string;
  value?: string | number;
  className?: string;
}

export function ProgressRing({
  progress,
  size = "md",
  color = "primary",
  label,
  value,
  className,
}: ProgressRingProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const strokeWidth = {
    sm: 3,
    md: 4,
    lg: 5,
  };

  const colorClasses = {
    primary: "text-primary",
    success: "text-green-600",
    warning: "text-orange-600",
    danger: "text-red-600",
  };

  const radius = size === "sm" ? 26 : size === "md" ? 42 : 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        sizeClasses[size],
        className
      )}
    >
      <svg className="transform -rotate-90 w-full h-full">
        {/* Background circle */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth[size]}
          fill="transparent"
          className="text-muted"
        />
        {/* Progress circle */}
        <motion.circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth[size]}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={colorClasses[color]}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {value && (
          <span
            className={cn(
              "font-bold",
              size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-lg",
              colorClasses[color]
            )}
          >
            {value}
          </span>
        )}
        {label && (
          <span
            className={cn(
              "text-muted-foreground",
              size === "sm" ? "text-xs" : "text-xs"
            )}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
    type: "positive" | "negative" | "neutral";
  };
  icon?: React.ReactNode;
  color?: "primary" | "success" | "warning" | "danger";
  progress?: number;
}

export function StatCard({
  title,
  value,
  change,
  icon,
  color = "primary",
  progress,
}: StatCardProps) {
  const colorClasses = {
    primary: "text-primary bg-muted border-border",
    success: "text-green-600 bg-muted border-border",
    warning: "text-orange-600 bg-muted border-border",
    danger: "text-red-600 bg-muted border-border",
  };

  const changeColors = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-muted-foreground",
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-foreground">{value}</p>

          {change && (
            <div className="flex items-center mt-2">
              <span
                className={cn("text-xs font-medium", changeColors[change.type])}
              >
                {change.type === "positive"
                  ? "↗"
                  : change.type === "negative"
                  ? "↘"
                  : "→"}{" "}
                {change.value}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                {change.label}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {progress !== undefined && (
            <ProgressRing progress={progress} size="sm" color={color} />
          )}
          {icon && (
            <div className={cn("p-3 rounded-lg", colorClasses[color])}>
              {icon}
            </div>
          )}
        </div>
      </div>

      {/* Subtle background pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <div className="w-full h-full bg-gradient-to-br from-current to-transparent rounded-full transform translate-x-16 -translate-y-16" />
      </div>
    </motion.div>
  );
}
