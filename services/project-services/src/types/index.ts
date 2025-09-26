import { Request } from "express";
import { Document, Types } from "mongoose";

// Auth interfaces
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role?: string;
  };
}

// API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
}

// Project Member interface
export interface IProjectMember {
  userId: Types.ObjectId;
  email: string;
  role: "admin" | "member" | "viewer";
  joinedAt: Date;
  invitedBy?: Types.ObjectId;
  status: "active" | "invited" | "removed";
}

// Project interface
export interface IProject extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  createdBy: Types.ObjectId;
  members: IProjectMember[];
  tasks: Types.ObjectId[];
  invitationCode: string;
  qrCodeUrl?: string;
  status: "active" | "archived" | "deleted";
  settings: {
    isPublic: boolean;
    allowMemberInvite: boolean;
    maxMembers?: number;
  };
  metadata: {
    totalTasks: number;
    completedTasks: number;
    progress: number;
  };
  createdAt: Date;
  updatedAt: Date;
  // Methods
  calculateProgress(): number;
  isMember(userId: string | Types.ObjectId): boolean;
  getMemberRole(
    userId: string | Types.ObjectId
  ): "admin" | "member" | "viewer" | null;
  hasPermission(
    userId: string | Types.ObjectId,
    requiredRole: "admin" | "member" | "viewer"
  ): boolean;
}

// Request DTOs
export interface CreateProjectRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
  allowMemberInvite?: boolean;
  maxMembers?: number;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: "active" | "archived";
  settings?: {
    isPublic?: boolean;
    allowMemberInvite?: boolean;
    maxMembers?: number;
  };
}

export interface InviteMemberRequest {
  email?: string;
  userId?: string;
  role?: "member" | "viewer";
}

export interface UpdateMemberRoleRequest {
  role: "admin" | "member" | "viewer";
}

// Response DTOs
export interface ProjectResponse {
  _id: string;
  name: string;
  description?: string;
  createdBy: {
    _id: string;
    email: string;
    fullName: string;
  };
  members: Array<{
    userId: string;
    email: string;
    fullName?: string;
    role: string;
    joinedAt: Date;
    status: string;
  }>;
  invitationCode: string;
  qrCodeUrl?: string;
  status: string;
  settings: {
    isPublic: boolean;
    allowMemberInvite: boolean;
    maxMembers?: number;
  };
  metadata: {
    totalTasks: number;
    completedTasks: number;
    progress: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectListResponse {
  _id: string;
  name: string;
  description?: string;
  createdBy?: {
    _id: string;
    fullName: string;
    email: string;
  };
  role: string;
  memberCount: number;
  taskCount: number;
  progress: number;
  status: string;
  createdAt?: Date;
  updatedAt: Date;
}

export interface MemberResponse {
  userId: string;
  email: string;
  fullName?: string;
  profileImage?: string;
  role: string;
  joinedAt: Date;
  status: string;
}

// Service interfaces
export interface UserData {
  _id: string;
  email: string;
  fullName: string;
  profileImage?: string;
}

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

export interface TaskServiceResponse {
  success: boolean;
  data?: {
    _id: string;
    title: string;
    status: string;
    priority: string;
    assignedTo?: string;
    dueDate?: Date;
  }[];
  message?: string;
}

// Pagination interface
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  status?: string;
  role?: string;
}
