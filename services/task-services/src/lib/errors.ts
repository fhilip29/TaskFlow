import { Response } from "express";
import { ErrorCode, ApiResponse } from "../types";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }
}

// Factory functions for common errors
export const createError = {
  unauthorized: (message: string = "Authentication required") =>
    new AppError(ErrorCode.UNAUTHORIZED, message, 401),

  forbidden: (message: string = "Access denied") =>
    new AppError(ErrorCode.FORBIDDEN, message, 403),

  notFound: (resource: string = "Resource") =>
    new AppError(ErrorCode.NOT_FOUND, `${resource} not found`, 404),

  validation: (message: string, details?: any) =>
    new AppError(ErrorCode.VALIDATION_ERROR, message, 400, details),

  invalidStatusTransition: (from: string, to: string) =>
    new AppError(
      ErrorCode.INVALID_STATUS_TRANSITION,
      `Invalid status transition from '${from}' to '${to}'`,
      400
    ),

  assigneeNotMember: () =>
    new AppError(
      ErrorCode.ASSIGNEE_NOT_PROJECT_MEMBER,
      "Assignee must be a project member",
      400
    ),

  internal: (message: string = "Internal server error") =>
    new AppError(ErrorCode.INTERNAL_ERROR, message, 500),

  duplicate: (resource: string) =>
    new AppError(
      ErrorCode.DUPLICATE_RESOURCE,
      `${resource} already exists`,
      409
    ),
};

// Error response helper
export const sendErrorResponse = (
  res: Response,
  error: AppError | Error
): void => {
  if (error instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
    res.status(error.statusCode).json(response);
  } else {
    // Unexpected error
    if (typeof console !== "undefined") {
      console.error("Unexpected error:", error);
    }
    const response: ApiResponse = {
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: "An unexpected error occurred",
      },
    };
    res.status(500).json(response);
  }
};

// Success response helper
export const sendSuccessResponse = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200,
  pagination?: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  }
): void => {
  const response: ApiResponse<T> = {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
    ...(pagination && { pagination }),
  };
  res.status(statusCode).json(response);
};

// Error handling middleware
export const errorHandler = (
  error: any,
  req: any,
  res: Response,
  next: any
): void => {
  // Mongoose validation error
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((err: any) => err.message);
    const appError = createError.validation("Validation failed", {
      fields: messages,
    });
    return sendErrorResponse(res, appError);
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || "field";
    const appError = createError.duplicate(field);
    return sendErrorResponse(res, appError);
  }

  // Mongoose cast error (invalid ObjectId)
  if (error.name === "CastError") {
    const appError = createError.validation(
      `Invalid ${error.path}: ${error.value}`
    );
    return sendErrorResponse(res, appError);
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    const appError = createError.unauthorized("Invalid token");
    return sendErrorResponse(res, appError);
  }

  if (error.name === "TokenExpiredError") {
    const appError = createError.unauthorized("Token expired");
    return sendErrorResponse(res, appError);
  }

  // Handle our custom AppError
  if (error instanceof AppError) {
    return sendErrorResponse(res, error);
  }

  // Default to internal server error
  sendErrorResponse(res, createError.internal());
};
