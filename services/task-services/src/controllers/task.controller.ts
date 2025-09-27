import { Request, Response } from "express";
import { ZodError } from "zod";
import * as taskService from "../services/taskService";
import {
  sendSuccessResponse,
  sendErrorResponse,
  createError,
} from "../lib/errors";
import { requireAuthUser } from "../middleware/auth.middleware";
import {
  assertProjectPermission,
  assertCanChangeTaskStatus,
  assertAssigneeIsMember,
} from "../lib/permissions";
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  updateTaskAssigneeSchema,
  taskQuerySchema,
  projectIdSchema,
  projectAndTaskIdSchema,
  validateRequestBody,
  validateQueryParams,
  validatePathParams,
  CreateTaskInput,
  UpdateTaskInput,
  UpdateTaskStatusInput,
  UpdateTaskAssigneeInput,
  TaskQueryInput,
} from "../lib/validation/taskSchemas";
import { CreateTaskRequest, UpdateTaskRequest } from "../types";

/**
 * Create a new task
 * POST /api/projects/:projectId/tasks
 */
export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate path parameters
    const { projectId } = validatePathParams(projectIdSchema)(req.params) as {
      projectId: string;
    };

    // Validate request body
    const taskData: CreateTaskInput = validateRequestBody(createTaskSchema)(
      req.body
    );

    // Get authenticated user
    const user = requireAuthUser(req);

    // Check permissions (only admins can create tasks in Phase 1)
    await assertProjectPermission(projectId, user.userId, "create_task");

    // Validate assignee is project member if provided
    if (taskData.assignee) {
      await assertAssigneeIsMember(projectId, taskData.assignee as string);
    }

    // Create task
    const result = await taskService.createTask(
      projectId,
      user.userId,
      taskData as CreateTaskRequest
    );

    if (!result.success) {
      return sendErrorResponse(res, createError.internal(result.error));
    }

    sendSuccessResponse(res, result.data, "Task created successfully", 201);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return sendErrorResponse(
        res,
        createError.validation("Invalid input data", error.errors)
      );
    }
    sendErrorResponse(res, error as Error);
  }
};

/**
 * List tasks with filtering and pagination
 * GET /api/projects/:projectId/tasks
 */
export const listTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate path parameters
    const { projectId } = validatePathParams(projectIdSchema)(req.params) as {
      projectId: string;
    };

    // Validate query parameters
    const queryParams = validateQueryParams(taskQuerySchema)(req.query);

    // Get authenticated user
    const user = requireAuthUser(req);

    // Check permissions (any project member can view tasks)
    await assertProjectPermission(projectId, user.userId, "view_tasks");

    // Extract filters and options from query params
    const {
      status,
      assignee,
      priority,
      label,
      search,
      dueDateFrom,
      dueDateTo,
      isDeleted,
      page,
      limit,
      sort,
    } = queryParams;

    const filters = {
      status: status as any,
      assignee: assignee as any,
      priority: priority as any,
      label: label as any,
      search: search as any,
      isDeleted: isDeleted as any,
      ...(dueDateFrom || dueDateTo
        ? {
            dueDate: {
              ...(dueDateFrom ? { from: dueDateFrom as string } : {}),
              ...(dueDateTo ? { to: dueDateTo as string } : {}),
            },
          }
        : {}),
    };

    const options = {
      page: typeof page === "string" ? parseInt(page, 10) : page || 1,
      limit: typeof limit === "string" ? parseInt(limit, 10) : limit || 20,
      sort,
    };

    // Get tasks
    const result = await taskService.listTasks(projectId, filters, options);

    if (!result.success) {
      return sendErrorResponse(res, createError.internal(result.error));
    }

    sendSuccessResponse(
      res,
      result.data,
      "Tasks retrieved successfully",
      200,
      result.pagination
    );
  } catch (error: any) {
    if (error instanceof ZodError) {
      return sendErrorResponse(
        res,
        createError.validation("Invalid query parameters", error.errors)
      );
    }
    sendErrorResponse(res, error as Error);
  }
};

/**
 * Get a single task
 * GET /api/projects/:projectId/tasks/:taskId
 */
export const getTask = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate path parameters
    const { projectId, taskId } = validatePathParams(projectAndTaskIdSchema)(
      req.params
    ) as { projectId: string; taskId: string };

    // Get authenticated user
    const user = requireAuthUser(req);

    // Check permissions
    await assertProjectPermission(projectId, user.userId, "view_tasks");

    // Get task
    const result = await taskService.getTask(taskId, projectId);

    if (!result.success) {
      if (result.error === "Task not found") {
        return sendErrorResponse(res, createError.notFound("Task"));
      }
      return sendErrorResponse(res, createError.internal(result.error));
    }

    sendSuccessResponse(res, result.data, "Task retrieved successfully");
  } catch (error) {
    if (error instanceof ZodError) {
      return sendErrorResponse(
        res,
        createError.validation("Invalid parameters", error.errors)
      );
    }
    sendErrorResponse(res, error as Error);
  }
};

/**
 * Update task fields
 * PATCH /api/projects/:projectId/tasks/:taskId
 */
export const updateTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate path parameters
    const { projectId, taskId } = validatePathParams(projectAndTaskIdSchema)(
      req.params
    ) as { projectId: string; taskId: string };

    // Validate request body
    const updateData: UpdateTaskInput = validateRequestBody(updateTaskSchema)(
      req.body
    );

    // Get authenticated user
    const user = requireAuthUser(req);

    // Check permissions (only admins can edit core fields)
    await assertProjectPermission(projectId, user.userId, "edit_task");

    // Update task
    const result = await taskService.updateTaskFields(
      taskId,
      projectId,
      user.userId,
      updateData as UpdateTaskRequest
    );

    if (!result.success) {
      if (result.error === "Task not found") {
        return sendErrorResponse(res, createError.notFound("Task"));
      }
      return sendErrorResponse(res, createError.internal(result.error));
    }

    sendSuccessResponse(res, result.data, "Task updated successfully");
  } catch (error: any) {
    if (error instanceof ZodError) {
      return sendErrorResponse(
        res,
        createError.validation("Invalid input data", error.errors)
      );
    }
    sendErrorResponse(res, error as Error);
  }
};

