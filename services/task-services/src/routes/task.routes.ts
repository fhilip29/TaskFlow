import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import * as taskController from "../controllers/task.controller";

const router = Router();

// All task routes require authentication
router.use(authenticate);

// Task CRUD operations
// GET /api/projects/:projectId/tasks - List tasks with filters
router.get("/projects/:projectId/tasks", taskController.listTasks);

// POST /api/projects/:projectId/tasks - Create task
router.post("/projects/:projectId/tasks", taskController.createTask);

// GET /api/projects/:projectId/tasks/:taskId - Get single task
router.get("/projects/:projectId/tasks/:taskId", taskController.getTask);

// PATCH /api/projects/:projectId/tasks/:taskId - Update task fields
router.patch("/projects/:projectId/tasks/:taskId", taskController.updateTask);

// DELETE /api/projects/:projectId/tasks/:taskId - Delete task (soft delete)
router.delete("/projects/:projectId/tasks/:taskId", taskController.deleteTask);

// Task status management
// PATCH /api/projects/:projectId/tasks/:taskId/status - Update task status
router.patch(
  "/projects/:projectId/tasks/:taskId/status",
  taskController.updateTaskStatus
);

// Task assignment
// PATCH /api/projects/:projectId/tasks/:taskId/assignee - Assign/unassign task
router.patch(
  "/projects/:projectId/tasks/:taskId/assignee",
  taskController.updateTaskAssignee
);

// Task activity
// GET /api/projects/:projectId/tasks/:taskId/activity - Get task activity log
router.get(
  "/projects/:projectId/tasks/:taskId/activity",
  taskController.getTaskActivity
);

export default router;
