import { z } from "zod";
import { TASK_STATUS, TASK_PRIORITY } from "../constants";

// Base schemas for common validations
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");
const isoDateSchema = z
  .string()
  .refine((date: string) => !isNaN(Date.parse(date)), {
    message: "Invalid ISO date format",
  });

// Task status and priority enums
const taskStatusSchema = z.enum([
  TASK_STATUS.BACKLOG,
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.BLOCKED,
  TASK_STATUS.DONE,
  TASK_STATUS.ARCHIVED,
] as const);

const taskPrioritySchema = z.enum([
  TASK_PRIORITY.LOW,
  TASK_PRIORITY.MEDIUM,
  TASK_PRIORITY.HIGH,
  TASK_PRIORITY.CRITICAL,
] as const);

// Create task validation schema
export const createTaskSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title cannot exceed 200 characters")
      .trim(),
    description: z
      .string()
      .max(2000, "Description cannot exceed 2000 characters")
      .trim()
      .optional(),
    priority: taskPrioritySchema.optional(),
    assignee: objectIdSchema.optional(),
    dueDate: isoDateSchema.optional(),
    labels: z
      .array(z.string().trim().max(50, "Label cannot exceed 50 characters"))
      .max(10, "Cannot have more than 10 labels")
      .optional(),
  })
  .strict();

// Update task validation schema
export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title cannot be empty")
      .max(200, "Title cannot exceed 200 characters")
      .trim()
      .optional(),
    description: z
      .string()
      .max(2000, "Description cannot exceed 2000 characters")
      .trim()
      .optional()
      .nullable(), // Allow null to clear description
    priority: taskPrioritySchema.optional(),
    dueDate: isoDateSchema.optional().nullable(), // Allow null to clear due date
    labels: z
      .array(z.string().trim().max(50, "Label cannot exceed 50 characters"))
      .max(10, "Cannot have more than 10 labels")
      .optional(),
  })
  .strict();

// Update task status validation schema
export const updateTaskStatusSchema = z
  .object({
    status: taskStatusSchema,
  })
  .strict();

// Update task assignee validation schema
export const updateTaskAssigneeSchema = z
  .object({
    assignee: objectIdSchema.optional().nullable(), // null to unassign
  })
  .strict();

// Task query parameters validation schema
export const taskQuerySchema = z
  .object({
    // Filtering
    status: z.union([taskStatusSchema, z.array(taskStatusSchema)]).optional(),
    assignee: z.union([objectIdSchema, z.array(objectIdSchema)]).optional(),
    priority: z
      .union([taskPrioritySchema, z.array(taskPrioritySchema)])
      .optional(),
    label: z.union([z.string().trim(), z.array(z.string().trim())]).optional(),
    search: z
      .string()
      .trim()
      .max(100, "Search term cannot exceed 100 characters")
      .optional(),
    isDeleted: z
      .union([
        z.string().transform((val: string) => val === "true"),
        z.boolean(),
      ])
      .optional(),

    // Due date filtering
    dueDateFrom: isoDateSchema.optional(),
    dueDateTo: isoDateSchema.optional(),

    // Pagination
    page: z
      .union([
        z.string().transform((val: string) => parseInt(val, 10)),
        z.number(),
      ])
      .refine((val: number) => val > 0, "Page must be greater than 0")
      .default(1),
    limit: z
      .union([
        z.string().transform((val: string) => parseInt(val, 10)),
        z.number(),
      ])
      .refine(
        (val: number) => val > 0 && val <= 100,
        "Limit must be between 1 and 100"
      )
      .default(20),

    // Sorting
    sort: z
      .string()
      .regex(
        /^-?(createdAt|updatedAt|title|status|priority|dueDate)$/,
        "Invalid sort field"
      )
      .optional(),
  })
  .strict();

// Path parameter validation
export const projectIdSchema = z.object({
  projectId: objectIdSchema,
});

export const taskIdSchema = z.object({
  taskId: objectIdSchema,
});

export const projectAndTaskIdSchema = z.object({
  projectId: objectIdSchema,
  taskId: objectIdSchema,
});

// Validation middleware helper functions
export const validateRequestBody = <T>(schema: z.ZodSchema<T>) => {
  return (data: unknown): T => {
    return schema.parse(data);
  };
};

export const validateQueryParams = <T>(schema: z.ZodSchema<T>) => {
  return (query: unknown): T => {
    return schema.parse(query);
  };
};

export const validatePathParams = <T>(schema: z.ZodSchema<T>) => {
  return (params: unknown): T => {
    return schema.parse(params);
  };
};

// Type exports for use in controllers
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type UpdateTaskAssigneeInput = z.infer<typeof updateTaskAssigneeSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
export type ProjectIdInput = z.infer<typeof projectIdSchema>;
export type TaskIdInput = z.infer<typeof taskIdSchema>;
export type ProjectAndTaskIdInput = z.infer<typeof projectAndTaskIdSchema>;
