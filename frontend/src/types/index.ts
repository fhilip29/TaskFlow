// Base types aligned with backend models

export interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface IUserPreferences {
  notifications: boolean;
  theme: "light" | "dark";
  language: string;
}

export interface IUser {
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
  address?: IAddress;
  preferences?: IUserPreferences;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Task-related types (inferred from frontend usage)
export type TaskStatus = "todo" | "in-progress" | "done" | "blocked";
export type TaskPriority = "low" | "medium" | "high";

export interface ITask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface LoginResponse {
  token: string;
  user: IUser;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  bio?: string;
  gender?: "Male" | "Female" | "Other";
  dateOfBirth?: string;
  address?: IAddress;
}

export interface UpdateProfileData {
  fullName?: string;
  bio?: string;
  phoneNumber?: string;
  gender?: "Male" | "Female" | "Other";
  dateOfBirth?: string;
  address?: IAddress;
  preferences?: Partial<IUserPreferences>;
}
