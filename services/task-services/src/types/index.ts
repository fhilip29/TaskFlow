import { Request } from "express";
import { Types } from "mongoose";
import { TaskStatus, TaskPriority } from "../models/Task";

// Auth interfaces
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    fullName: string;
    role?: string;
  };
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
}

// Error codes
export enum ErrorCode {
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_STATUS_TRANSITION = "INVALID_STATUS_TRANSITION",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  DUPLICATE_RESOURCE = "DUPLICATE_RESOURCE",
  ASSIGNEE_NOT_PROJECT_MEMBER = "ASSIGNEE_NOT_PROJECT_MEMBER",
}

// Task request DTOs
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  assignee?: string;
  dueDate?: string; // ISO date string
  labels?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string | null; // ISO date string or null to remove
  labels?: string[];
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}

export interface UpdateTaskAssigneeRequest {
  assignee?: string | null; // User ID or null to unassign
}

// Task filter and query interfaces
export interface TaskFilters {
  status?: TaskStatus | TaskStatus[];
  assignee?: string | string[];
  priority?: TaskPriority | TaskPriority[];
  label?: string | string[];
  search?: string;
  dueDate?: {
    from?: string;
    to?: string;
  };
  isDeleted?: boolean;
}

export interface TaskQueryParams extends TaskFilters {
  page?: number;
  limit?: number;
  sort?: string; // e.g., '-createdAt', 'priority', 'dueDate'
}

// Task response DTOs
export interface TaskResponse {
  _id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  creator: {
    _id: string;
    fullName: string;
    email: string;
    profileImage?: string;
  };
  assignee?: {
    _id: string;
    fullName: string;
    email: string;
    profileImage?: string;
  };
  dueDate?: Date;
  labels: string[];
  watchers: string[];
  isDeleted: boolean;
  lastStatusChangeAt: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskListResponse {
  _id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  creator: {
    _id: string;
    fullName: string;
    profileImage?: string;
  };
  assignee?: {
    _id: string;
    fullName: string;
    profileImage?: string;
  };
  dueDate?: Date;
  labels: string[];
  lastStatusChangeAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskActivityResponse {
  _id: string;
  taskId: string;
  projectId: string;
  actor: {
    _id: string;
    fullName: string;
    email: string;
    profileImage?: string;
  };
  action: string;
  from?: any;
  to?: any;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Service interfaces for external API calls
export interface UserData {
  _id: string;
  email: string;
  fullName: string;
  profileImage?: string;
  username: string;
}

export interface ProjectMember {
  userId: string;
  email: string;
  role: "admin" | "member" | "viewer";
  status: "active" | "invited" | "removed";
}

export interface ProjectData {
  _id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: ProjectMember[];
  status: "active" | "archived" | "deleted";
}

// External service response interfaces
export interface UserServiceResponse {
  success: boolean;
  data?: UserData;
  message?: string;
}

export interface UsersServiceResponse {
  success: boolean;
  data?: UserData[];
  message?: string;
}

export interface ProjectServiceResponse {
  success: boolean;
  data?: ProjectData;
  message?: string;
}

// Permission types
export type ProjectRole = "admin" | "member" | "viewer";
export type RequiredPermission =
  | "create_task"
  | "edit_task"
  | "assign_task"
  | "change_status"
  | "delete_task"
  | "view_tasks";

// Internal task data for activity logging
export interface TaskSnapshot {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  dueDate?: Date;
  labels?: string[];
}

// Database query options
export interface QueryOptions {
  lean?: boolean;
  populate?: string | string[];
  select?: string;
  sort?: string;
  limit?: number;
  skip?: number;
}

// Pagination metadata
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
