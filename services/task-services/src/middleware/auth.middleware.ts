import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { createError, sendErrorResponse } from "../lib/errors";
import { AuthenticatedRequest } from "../types";

// Extend Express Request type
interface JWTPayload {
  id: string;
  email: string;
  fullName: string;
  iat?: number;
  exp?: number;
}

/**
 * Authentication middleware to protect routes
 * Extracts JWT token from Authorization header or cookies and validates it
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check Authorization header first
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Fallback to cookies if no header token
    else if ((req as any).cookies?.token) {
      token = (req as any).cookies.token;
    }

    // Check if token exists
    if (!token) {
      return sendErrorResponse(
        res,
        createError.unauthorized("Access token required")
      );
    }

    try {
      // Verify the JWT token
      const jwtSecret = process.env.JWT_SECRET || "your-jwt-secret";
      const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

      // For now, we'll assume the token contains all needed user info
      // In a full microservice setup, you might want to validate with auth service
      const user = {
        userId: decoded.id,
        email: decoded.email,
        fullName: decoded.fullName,
      };

      // Attach user to request object
      (req as AuthenticatedRequest).user = user;
      next();
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        return sendErrorResponse(
          res,
          createError.unauthorized("Token has expired")
        );
      } else if (jwtError instanceof jwt.JsonWebTokenError) {
        return sendErrorResponse(
          res,
          createError.unauthorized("Invalid token")
        );
      } else {
        return sendErrorResponse(
          res,
          createError.unauthorized("Token validation failed")
        );
      }
    }
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return sendErrorResponse(
      res,
      createError.internal("Authentication failed")
    );
  }
};

/**
 * Optional authentication middleware
 * Extracts user info if token is present, but doesn't fail if no token
 * Useful for endpoints that work for both authenticated and unauthenticated users
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check Authorization header first
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Fallback to cookies
    else if ((req as any).cookies?.token) {
      token = (req as any).cookies.token;
    }

    // If no token, just continue without setting user
    if (!token) {
      return next();
    }

    try {
      const jwtSecret = process.env.JWT_SECRET || "your-jwt-secret";
      const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

      const user = {
        userId: decoded.id,
        email: decoded.email,
        fullName: decoded.fullName,
      };

      (req as AuthenticatedRequest).user = user;
    } catch (jwtError) {
      // If token is invalid, just continue without user (don't fail)
      console.warn("Optional authentication failed:", jwtError);
    }

    next();
  } catch (error) {
    console.error("Optional authentication middleware error:", error);
    // Don't fail - just continue without user
    next();
  }
};

/**
 * Get authenticated user from request
 * Helper function to extract user info from request object
 */
export const getAuthUser = (req: Request) => {
  return (req as AuthenticatedRequest).user || null;
};

/**
 * Require authenticated user
 * Throws error if no authenticated user in request
 */
export const requireAuthUser = (req: Request) => {
  const user = getAuthUser(req);
  if (!user) {
    throw createError.unauthorized("Authentication required");
  }
  return user;
};
