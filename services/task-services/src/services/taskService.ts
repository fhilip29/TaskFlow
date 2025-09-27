import { Types } from "mongoose";
import {
  Task,
  ITask,
  STATUS_TRANSITIONS,
  TaskStatus,
  TaskPriority,
} from "../models/Task";
import { TaskActivity, TASK_ACTIVITY_ACTIONS } from "../models/TaskActivity";
import { createError } from "../lib/errors";
import {
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskFilters,
  TaskSnapshot,
  QueryOptions,
  PaginationMeta,
} from "../types";

// Service interface for task operations
export interface TaskServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: PaginationMeta;
}

/**
 * Create a new task
 * @param projectId - The project ID
 * @param userId - The creator user ID
 * @param taskData - Task creation data
 * @returns Promise<TaskServiceResult<ITask>>
 */
export const createTask = async (
  projectId: string | Types.ObjectId,
  userId: string | Types.ObjectId,
  taskData: CreateTaskRequest
): Promise<TaskServiceResult<ITask>> => {
  try {
    // Prepare task data
    const newTaskData = {
      projectId: new Types.ObjectId(projectId),
      creator: new Types.ObjectId(userId),
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      labels: taskData.labels || [],
      ...(taskData.assignee && {
        assignee: new Types.ObjectId(taskData.assignee),
      }),
      ...(taskData.dueDate && { dueDate: new Date(taskData.dueDate) }),
    };

    // Create task
    const task = await Task.create(newTaskData);

    // Log task creation activity
    await TaskActivity.logTaskCreation(task._id, task.projectId, task.creator, {
      title: task.title,
      description: task.description,
      priority: task.priority,
      assignee: task.assignee,
      dueDate: task.dueDate,
      labels: task.labels,
    });

    return { success: true, data: task };
  } catch (error) {
    console.error("Error creating task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create task",
    };
  }
};

/**
 * List tasks with filtering and pagination
 * @param projectId - The project ID
 * @param filters - Task filters
 * @param options - Query options
 * @returns Promise<TaskServiceResult<ITask[]>>
 */
export const listTasks = async (
  projectId: string | Types.ObjectId,
  filters: TaskFilters = {},
  options: { page?: number; limit?: number; sort?: string } = {}
): Promise<TaskServiceResult<ITask[]>> => {
  try {
    const {
      status,
      assignee,
      priority,
      label,
      search,
      isDeleted = false,
      dueDate,
    } = filters;

    const { page = 1, limit = 20, sort = "-createdAt" } = options;

    // Build query
    const query: any = {
      projectId: new Types.ObjectId(projectId),
      isDeleted,
    };

    // Status filter
    if (status) {
      if (Array.isArray(status)) {
        query.status = { $in: status };
      } else {
        query.status = status;
      }
    }

    // Assignee filter
    if (assignee) {
      if (Array.isArray(assignee)) {
        query.assignee = { $in: assignee.map((id) => new Types.ObjectId(id)) };
      } else {
        query.assignee = new Types.ObjectId(assignee);
      }
    }

    // Priority filter
    if (priority) {
      if (Array.isArray(priority)) {
        query.priority = { $in: priority };
      } else {
        query.priority = priority;
      }
    }

    // Label filter
    if (label) {
      if (Array.isArray(label)) {
        query.labels = { $in: label };
      } else {
        query.labels = label;
      }
    }

    // Due date filter
    if (dueDate) {
      const dueDateQuery: any = {};
      if (dueDate.from) dueDateQuery.$gte = new Date(dueDate.from);
      if (dueDate.to) dueDateQuery.$lte = new Date(dueDate.to);
      if (Object.keys(dueDateQuery).length > 0) {
        query.dueDate = dueDateQuery;
      }
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with population
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate("creator", "fullName email profileImage")
        .populate("assignee", "fullName email profileImage")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Task.countDocuments(query),
    ]);

    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };

    return {
      success: true,
      data: tasks as ITask[],
      pagination,
    };
  } catch (error) {
    console.error("Error listing tasks:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list tasks",
    };
  }
};

/**
 * Get a single task by ID
 * @param taskId - The task ID
 * @param projectId - The project ID (for security)
 * @returns Promise<TaskServiceResult<ITask>>
 */