/**
 * Update task status
 * PATCH /api/projects/:projectId/tasks/:taskId/status
 */
export const updateTaskStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate path parameters
    const { projectId, taskId } = validatePathParams(projectAndTaskIdSchema)(
      req.params
    ) as { projectId: string; taskId: string };

    // Validate request body
    const { status }: UpdateTaskStatusInput = validateRequestBody(
      updateTaskStatusSchema
    )(req.body);

    // Get authenticated user
    const user = requireAuthUser(req);

    // Get current task to check assignee
    const taskResult = await taskService.getTask(taskId, projectId);
    if (!taskResult.success) {
      if (taskResult.error === "Task not found") {
        return sendErrorResponse(res, createError.notFound("Task"));
      }
      return sendErrorResponse(res, createError.internal(taskResult.error));
    }

    // Check permissions (admin OR current assignee)
    await assertCanChangeTaskStatus(
      projectId,
      user.userId,
      taskResult.data?.assignee?.toString()
    );

    // Update status
    const result = await taskService.changeTaskStatus(
      taskId,
      projectId,
      user.userId,
      status as any
    );

    if (!result.success) {
      return sendErrorResponse(res, createError.internal(result.error));
    }

    sendSuccessResponse(res, result.data, "Task status updated successfully");
  } catch (error: any) {
    if (error instanceof ZodError) {
      return sendErrorResponse(
        res,
        createError.validation("Invalid status", error.errors)
      );
    }
    sendErrorResponse(res, error as Error);
  }
};

/**
 * Update task assignee
 * PATCH /api/projects/:projectId/tasks/:taskId/assignee
 */
export const updateTaskAssignee = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate path parameters
    const { projectId, taskId } = validatePathParams(projectAndTaskIdSchema)(
      req.params
    ) as { projectId: string; taskId: string };

    // Validate request body
    const { assignee }: UpdateTaskAssigneeInput = validateRequestBody(
      updateTaskAssigneeSchema
    )(req.body);

    // Get authenticated user
    const user = requireAuthUser(req);

    // Check permissions (only admins can assign tasks)
    await assertProjectPermission(projectId, user.userId, "assign_task");

    // Validate assignee is project member if provided
    if (assignee) {
      await assertAssigneeIsMember(projectId, assignee);
    }

    // Update assignee
    const result = await taskService.assignTask(
      taskId,
      projectId,
      user.userId,
      (assignee as string) || null
    );

    if (!result.success) {
      if (result.error === "Task not found") {
        return sendErrorResponse(res, createError.notFound("Task"));
      }
      return sendErrorResponse(res, createError.internal(result.error));
    }

    const message = assignee
      ? "Task assigned successfully"
      : "Task unassigned successfully";
    sendSuccessResponse(res, result.data, message);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return sendErrorResponse(
        res,
        createError.validation("Invalid assignee", error.errors)
      );
    }
    sendErrorResponse(res, error as Error);
  }
};

/**
 * Delete task (soft delete)
 * DELETE /api/projects/:projectId/tasks/:taskId
 */
export const deleteTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate path parameters
    const { projectId, taskId } = validatePathParams(projectAndTaskIdSchema)(
      req.params
    ) as { projectId: string; taskId: string };

    // Get authenticated user
    const user = requireAuthUser(req);

    // Check permissions (only admins can delete tasks)
    await assertProjectPermission(projectId, user.userId, "delete_task");

    // Delete task
    const result = await taskService.softDeleteTask(
      taskId,
      projectId,
      user.userId
    );

    if (!result.success) {
      if (result.error === "Task not found") {
        return sendErrorResponse(res, createError.notFound("Task"));
      }
      return sendErrorResponse(res, createError.internal(result.error));
    }

    sendSuccessResponse(res, undefined, "Task deleted successfully");
  } catch (error: any) {
    if (error instanceof ZodError) {
      return sendErrorResponse(
        res,
        createError.validation("Invalid parameters", error.errors)
      );
    }
    sendErrorResponse(res, error as Error);
  }
};

/**
 * Get task activity
 * GET /api/projects/:projectId/tasks/:taskId/activity
 */
export const getTaskActivity = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate path parameters
    const { projectId, taskId } = validatePathParams(projectAndTaskIdSchema)(
      req.params
    ) as { projectId: string; taskId: string };

    // Get authenticated user
    const user = requireAuthUser(req);

    // Check permissions
    await assertProjectPermission(projectId, user.userId, "view_tasks");

    // Extract pagination from query
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    // Get activity
    const result = await taskService.listTaskActivity(taskId, projectId, {
      page,
      limit,
    });

    if (!result.success) {
      if (result.error === "Task not found") {
        return sendErrorResponse(res, createError.notFound("Task"));
      }
      return sendErrorResponse(res, createError.internal(result.error));
    }

    sendSuccessResponse(
      res,
      result.data,
      "Task activity retrieved successfully",
      200,
      result.pagination
    );
  } catch (error: any) {
    if (error instanceof ZodError) {
      return sendErrorResponse(
        res,
        createError.validation("Invalid parameters", error.errors)
      );
    }
    sendErrorResponse(res, error as Error);
  }
};
