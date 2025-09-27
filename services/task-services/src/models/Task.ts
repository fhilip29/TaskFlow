import { Schema, model, Types, Document } from "mongoose";

// Task status enum with allowed transitions
export const TASK_STATUS = {
  BACKLOG: "backlog",
  IN_PROGRESS: "in_progress",
  BLOCKED: "blocked",
  DONE: "done",
  ARCHIVED: "archived",
} as const;

export const TASK_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

// Status transitions state machine
export const STATUS_TRANSITIONS: Record<string, string[]> = {
  [TASK_STATUS.BACKLOG]: [TASK_STATUS.IN_PROGRESS, TASK_STATUS.ARCHIVED],
  [TASK_STATUS.IN_PROGRESS]: [
    TASK_STATUS.BLOCKED,
    TASK_STATUS.DONE,
    TASK_STATUS.ARCHIVED,
  ],
  [TASK_STATUS.BLOCKED]: [TASK_STATUS.IN_PROGRESS, TASK_STATUS.ARCHIVED],
  [TASK_STATUS.DONE]: [TASK_STATUS.ARCHIVED, TASK_STATUS.IN_PROGRESS],
  [TASK_STATUS.ARCHIVED]: [],
};

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];
export type TaskPriority = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];

export interface ITask extends Document {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  creator: Types.ObjectId;
  assignee?: Types.ObjectId;
  dueDate?: Date;
  labels: string[];
  watchers: Types.ObjectId[];
  isDeleted: boolean;
  lastStatusChangeAt: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  canTransitionTo(newStatus: TaskStatus): boolean;
  isAssignedTo(userId: Types.ObjectId | string): boolean;
  isCreatedBy(userId: Types.ObjectId | string): boolean;
  addWatcher(userId: Types.ObjectId): void;
  removeWatcher(userId: Types.ObjectId): void;
}

const taskSchema = new Schema<ITask>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      required: [true, "Project ID is required"],
      ref: "Project",
      index: true,
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    status: {
      type: String,
      enum: Object.values(TASK_STATUS),
      default: TASK_STATUS.BACKLOG,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(TASK_PRIORITY),
      default: TASK_PRIORITY.MEDIUM,
      index: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      required: [true, "Creator is required"],
      ref: "User",
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    dueDate: {
      type: Date,
      index: true,
    },
    labels: [
      {
        type: String,
        trim: true,
        maxlength: [50, "Label cannot exceed 50 characters"],
      },
    ],
    watchers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    lastStatusChangeAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimized queries
taskSchema.index({ projectId: 1, status: 1, priority: 1 });
taskSchema.index({ assignee: 1, status: 1 });
taskSchema.index({ projectId: 1, status: 1, dueDate: 1 });
taskSchema.index({ projectId: 1, isDeleted: 1, updatedAt: -1 });
taskSchema.index({ labels: 1 });

// Text index for search functionality
taskSchema.index(
  {
    title: "text",
    description: "text",
  },
  {
    weights: { title: 10, description: 5 },
  }
);

// Instance methods
taskSchema.methods.canTransitionTo = function (newStatus: TaskStatus): boolean {
  const allowedTransitions = STATUS_TRANSITIONS[this.status];
  return allowedTransitions ? allowedTransitions.includes(newStatus) : false;
};

taskSchema.methods.isAssignedTo = function (
  userId: Types.ObjectId | string
): boolean {
  if (!this.assignee) return false;
  return this.assignee.toString() === userId.toString();
};

taskSchema.methods.isCreatedBy = function (
  userId: Types.ObjectId | string
): boolean {
  return this.creator.toString() === userId.toString();
};

taskSchema.methods.addWatcher = function (userId: Types.ObjectId): void {
  if (
    !this.watchers.some(
      (watcher: Types.ObjectId) => watcher.toString() === userId.toString()
    )
  ) {
    this.watchers.push(userId);
  }
};

taskSchema.methods.removeWatcher = function (userId: Types.ObjectId): void {
  this.watchers = this.watchers.filter(
    (watcher: Types.ObjectId) => watcher.toString() !== userId.toString()
  );
};

// Pre-save middleware to update lastStatusChangeAt when status changes
taskSchema.pre<ITask>("save", function (next: any) {
  if (this.isModified("status")) {
    this.lastStatusChangeAt = new Date();
  }
  next();
});

// Pre-save middleware to ensure creator is in watchers
taskSchema.pre<ITask>("save", function (next: any) {
  if (this.isNew) {
    this.addWatcher(this.creator);
  }
  next();
});

export const Task = model<ITask>("Task", taskSchema);