export const getTask = async (
  taskId: string | Types.ObjectId,
  projectId: string | Types.ObjectId
): Promise<TaskServiceResult<ITask>> => {
  try {
    const task = await Task.findOne({
      _id: new Types.ObjectId(taskId),
      projectId: new Types.ObjectId(projectId),
      isDeleted: false,
    })
      .populate("creator", "fullName email profileImage")
      .populate("assignee", "fullName email profileImage")
      .populate("watchers", "fullName email profileImage");

    if (!task) {
      return { success: false, error: "Task not found" };
    }

    return { success: true, data: task };
  } catch (error) {
    console.error("Error getting task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get task",
    };
  }
};

/**
 * Update task fields
 * @param taskId - The task ID
 * @param projectId - The project ID
 * @param userId - The user making the change
 * @param updateData - Task update data
 * @returns Promise<TaskServiceResult<ITask>>
 */
export const updateTaskFields = async (
  taskId: string | Types.ObjectId,
  projectId: string | Types.ObjectId,
  userId: string | Types.ObjectId,
  updateData: UpdateTaskRequest
): Promise<TaskServiceResult<ITask>> => {
  try {
    const task = await Task.findOne({
      _id: new Types.ObjectId(taskId),
      projectId: new Types.ObjectId(projectId),
      isDeleted: false,
    });

    if (!task) {
      return { success: false, error: "Task not found" };
    }

    // Track changes for activity logging
    const changes: Record<string, { from: any; to: any }> = {};

    // Update fields and track changes
    if (updateData.title !== undefined && updateData.title !== task.title) {
      changes.title = { from: task.title, to: updateData.title };
      task.title = updateData.title;
    }

    if (
      updateData.description !== undefined &&
      updateData.description !== task.description
    ) {
      changes.description = {
        from: task.description,
        to: updateData.description,
      };
      task.description = updateData.description || undefined;
    }

    if (
      updateData.priority !== undefined &&
      updateData.priority !== task.priority
    ) {
      changes.priority = { from: task.priority, to: updateData.priority };
      task.priority = updateData.priority;
    }

    if (updateData.dueDate !== undefined) {
      const newDueDate = updateData.dueDate
        ? new Date(updateData.dueDate)
        : undefined;
      if (newDueDate?.getTime() !== task.dueDate?.getTime()) {
        changes.dueDate = { from: task.dueDate, to: newDueDate };
        task.dueDate = newDueDate;
      }
    }

    if (updateData.labels !== undefined) {
      const currentLabels = JSON.stringify(task.labels.sort());
      const newLabels = JSON.stringify(updateData.labels.sort());
      if (currentLabels !== newLabels) {
        changes.labels = { from: task.labels, to: updateData.labels };
        task.labels = updateData.labels;
      }
    }

    // Save task if there are changes
    if (Object.keys(changes).length > 0) {
      await task.save();

      // Log activity
      await TaskActivity.logFieldUpdate(
        task._id,
        task.projectId,
        new Types.ObjectId(userId),
        changes
      );
    }

    // Return populated task
    await task.populate("creator", "fullName email profileImage");
    await task.populate("assignee", "fullName email profileImage");

    return { success: true, data: task };
  } catch (error) {
    console.error("Error updating task fields:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update task",
    };
  }
};

/**
 * Change task status
 * @param taskId - The task ID
 * @param projectId - The project ID
 * @param userId - The user making the change
 * @param newStatus - The new status
 * @returns Promise<TaskServiceResult<ITask>>
 */
export const changeTaskStatus = async (
  taskId: string | Types.ObjectId,
  projectId: string | Types.ObjectId,
  userId: string | Types.ObjectId,
  newStatus: TaskStatus
): Promise<TaskServiceResult<ITask>> => {
  try {
    const task = await Task.findOne({
      _id: new Types.ObjectId(taskId),
      projectId: new Types.ObjectId(projectId),
      isDeleted: false,
    });

    if (!task) {
      return { success: false, error: "Task not found" };
    }

    const currentStatus = task.status;

    // Check if transition is valid
    if (!task.canTransitionTo(newStatus)) {
      throw createError.invalidStatusTransition(currentStatus, newStatus);
    }

    // Update status
    task.status = newStatus;
    await task.save();

    // Log status change activity
    await TaskActivity.logStatusChange(
      task._id,
      task.projectId,
      new Types.ObjectId(userId),
      currentStatus,
      newStatus
    );

    // Return populated task
    await task.populate("creator", "fullName email profileImage");
    await task.populate("assignee", "fullName email profileImage");

    return { success: true, data: task };
  } catch (error) {
    console.error("Error changing task status:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to change task status" };
  }
};

