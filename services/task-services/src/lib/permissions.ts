import { Types } from "mongoose";
import { createError } from "./errors";
import {
  ProjectRole,
  RequiredPermission,
  ProjectData,
  ProjectServiceResponse,
} from "../types";

// Permission mapping - defines what roles can perform which actions
const PERMISSION_MAP: Record<RequiredPermission, ProjectRole[]> = {
  view_tasks: ["admin", "member", "viewer"],
  create_task: ["admin"], // Phase 1: Only admins can create tasks
  edit_task: ["admin"], // Only admins can edit core fields
  assign_task: ["admin"], // Only admins can assign/unassign
  change_status: ["admin", "member"], // Admins + assignee (checked separately)
  delete_task: ["admin"], // Only admins can delete/archive
};

/**
 * Check if a user has the required permission for a project
 * @param projectId - The project ID
 * @param userId - The user ID
 * @param permission - The required permission
 * @returns Promise<boolean>
 */
export const hasProjectPermission = async (
  projectId: string | Types.ObjectId,
  userId: string | Types.ObjectId,
  permission: RequiredPermission
): Promise<boolean> => {
  try {
    const project = await fetchProjectData(projectId.toString());

    if (!project) {
      return false;
    }

    // Check if user is project member
    const member = project.members.find(
      (m) => m.userId === userId.toString() && m.status === "active"
    );

    if (!member) {
      return false;
    }

    // Check if user's role has the required permission
    const allowedRoles = PERMISSION_MAP[permission];
    return allowedRoles.includes(member.role);
  } catch (error) {
    console.error("Error checking project permission:", error);
    return false;
  }
};

/**
 * Assert that a user has the required permission for a project
 * Throws an error if the user doesn't have permission
 * @param projectId - The project ID
 * @param userId - The user ID
 * @param permission - The required permission
 * @returns Promise<void>
 */
export const assertProjectPermission = async (
  projectId: string | Types.ObjectId,
  userId: string | Types.ObjectId,
  permission: RequiredPermission = "view_tasks"
): Promise<void> => {
  const hasPermission = await hasProjectPermission(
    projectId,
    userId,
    permission
  );

  if (!hasPermission) {
    throw createError.forbidden(
      `Insufficient permissions to ${permission.replace("_", " ")}`
    );
  }
};

/**
 * Get user's role in a project
 * @param projectId - The project ID
 * @param userId - The user ID
 * @returns Promise<ProjectRole | null>
 */
export const getUserProjectRole = async (
  projectId: string | Types.ObjectId,
  userId: string | Types.ObjectId
): Promise<ProjectRole | null> => {
  try {
    const project = await fetchProjectData(projectId.toString());

    if (!project) {
      return null;
    }

    const member = project.members.find(
      (m) => m.userId === userId.toString() && m.status === "active"
    );

    return member ? member.role : null;
  } catch (error) {
    console.error("Error getting user project role:", error);
    return null;
  }
};

/**
 * Check if user is project admin
 * @param projectId - The project ID
 * @param userId - The user ID
 * @returns Promise<boolean>
 */
export const isProjectAdmin = async (
  projectId: string | Types.ObjectId,
  userId: string | Types.ObjectId
): Promise<boolean> => {
  const role = await getUserProjectRole(projectId, userId);
  return role === "admin";
};

/**
 * Check if user is project member (any role)
 * @param projectId - The project ID
 * @param userId - The user ID
 * @returns Promise<boolean>
 */
export const isProjectMember = async (
  projectId: string | Types.ObjectId,
  userId: string | Types.ObjectId
): Promise<boolean> => {
  const role = await getUserProjectRole(projectId, userId);
  return role !== null;
};

/**
 * Check if user can change task status
 * Special permission check for status changes - allows admin OR current assignee
 * @param projectId - The project ID
 * @param userId - The user ID
 * @param taskAssigneeId - The task assignee ID (optional)
 * @returns Promise<boolean>
 */
export const canChangeTaskStatus = async (
  projectId: string | Types.ObjectId,
  userId: string | Types.ObjectId,
  taskAssigneeId?: string | Types.ObjectId
): Promise<boolean> => {
  // First check if user is project admin
  if (await isProjectAdmin(projectId, userId)) {
    return true;
  }

  // If not admin, check if user is the assignee
  if (taskAssigneeId && userId.toString() === taskAssigneeId.toString()) {
    // Also verify they are a project member
    return await isProjectMember(projectId, userId);
  }

  return false;
};

/**
 * Assert that a user can change task status
 * @param projectId - The project ID
 * @param userId - The user ID
 * @param taskAssigneeId - The task assignee ID (optional)
 * @returns Promise<void>
 */
export const assertCanChangeTaskStatus = async (
  projectId: string | Types.ObjectId,
  userId: string | Types.ObjectId,
  taskAssigneeId?: string | Types.ObjectId
): Promise<void> => {
  const canChange = await canChangeTaskStatus(
    projectId,
    userId,
    taskAssigneeId
  );

  if (!canChange) {
    throw createError.forbidden(
      "Only project admins or task assignees can change task status"
    );
  }
};

/**
 * Validate that assignee is a project member
 * @param projectId - The project ID
 * @param assigneeId - The assignee user ID
 * @returns Promise<boolean>
 */
export const validateAssigneeIsMember = async (
  projectId: string | Types.ObjectId,
  assigneeId: string | Types.ObjectId
): Promise<boolean> => {
  return await isProjectMember(projectId, assigneeId);
};

/**
 * Assert that assignee is a project member
 * @param projectId - The project ID
 * @param assigneeId - The assignee user ID
 * @returns Promise<void>
 */
export const assertAssigneeIsMember = async (
  projectId: string | Types.ObjectId,
  assigneeId: string | Types.ObjectId
): Promise<void> => {
  const isMember = await validateAssigneeIsMember(projectId, assigneeId);

  if (!isMember) {
    throw createError.assigneeNotMember();
  }
};

/**
 * Fetch project data from project service
 * This would typically make an HTTP request to the project service
 * For now, we'll simulate it - in production, replace with actual API call
 */
async function fetchProjectData(
  projectId: string
): Promise<ProjectData | null> {
  try {
    // TODO: Replace with actual HTTP request to project service
    // const response = await fetch(`${process.env.PROJECT_SERVICE_URL}/api/projects/${projectId}`);
    // const result: ProjectServiceResponse = await response.json();

    // For now, simulate project data - this should be replaced with actual service call
    // In production, you would make an HTTP request to the project service

    // This is a placeholder - implement actual service integration
    const mockProject: ProjectData = {
      _id: projectId,
      name: "Mock Project",
      createdBy: "mockUserId",
      members: [],
      status: "active",
    };

    return mockProject;
  } catch (error) {
    console.error("Error fetching project data:", error);
    return null;
  }
}
