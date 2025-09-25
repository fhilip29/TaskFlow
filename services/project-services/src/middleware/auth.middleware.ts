import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../types";

// Protect routes - verify JWT token
export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // Get token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Try to get token from cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "supersecret"
      ) as { id: string };

      // Add user info to request
      req.user = {
        userId: decoded.id,
        email: "", // Will be populated if needed
      };

      next();
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Check if user is project member
export const checkProjectMembership = (
  requiredRole?: "admin" | "member" | "viewer"
) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { Project } = await import("../models/Project");
      const projectId = req.params.projectId;
      const userId = req.user?.userId;

      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: "Project ID is required",
        });
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      // Check if user is member
      if (!project.isMember(userId)) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You are not a member of this project.",
        });
      }

      // Check role-based permissions if required
      if (requiredRole && !project.hasPermission(userId, requiredRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. ${requiredRole} role required.`,
        });
      }

      // Add project to request for use in controller
      (req as any).project = project;
      (req as any).memberRole = project.getMemberRole(userId);

      next();
    } catch (error) {
      console.error("Project membership check error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
};

// Admin-only middleware for project operations
export const requireProjectAdmin = checkProjectMembership("admin");

// Member or higher middleware
export const requireProjectMember = checkProjectMembership("member");