/**
 * Assign or unassign a task
 * @param taskId - The task ID
 * @param projectId - The project ID
 * @param userId - The user making the change
 * @param assigneeId - The assignee user ID (null to unassign)
 * @returns Promise<TaskServiceResult<ITask>>
 */
export const assignTask = async (
  taskId: string | Types.ObjectId,
  projectId: string | Types.ObjectId,
  userId: string | Types.ObjectId,
  assigneeId: string | Types.ObjectId | null
): Promise<TaskServiceResult<ITask>> => {
  try {
    const task = await Task.findOne({
      _id: new Types.ObjectId(taskId),
      projectId: new Types.ObjectId(projectId),
      isDeleted: false,
    });

    if (!task) {
      return { success: false, error: "Task not found" };
    }

    const currentAssignee = task.assignee;
    const newAssignee = assigneeId ? new Types.ObjectId(assigneeId) : undefined;

    // Update assignee
    task.assignee = newAssignee;
    await task.save();

    // Log assignment activity
    await TaskActivity.logAssignment(
      task._id,
      task.projectId,
      new Types.ObjectId(userId),
      currentAssignee || null,
      newAssignee || null
    );

    // Add assignee to watchers if assigned
    if (newAssignee) {
      task.addWatcher(newAssignee);
      await task.save();
    }

    // Return populated task
    await task.populate("creator", "fullName email profileImage");
    await task.populate("assignee", "fullName email profileImage");

    return { success: true, data: task };
  } catch (error) {
    console.error("Error assigning task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to assign task",
    };
  }
};

/**
 * Soft delete a task (set isDeleted = true)
 * @param taskId - The task ID
 * @param projectId - The project ID
 * @param userId - The user making the change
 * @returns Promise<TaskServiceResult<boolean>>
 */
export const softDeleteTask = async (
  taskId: string | Types.ObjectId,
  projectId: string | Types.ObjectId,
  userId: string | Types.ObjectId
): Promise<TaskServiceResult<boolean>> => {
  try {
    const task = await Task.findOne({
      _id: new Types.ObjectId(taskId),
      projectId: new Types.ObjectId(projectId),
      isDeleted: false,
    });

    if (!task) {
      return { success: false, error: "Task not found" };
    }

    // Soft delete the task
    task.isDeleted = true;
    await task.save();

    // Log deletion activity
    await TaskActivity.create({
      taskId: task._id,
      projectId: task.projectId,
      actor: new Types.ObjectId(userId),
      action: TASK_ACTIVITY_ACTIONS.DELETE,
      from: { isDeleted: false },
      to: { isDeleted: true },
      metadata: {
        timestamp: new Date(),
        description: "Task deleted",
      },
    });

    return { success: true, data: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete task",
    };
  }
};

/**
 * List task activity
 * @param taskId - The task ID
 * @param projectId - The project ID (for security)
 * @param options - Query options
 * @returns Promise<TaskServiceResult<any[]>>
 */
export const listTaskActivity = async (
  taskId: string | Types.ObjectId,
  projectId: string | Types.ObjectId,
  options: { page?: number; limit?: number } = {}
): Promise<TaskServiceResult<any[]>> => {
  try {
    const { page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;

    // Verify task exists and belongs to project
    const taskExists = await Task.findOne({
      _id: new Types.ObjectId(taskId),
      projectId: new Types.ObjectId(projectId),
    }).select("_id");

    if (!taskExists) {
      return { success: false, error: "Task not found" };
    }

    // Get activity with pagination
    const [activities, total] = await Promise.all([
      TaskActivity.find({
        taskId: new Types.ObjectId(taskId),
        projectId: new Types.ObjectId(projectId),
      })
        .populate("actor", "fullName email profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TaskActivity.countDocuments({
        taskId: new Types.ObjectId(taskId),
        projectId: new Types.ObjectId(projectId),
      }),
    ]);

    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };

    return {
      success: true,
      data: activities,
      pagination,
    };
  } catch (error) {
    console.error("Error listing task activity:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to list task activity",
    };
  }
};
