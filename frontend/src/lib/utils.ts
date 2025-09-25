import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Task utility functions (aligned with backend)
export function formatTaskId(id: string): string {
  return id.toUpperCase();
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "todo":
      return "chalk-text2";
    case "in-progress":
      return "chalk-info";
    case "done":
      return "chalk-success";
    case "blocked":
      return "chalk-danger";
    default:
      return "chalk-text2";
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "low":
      return "chalk-text2";
    case "medium":
      return "chalk-warning";
    case "high":
      return "chalk-danger";
    default:
      return "chalk-text2";
  }
}

// Legacy function names for backward compatibility
export const getStatusClass = getStatusColor;
export const getPriorityClass = getPriorityColor;
