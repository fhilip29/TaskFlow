import { Schema, model, Types, Document, Model } from "mongoose";

// Task activity action types
export const TASK_ACTIVITY_ACTIONS = {
  CREATE: "create",
  UPDATE_STATUS: "update_status",
  UPDATE_PRIORITY: "update_priority",
  ASSIGN: "assign",
  UNASSIGN: "unassign",
  EDIT: "edit",
  ARCHIVE: "archive",
  RESTORE: "restore",
  DELETE: "delete",
  ADD_LABEL: "add_label",
  REMOVE_LABEL: "remove_label",
  SET_DUE_DATE: "set_due_date",
  REMOVE_DUE_DATE: "remove_due_date",
} as const;

export type TaskActivityAction =
  (typeof TASK_ACTIVITY_ACTIONS)[keyof typeof TASK_ACTIVITY_ACTIONS];

export interface ITaskActivity extends Document {
  _id: Types.ObjectId;
  taskId: Types.ObjectId;
  projectId: Types.ObjectId;
  actor: Types.ObjectId;
  action: TaskActivityAction;
  from?: any; // Previous state snapshot
  to?: any; // New state snapshot
  metadata?: Record<string, any>; // Additional context
  createdAt: Date;
}

const taskActivitySchema = new Schema<ITaskActivity>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      required: [true, "Task ID is required"],
      ref: "Task",
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      required: [true, "Project ID is required"],
      ref: "Project",
      index: true,
    },
    actor: {
      type: Schema.Types.ObjectId,
      required: [true, "Actor is required"],
      ref: "User",
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      enum: Object.values(TASK_ACTIVITY_ACTIONS),
    },
    from: {
      type: Schema.Types.Mixed,
    },
    to: {
      type: Schema.Types.Mixed,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    // Disable updatedAt since this is append-only
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound indexes for efficient queries
taskActivitySchema.index({ taskId: 1, createdAt: -1 });
taskActivitySchema.index({ projectId: 1, createdAt: -1 });
taskActivitySchema.index({ actor: 1, createdAt: -1 });

// Static methods for common activity creation patterns
taskActivitySchema.statics.logTaskCreation = function (
  taskId: Types.ObjectId,
  projectId: Types.ObjectId,
  actor: Types.ObjectId,
  taskData: any
) {
  return this.create({
    taskId,
    projectId,
    actor,
    action: TASK_ACTIVITY_ACTIONS.CREATE,
    to: taskData,
    metadata: {
      timestamp: new Date(),
      description: "Task created",
    },
  });
};

taskActivitySchema.statics.logStatusChange = function (
  taskId: Types.ObjectId,
  projectId: Types.ObjectId,
  actor: Types.ObjectId,
  fromStatus: string,
  toStatus: string
) {
  return this.create({
    taskId,
    projectId,
    actor,
    action: TASK_ACTIVITY_ACTIONS.UPDATE_STATUS,
    from: { status: fromStatus },
    to: { status: toStatus },
    metadata: {
      timestamp: new Date(),
      description: `Status changed from ${fromStatus} to ${toStatus}`,
    },
  });
};

taskActivitySchema.statics.logAssignment = function (
  taskId: Types.ObjectId,
  projectId: Types.ObjectId,
  actor: Types.ObjectId,
  fromAssignee: Types.ObjectId | null,
  toAssignee: Types.ObjectId | null
) {
  const action = toAssignee
    ? TASK_ACTIVITY_ACTIONS.ASSIGN
    : TASK_ACTIVITY_ACTIONS.UNASSIGN;
  return this.create({
    taskId,
    projectId,
    actor,
    action,
    from: { assignee: fromAssignee },
    to: { assignee: toAssignee },
    metadata: {
      timestamp: new Date(),
      description: toAssignee ? "Task assigned" : "Task unassigned",
    },
  });
};

taskActivitySchema.statics.logFieldUpdate = function (
  taskId: Types.ObjectId,
  projectId: Types.ObjectId,
  actor: Types.ObjectId,
  changes: Record<string, { from: any; to: any }>
) {
  return this.create({
    taskId,
    projectId,
    actor,
    action: TASK_ACTIVITY_ACTIONS.EDIT,
    from: Object.fromEntries(
      Object.entries(changes).map(([key, value]) => [key, value.from])
    ),
    to: Object.fromEntries(
      Object.entries(changes).map(([key, value]) => [key, value.to])
    ),
    metadata: {
      timestamp: new Date(),
      description: "Task fields updated",
      changedFields: Object.keys(changes),
    },
  });
};

// Interface for static methods
interface ITaskActivityModel extends Model<ITaskActivity> {
  logTaskCreation(
    taskId: Types.ObjectId,
    projectId: Types.ObjectId,
    actor: Types.ObjectId,
    taskData: any
  ): Promise<ITaskActivity>;

  logStatusChange(
    taskId: Types.ObjectId,
    projectId: Types.ObjectId,
    actor: Types.ObjectId,
    fromStatus: string,
    toStatus: string
  ): Promise<ITaskActivity>;

  logAssignment(
    taskId: Types.ObjectId,
    projectId: Types.ObjectId,
    actor: Types.ObjectId,
    fromAssignee: Types.ObjectId | null,
    toAssignee: Types.ObjectId | null
  ): Promise<ITaskActivity>;

  logFieldUpdate(
    taskId: Types.ObjectId,
    projectId: Types.ObjectId,
    actor: Types.ObjectId,
    changes: Record<string, { from: any; to: any }>
  ): Promise<ITaskActivity>;
}

export const TaskActivity = model<ITaskActivity, ITaskActivityModel>(
  "TaskActivity",
  taskActivitySchema
);
