// Task Components
export { TaskCard } from "./TaskCard";
export { TaskModal } from "./TaskModal";
export { TaskList } from "./TaskList";
export { TaskBoard } from "./TaskBoard";

// Task Pages
export { default as TasksPage } from "@/app/tasks/page";

// Task Service and Types
export * from "@/services/taskService";

// Re-export commonly used types
export type {
  ITask,
  TaskStatus,
  TaskPriority,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskFilters,
  TaskStats,
  ITaskActivity,
} from "@/services/taskService";
