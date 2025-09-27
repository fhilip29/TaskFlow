// Task constants and enums
export const TASK_STATUS = {
  BACKLOG: "backlog",
  IN_PROGRESS: "in_progress",
  BLOCKED: "blocked",
  DONE: "done",
  ARCHIVED: "archived",
} as const;

export const TASK_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];
export type TaskPriority = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];

// Status transitions state machine
export const STATUS_TRANSITIONS: Record<string, string[]> = {
  [TASK_STATUS.BACKLOG]: [TASK_STATUS.IN_PROGRESS, TASK_STATUS.ARCHIVED],
  [TASK_STATUS.IN_PROGRESS]: [
    TASK_STATUS.BLOCKED,
    TASK_STATUS.DONE,
    TASK_STATUS.ARCHIVED,
  ],
  [TASK_STATUS.BLOCKED]: [TASK_STATUS.IN_PROGRESS, TASK_STATUS.ARCHIVED],
  [TASK_STATUS.DONE]: [TASK_STATUS.ARCHIVED, TASK_STATUS.IN_PROGRESS],
  [TASK_STATUS.ARCHIVED]: [], // No transitions from archived
};
