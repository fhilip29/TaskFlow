import { Request } from "express";
import { IUser } from "../models/User";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
  file?: Express.Multer.File;
}

export interface UpdateProfileRequest {
  fullName?: string;
  bio?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  gender?: "Male" | "Female" | "Other";
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  preferences?: {
    notifications?: boolean;
    theme?: "light" | "dark";
    language?: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface UserProfileResponse {
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
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  preferences?: {
    notifications: boolean;
    theme: "light" | "dark";
    language: string;
  };
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
