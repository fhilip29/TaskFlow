import { TaskStatus, TaskPriority } from "@/types/backend";

/**
 * Status and Priority color mappings for UI components
 * Maps backend enums to Chalkboard Harmony color tokens
 */

export const StatusColorMap = {
  // Task Status Colors
  pending: "info",
  "in-progress": "warning",
  completed: "success",
  cancelled: "danger",

  // Project Status Colors
  active: "info",
  "on-hold": "warning",

  // Priority Colors
  low: "subtle",
  medium: "warning",
  high: "danger",
  urgent: "danger",
} as const;

export type StatusColor = (typeof StatusColorMap)[keyof typeof StatusColorMap];

/**
 * Get the appropriate badge variant for a status
 */
export function getStatusVariant(status: TaskStatus | TaskPriority): string {
  const colorMap = {
    info: "info",
    warning: "warning",
    success: "success",
    danger: "danger",
    subtle: "secondary",
  } as const;

  const statusColor = StatusColorMap[status as keyof typeof StatusColorMap];
  return colorMap[statusColor as keyof typeof colorMap] || "default";
}

/**
 * Status display labels (human-readable)
 */
export const StatusLabels = {
  // Task Status
  pending: "Pending",
  "in-progress": "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",

  // Priority
  low: "Low Priority",
  medium: "Medium Priority",
  high: "High Priority",
  urgent: "Urgent",
} as const;

/**
 * Get display label for status
 */
export function getStatusLabel(status: TaskStatus | TaskPriority): string {
  return StatusLabels[status as keyof typeof StatusLabels] || status;
}

/**
 * Status icons mapping
 */
export const StatusIcons = {
  pending: "Clock",
  "in-progress": "Play",
  completed: "CheckCircle2",
  cancelled: "XCircle",
  low: "ArrowDown",
  medium: "ArrowRight",
  high: "ArrowUp",
  urgent: "AlertTriangle",
} as const;
