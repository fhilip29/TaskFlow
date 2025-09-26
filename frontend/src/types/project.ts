// Project-related types matching backend API

export interface IProjectMember {
  id?: string;
  userId: string;
  email: string;
  fullName?: string;
  profileImage?: string;
  user?: {
    fullName: string;
    email: string;
    profileImage?: string;
  };
  role: "admin" | "member" | "viewer";
  joinedAt: Date;
  invitedBy?: string;
  status: "active" | "invited" | "removed";
  isOnline?: boolean;
  lastActive?: Date;
  invitationSentAt?: Date;
  invitedByInfo?: {
    userId: string;
    fullName: string;
    profileImage?: string;
  };
}

export interface IProject {
  _id: string;
  name: string;
  description?: string;
  createdBy: {
    _id: string;
    email: string;
    fullName: string;
  };
  members: IProjectMember[];
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
}

export interface IProjectListItem {
  _id: string;
  name: string;
  description?: string;
  createdBy?: {
    _id: string;
    fullName: string;
    email: string;
  };
  role: "admin" | "member" | "viewer";
  memberCount: number;
  taskCount: number;
  progress: number;
  status: string;
  createdAt?: Date;
  updatedAt: Date;
  // Enhanced member information
  admins: Array<{
    _id: string;
    fullName: string;
    email: string;
    profileImage?: string;
  }>;
  activeMembers: number;
  pendingInvites: number;
  invitationCode?: string;
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
  role?: "admin" | "member" | "viewer";
}

export interface UpdateMemberRoleRequest {
  role: "admin" | "member" | "viewer";
}

// API Response types
export interface ProjectsResponse {
  success: boolean;
  message: string;
  data: IProjectListItem[];
  pagination?: {
    page: number;
    pages: number;
    total: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ProjectResponse {
  success: boolean;
  message: string;
  data: IProject;
}

export interface MembersResponse {
  success: boolean;
  message: string;
  data: IProjectMember[];
}

// Query parameters
export interface ProjectsQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  status?: string;
  role?: string;
}

export interface ProjectFilterOptions {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}
