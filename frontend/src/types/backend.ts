/**
 * Backend-aligned types for TaskFlow application
 * Generated from backend API contracts - DO NOT MODIFY MANUALLY
 */

// ============= USER TYPES =============
export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  role: "user" | "admin" | "manager";
  isVerified: boolean;
  profileImage?: string;
  phoneNumber?: string;
  bio?: string;
  gender?: "Male" | "Female" | "Other";
  dateOfBirth?: Date;
  address?: Address;
  preferences?: UserPreferences;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface UserPreferences {
  notifications: boolean;
  theme: "light" | "dark";
  language: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  bio?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  gender?: "Male" | "Female" | "Other";
  address?: Address;
  preferences?: UserPreferences;
}

// ============= TASK TYPES =============
export type TaskStatus =
  | "backlog"
  | "in_progress"
  | "blocked"
  | "done"
  | "archived";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface Task {
  _id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  creator: string; // User ID
  assignee?: string; // User ID
  dueDate?: Date;
  labels: string[];
  watchers: string[]; // User IDs
  isDeleted: boolean;
  lastStatusChangeAt: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ============= PROJECT TYPES =============
export type ProjectStatus = "active" | "completed" | "on-hold" | "cancelled";

export interface Project {
  _id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  members: string[]; // User IDs
  tasks: string[]; // Task IDs
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

// ============= API RESPONSE TYPES =============
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ============= AUTHENTICATION TYPES =============
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  bio?: string;
  gender?: "Male" | "Female" | "Other";
  dateOfBirth?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
  error?: string;
}

// ============= STATUS MAPPINGS FOR UI =============
export const StatusColorMap = {
  // Task Status Colors
  backlog: "info",
  in_progress: "warning",
  blocked: "danger",
  done: "success",
  archived: "subtle",

  // Project Status Colors
  active: "info",
  "on-hold": "warning",

  // Priority Colors
  low: "subtle",
  medium: "warning",
  high: "danger",
  critical: "danger",
} as const;

export type StatusColor = (typeof StatusColorMap)[keyof typeof StatusColorMap];

// ============= FRONTEND-ONLY TYPES =============
export interface UIState {
  loading: boolean;
  error: string | null;
  success: string | null;
}

export interface FilterOptions {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignedTo?: string[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SortOption {
  field: keyof Task | keyof Project;
  direction: "asc" | "desc";
}
