import { Schema, model, Types } from "mongoose";
import { IProject, IProjectMember } from "../types";
import { nanoid } from "nanoid";

// Project Member schema
const projectMemberSchema = new Schema<IProjectMember>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "member", "viewer"],
    default: "member",
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  invitedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: ["active", "invited", "removed"],
    default: "invited",
  },
  lastActive: {
    type: Date,
  },
  invitationSentAt: {
    type: Date,
    default: Date.now,
  },
});

// Project schema
const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: [100, "Project name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    members: [projectMemberSchema],
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    invitationCode: {
      type: String,
      unique: true,
      default: () => nanoid(8).toUpperCase(),
    },
    qrCodeUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "archived", "deleted"],
      default: "active",
    },
    settings: {
      isPublic: {
        type: Boolean,
        default: false,
      },
      allowMemberInvite: {
        type: Boolean,
        default: true,
      },
      maxMembers: {
        type: Number,
        min: 1,
        max: 1000,
      },
    },
    metadata: {
      totalTasks: {
        type: Number,
        default: 0,
      },
      completedTasks: {
        type: Number,
        default: 0,
      },
      progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
projectSchema.index({ createdBy: 1 });
projectSchema.index({ "members.userId": 1 });
// invitationCode index is created automatically by unique: true
projectSchema.index({ name: "text", description: "text" });
projectSchema.index({ status: 1, updatedAt: -1 });

// Pre-save middleware to add creator as admin member
projectSchema.pre("save", async function (next) {
  if (this.isNew) {
    // Add creator as admin member with a placeholder email
    // The controller should set the proper email before saving
    this.members.push({
      userId: this.createdBy,
      email: "placeholder@email.com", // Temporary placeholder - will be updated by controller
      role: "admin",
      joinedAt: new Date(),
      status: "active",
    } as IProjectMember);
  }
  next();
});

// Method to calculate progress
projectSchema.methods.calculateProgress = function () {
  if (this.metadata.totalTasks === 0) {
    this.metadata.progress = 0;
  } else {
    this.metadata.progress = Math.round(
      (this.metadata.completedTasks / this.metadata.totalTasks) * 100
    );
  }
  return this.metadata.progress;
};

// Method to check if user is member
projectSchema.methods.isMember = function (userId: string | Types.ObjectId) {
  const userIdStr = userId.toString();
  return this.members.some(
    (member: IProjectMember) =>
      member.userId.toString() === userIdStr && member.status === "active"
  );
};

// Method to get member role
projectSchema.methods.getMemberRole = function (
  userId: string | Types.ObjectId
) {
  const userIdStr = userId.toString();
  const member = this.members.find(
    (member: IProjectMember) =>
      member.userId.toString() === userIdStr && member.status === "active"
  );
  return member ? member.role : null;
};

// Method to check if user has permission
projectSchema.methods.hasPermission = function (
  userId: string | Types.ObjectId,
  requiredRole: "admin" | "member" | "viewer"
) {
  const memberRole = this.getMemberRole(userId);
  if (!memberRole) return false;

  const roleHierarchy: Record<string, number> = {
    admin: 3,
    member: 2,
    viewer: 1,
  };
  return roleHierarchy[memberRole] >= roleHierarchy[requiredRole];
};

export const Project = model<IProject>("Project", projectSchema);
