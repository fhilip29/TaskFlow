import { Types } from "mongoose";
import {
  Task,
  TASK_STATUS,
  TASK_PRIORITY,
  STATUS_TRANSITIONS,
} from "../src/models/Task";
import {
  TaskActivity,
  TASK_ACTIVITY_ACTIONS,
} from "../src/models/TaskActivity";
import * as taskService from "../src/services/taskService";
import { createError } from "../src/lib/errors";
import mongoose from "mongoose";

// Mock User model for tests - must match setup.ts
const User = mongoose.model("User");
const Project = mongoose.model("Project");

describe("TaskService", () => {
  const mockProjectId = new Types.ObjectId();
  const mockUserId = new Types.ObjectId();
  const mockAssigneeId = new Types.ObjectId();

  // Create test users and project before each test
  beforeEach(async () => {
    // Create test users
    await User.create([
      { _id: mockUserId, fullName: "Test Creator", email: "creator@test.com" },
      {
        _id: mockAssigneeId,
        fullName: "Test Assignee",
        email: "assignee@test.com",
      },
    ]);

    // Create test project
    await Project.create({
      _id: mockProjectId,
      name: "Test Project",
      description: "A test project",
    });
  });

  describe("createTask", () => {
    it("should create a task successfully", async () => {
      const taskData = {
        title: "Test Task",
        description: "Test Description",
        priority: TASK_PRIORITY.HIGH,
        assignee: mockAssigneeId.toString(),
        labels: ["bug", "urgent"],
      };

      const result = await taskService.createTask(
        mockProjectId,
        mockUserId,
        taskData
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.title).toBe(taskData.title);
      expect(result.data?.description).toBe(taskData.description);
      expect(result.data?.priority).toBe(taskData.priority);
      expect(result.data?.creator.toString()).toBe(mockUserId.toString());
      expect(result.data?.assignee?.toString()).toBe(mockAssigneeId.toString());
      expect(result.data?.labels).toEqual(taskData.labels);
      expect(result.data?.status).toBe(TASK_STATUS.BACKLOG);
      expect(result.data?.isDeleted).toBe(false);
    });

    it("should create task activity log on creation", async () => {
      const taskData = {
        title: "Test Task with Activity",
        description: "Test Description",
      };

      const result = await taskService.createTask(
        mockProjectId,
        mockUserId,
        taskData
      );

      // Check that task activity was logged
      const activities = await TaskActivity.find({ taskId: result.data?._id });
      expect(activities).toHaveLength(1);
      expect(activities[0].action).toBe(TASK_ACTIVITY_ACTIONS.CREATE);
      expect(activities[0].actor.toString()).toBe(mockUserId.toString());
    });

    it("should add creator to watchers automatically", async () => {
      const taskData = {
        title: "Test Task with Watchers",
      };

      const result = await taskService.createTask(
        mockProjectId,
        mockUserId,
        taskData
      );

      expect(result.data?.watchers).toContainEqual(mockUserId);
    });
  });

  describe("listTasks", () => {
    beforeEach(async () => {
      // Create test tasks
      await Task.create([
        {
          projectId: mockProjectId,
          title: "Task 1",
          status: TASK_STATUS.BACKLOG,
          priority: TASK_PRIORITY.LOW,
          creator: mockUserId,
          labels: ["frontend"],
        },
        {
          projectId: mockProjectId,
          title: "Task 2",
          status: TASK_STATUS.IN_PROGRESS,
          priority: TASK_PRIORITY.HIGH,
          creator: mockUserId,
          assignee: mockAssigneeId,
          labels: ["backend"],
        },
        {
          projectId: mockProjectId,
          title: "Task 3",
          status: TASK_STATUS.DONE,
          priority: TASK_PRIORITY.MEDIUM,
          creator: mockUserId,
          isDeleted: true, // This should be filtered out by default
        },
      ]);
    });

    it("should list tasks with default filters", async () => {
      const result = await taskService.listTasks(mockProjectId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2); // Excludes deleted task
      expect(result.pagination).toBeDefined();
      expect(result.pagination?.total).toBe(2);
    });

    it("should filter by status", async () => {
      const result = await taskService.listTasks(mockProjectId, {
        status: TASK_STATUS.IN_PROGRESS,
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].status).toBe(TASK_STATUS.IN_PROGRESS);
    });

    it("should filter by multiple statuses", async () => {
      const result = await taskService.listTasks(mockProjectId, {
        status: [TASK_STATUS.BACKLOG, TASK_STATUS.IN_PROGRESS],
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it("should filter by assignee", async () => {
      const result = await taskService.listTasks(mockProjectId, {
        assignee: mockAssigneeId.toString(),
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].assignee?._id?.toString()).toBe(
        mockAssigneeId.toString()
      );
    });

    it("should filter by priority", async () => {
      const result = await taskService.listTasks(mockProjectId, {
        priority: TASK_PRIORITY.HIGH,
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].priority).toBe(TASK_PRIORITY.HIGH);
    });

    it("should filter by labels", async () => {
      const result = await taskService.listTasks(mockProjectId, {
        label: "frontend",
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].labels).toContain("frontend");
    });

    it("should include deleted tasks when requested", async () => {
      const result = await taskService.listTasks(mockProjectId, {
        isDeleted: true,
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].isDeleted).toBe(true);
    });

    it("should handle pagination", async () => {
      const result = await taskService.listTasks(
        mockProjectId,
        {},
        {
          page: 1,
          limit: 1,
        }
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.pagination?.page).toBe(1);
      expect(result.pagination?.limit).toBe(1);
      expect(result.pagination?.pages).toBe(2);
      expect(result.pagination?.hasNext).toBe(true);
      expect(result.pagination?.hasPrev).toBe(false);
    });
  });

  describe("getTask", () => {
    let testTask: any;

    beforeEach(async () => {
      testTask = await Task.create({
        projectId: mockProjectId,
        title: "Test Task",
        creator: mockUserId,
        assignee: mockAssigneeId,
      });
    });

    it("should get task by ID", async () => {
      const result = await taskService.getTask(testTask._id, mockProjectId);

      expect(result.success).toBe(true);
      expect(result.data?.title).toBe("Test Task");
      expect(result.data?.creator).toBeDefined(); // Should be populated
      expect(result.data?.assignee).toBeDefined(); // Should be populated
    });

    it("should return error for non-existent task", async () => {
      const fakeId = new Types.ObjectId();
      const result = await taskService.getTask(fakeId, mockProjectId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Task not found");
    });

    it("should return error for deleted task", async () => {
      // Mark task as deleted
      testTask.isDeleted = true;
      await testTask.save();

      const result = await taskService.getTask(testTask._id, mockProjectId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Task not found");
    });

    it("should return error for wrong project", async () => {
      const wrongProjectId = new Types.ObjectId();
      const result = await taskService.getTask(testTask._id, wrongProjectId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Task not found");
    });
  });

  describe("changeTaskStatus", () => {
    let testTask: any;

    beforeEach(async () => {
      testTask = await Task.create({
        projectId: mockProjectId,
        title: "Test Task",
        status: TASK_STATUS.BACKLOG,
        creator: mockUserId,
      });
    });

    it("should change status successfully with valid transition", async () => {
      const result = await taskService.changeTaskStatus(
        testTask._id,
        mockProjectId,
        mockUserId,
        TASK_STATUS.IN_PROGRESS
      );

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe(TASK_STATUS.IN_PROGRESS);
      expect(result.data?.lastStatusChangeAt).toBeDefined();
    });

    it("should log status change activity", async () => {
      await taskService.changeTaskStatus(
        testTask._id,
        mockProjectId,
        mockUserId,
        TASK_STATUS.IN_PROGRESS
      );

      const activities = await TaskActivity.find({
        taskId: testTask._id,
        action: TASK_ACTIVITY_ACTIONS.UPDATE_STATUS,
      });

      expect(activities).toHaveLength(1);
      expect(activities[0].from.status).toBe(TASK_STATUS.BACKLOG);
      expect(activities[0].to.status).toBe(TASK_STATUS.IN_PROGRESS);
    });

    it("should reject invalid status transition", async () => {
      const result = await taskService.changeTaskStatus(
        testTask._id,
        mockProjectId,
        mockUserId,
        TASK_STATUS.DONE // Invalid: backlog -> done
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid status transition");
    });

    it("should validate all status transitions", () => {
      // Test the state machine transitions
      expect(STATUS_TRANSITIONS[TASK_STATUS.BACKLOG]).toEqual([
        TASK_STATUS.IN_PROGRESS,
        TASK_STATUS.ARCHIVED,
      ]);

      expect(STATUS_TRANSITIONS[TASK_STATUS.IN_PROGRESS]).toEqual([
        TASK_STATUS.BLOCKED,
        TASK_STATUS.DONE,
        TASK_STATUS.ARCHIVED,
      ]);

      expect(STATUS_TRANSITIONS[TASK_STATUS.BLOCKED]).toEqual([
        TASK_STATUS.IN_PROGRESS,
        TASK_STATUS.ARCHIVED,
      ]);

      expect(STATUS_TRANSITIONS[TASK_STATUS.DONE]).toEqual([
        TASK_STATUS.ARCHIVED,
        TASK_STATUS.IN_PROGRESS,
      ]);

      expect(STATUS_TRANSITIONS[TASK_STATUS.ARCHIVED]).toEqual([]);
    });
  });

  describe("assignTask", () => {
    let testTask: any;

    beforeEach(async () => {
      testTask = await Task.create({
        projectId: mockProjectId,
        title: "Test Task",
        creator: mockUserId,
      });
    });

    it("should assign task to user", async () => {
      const result = await taskService.assignTask(
        testTask._id,
        mockProjectId,
        mockUserId,
        mockAssigneeId
      );

      expect(result.success).toBe(true);
      expect(result.data?.assignee?._id?.toString()).toBe(
        mockAssigneeId.toString()
      );
    });

    it("should unassign task", async () => {
      // First assign
      await taskService.assignTask(
        testTask._id,
        mockProjectId,
        mockUserId,
        mockAssigneeId
      );

      // Then unassign
      const result = await taskService.assignTask(
        testTask._id,
        mockProjectId,
        mockUserId,
        null
      );

      expect(result.success).toBe(true);
      expect(result.data?.assignee).toBeUndefined();
    });

    it("should add assignee to watchers", async () => {
      const result = await taskService.assignTask(
        testTask._id,
        mockProjectId,
        mockUserId,
        mockAssigneeId
      );

      expect(result.data?.watchers).toContainEqual(mockAssigneeId);
    });

    it("should log assignment activity", async () => {
      await taskService.assignTask(
        testTask._id,
        mockProjectId,
        mockUserId,
        mockAssigneeId
      );

      const activities = await TaskActivity.find({
        taskId: testTask._id,
        action: TASK_ACTIVITY_ACTIONS.ASSIGN,
      });

      expect(activities).toHaveLength(1);
      expect(activities[0].to.assignee?.toString()).toBe(
        mockAssigneeId.toString()
      );
    });
  });

  describe("softDeleteTask", () => {
    let testTask: any;

    beforeEach(async () => {
      testTask = await Task.create({
        projectId: mockProjectId,
        title: "Test Task",
        creator: mockUserId,
      });
    });

    it("should soft delete task", async () => {
      const result = await taskService.softDeleteTask(
        testTask._id,
        mockProjectId,
        mockUserId
      );

      expect(result.success).toBe(true);

      // Verify task is marked as deleted
      const deletedTask = await Task.findById(testTask._id);
      expect(deletedTask?.isDeleted).toBe(true);
    });

    it("should log delete activity", async () => {
      await taskService.softDeleteTask(testTask._id, mockProjectId, mockUserId);

      const activities = await TaskActivity.find({
        taskId: testTask._id,
        action: TASK_ACTIVITY_ACTIONS.DELETE,
      });

      expect(activities).toHaveLength(1);
      expect(activities[0].to.isDeleted).toBe(true);
    });
  });

  describe("updateTaskFields", () => {
    let testTask: any;

    beforeEach(async () => {
      testTask = await Task.create({
        projectId: mockProjectId,
        title: "Original Title",
        description: "Original Description",
        priority: TASK_PRIORITY.LOW,
        labels: ["original"],
        creator: mockUserId,
      });
    });

    it("should update multiple fields", async () => {
      const updateData = {
        title: "Updated Title",
        description: "Updated Description",
        priority: TASK_PRIORITY.HIGH,
        labels: ["updated", "test"],
      };

      const result = await taskService.updateTaskFields(
        testTask._id,
        mockProjectId,
        mockUserId,
        updateData
      );

      expect(result.success).toBe(true);
      expect(result.data?.title).toBe(updateData.title);
      expect(result.data?.description).toBe(updateData.description);
      expect(result.data?.priority).toBe(updateData.priority);
      expect(result.data?.labels).toEqual(updateData.labels);
    });

    it("should log field update activity", async () => {
      const updateData = {
        title: "Updated Title",
        priority: TASK_PRIORITY.HIGH,
      };

      await taskService.updateTaskFields(
        testTask._id,
        mockProjectId,
        mockUserId,
        updateData
      );

      const activities = await TaskActivity.find({
        taskId: testTask._id,
        action: TASK_ACTIVITY_ACTIONS.EDIT,
      });

      expect(activities).toHaveLength(1);
      expect(activities[0].from.title).toBe("Original Title");
      expect(activities[0].to.title).toBe("Updated Title");
      expect(activities[0].metadata?.changedFields).toContain("title");
      expect(activities[0].metadata?.changedFields).toContain("priority");
    });

    it("should not log activity if no changes made", async () => {
      const updateData = {
        title: "Original Title", // Same as current
        description: "Original Description", // Same as current
      };

      await taskService.updateTaskFields(
        testTask._id,
        mockProjectId,
        mockUserId,
        updateData
      );

      const activities = await TaskActivity.find({
        taskId: testTask._id,
        action: TASK_ACTIVITY_ACTIONS.EDIT,
      });

      expect(activities).toHaveLength(0);
    });
  });

  describe("listTaskActivity", () => {
    let testTask: any;

    beforeEach(async () => {
      testTask = await Task.create({
        projectId: mockProjectId,
        title: "Test Task",
        creator: mockUserId,
      });

      // Create some test activities
      await TaskActivity.create([
        {
          taskId: testTask._id,
          projectId: mockProjectId,
          actor: mockUserId,
          action: TASK_ACTIVITY_ACTIONS.CREATE,
          createdAt: new Date("2023-01-01"),
        },
        {
          taskId: testTask._id,
          projectId: mockProjectId,
          actor: mockUserId,
          action: TASK_ACTIVITY_ACTIONS.UPDATE_STATUS,
          from: { status: TASK_STATUS.BACKLOG },
          to: { status: TASK_STATUS.IN_PROGRESS },
          createdAt: new Date("2023-01-02"),
        },
        {
          taskId: testTask._id,
          projectId: mockProjectId,
          actor: mockUserId,
          action: TASK_ACTIVITY_ACTIONS.ASSIGN,
          to: { assignee: mockAssigneeId },
          createdAt: new Date("2023-01-03"),
        },
      ]);
    });

    it("should list task activities in descending order", async () => {
      const result = await taskService.listTaskActivity(
        testTask._id,
        mockProjectId
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);

      // Should be in descending order (newest first)
      expect(result.data?.[0].action).toBe(TASK_ACTIVITY_ACTIONS.ASSIGN);
      expect(result.data?.[1].action).toBe(TASK_ACTIVITY_ACTIONS.UPDATE_STATUS);
      expect(result.data?.[2].action).toBe(TASK_ACTIVITY_ACTIONS.CREATE);
    });

    it("should handle pagination", async () => {
      const result = await taskService.listTaskActivity(
        testTask._id,
        mockProjectId,
        { page: 1, limit: 2 }
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.pagination?.total).toBe(3);
      expect(result.pagination?.pages).toBe(2);
    });

    it("should return error for non-existent task", async () => {
      const fakeId = new Types.ObjectId();
      const result = await taskService.listTaskActivity(fakeId, mockProjectId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Task not found");
    });
  });
});

describe("Task Model", () => {
  it("should validate status transitions using instance method", async () => {
    const task = new Task({
      projectId: new Types.ObjectId(),
      title: "Test Task",
      status: TASK_STATUS.BACKLOG,
      creator: new Types.ObjectId(),
    });

    // Valid transitions
    expect(task.canTransitionTo(TASK_STATUS.IN_PROGRESS)).toBe(true);
    expect(task.canTransitionTo(TASK_STATUS.ARCHIVED)).toBe(true);

    // Invalid transitions
    expect(task.canTransitionTo(TASK_STATUS.DONE)).toBe(false);
    expect(task.canTransitionTo(TASK_STATUS.BLOCKED)).toBe(false);
  });

  it("should check assignee correctly", async () => {
    const userId = new Types.ObjectId();
    const task = new Task({
      projectId: new Types.ObjectId(),
      title: "Test Task",
      creator: new Types.ObjectId(),
      assignee: userId,
    });

    expect(task.isAssignedTo(userId)).toBe(true);
    expect(task.isAssignedTo(new Types.ObjectId())).toBe(false);
  });

  it("should manage watchers correctly", async () => {
    const userId1 = new Types.ObjectId();
    const userId2 = new Types.ObjectId();

    const task = new Task({
      projectId: new Types.ObjectId(),
      title: "Test Task",
      creator: userId1,
    });

    // Add watcher
    task.addWatcher(userId2);
    expect(task.watchers).toContainEqual(userId2);

    // Adding same watcher again should not duplicate
    task.addWatcher(userId2);
    expect(
      task.watchers.filter((w: any) => w.toString() === userId2.toString())
    ).toHaveLength(1);

    // Remove watcher
    task.removeWatcher(userId2);
    expect(task.watchers).not.toContainEqual(userId2);
  });
});
