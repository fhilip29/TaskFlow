import { Response } from "express";
import { Project } from "../models/Project";
import {
  UserService,
  TaskService,
  NotificationService,
} from "../services/integrationService";
import {
  AuthenticatedRequest,
  ApiResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  InviteMemberRequest,
  UpdateMemberRoleRequest,
  ProjectResponse,
  ProjectListResponse,
  PaginationQuery,
} from "../types";
import {
  generateProjectQR,
  formatProjectResponse,
  buildProjectQuery,
  buildSortObject,
  calculatePagination,
  isValidObjectId,
  errorResponse,
  successResponse,
} from "../utils/helpers";

/**
 * Create a new project
 * POST /api/projects
 */
export const createProject = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<ProjectResponse>>
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      const { response, statusCode } = errorResponse(
        "User not authenticated",
        401
      );
      res.status(statusCode).json(response);
      return;
    }

    const projectData: CreateProjectRequest = req.body;

    // Get user details for creator
    const userResult = await UserService.getUserById(userId);
    if (!userResult.success || !userResult.data) {
      const { response, statusCode } = errorResponse(
        "Unable to verify user",
        400
      );
      res.status(statusCode).json(response);
      return;
    }

    const user = userResult.data;

    // Create project
    const project = new Project({
      name: projectData.name,
      description: projectData.description,
      createdBy: userId,
      settings: {
        isPublic: projectData.isPublic || false,
        allowMemberInvite: projectData.allowMemberInvite ?? true,
        maxMembers: projectData.maxMembers,
      },
    });

    // Generate QR code for invitation
    const qrCodeUrl = await generateProjectQR(
      project.invitationCode,
      project.name
    );
    if (qrCodeUrl) {
      project.qrCodeUrl = qrCodeUrl;
    }

    await project.save();

    // Update the creator's email in members array
    const creatorMember = project.members.find(
      (m) => m.userId.toString() === userId
    );
    if (creatorMember && user.email) {
      creatorMember.email = user.email;
    }
    await project.save();

    const response = successResponse(
      formatProjectResponse(project, user),
      "Project created successfully"
    );

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating project:", error);
    const { response, statusCode } = errorResponse(
      "Failed to create project",
      500,
      error
    );
    res.status(statusCode).json(response);
  }
};

/**
 * Get all projects for authenticated user
 * GET /api/projects
 */
export const getUserProjects = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<ProjectListResponse[]>>
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      const { response, statusCode } = errorResponse(
        "User not authenticated",
        401
      );
      res.status(statusCode).json(response);
      return;
    }

    const queryParams = req.query as PaginationQuery;
    const page = queryParams.page || 1;
    const limit = queryParams.limit || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = buildProjectQuery(queryParams, userId);
    const sort = buildSortObject(queryParams.sort);

    // Get projects with pagination
    const [projects, totalCount] = await Promise.all([
      Project.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Project.countDocuments(query),
    ]);

    // Get creator details for all projects
    const creatorIds = [
      ...new Set(projects.map((p: any) => p.createdBy.toString())),
    ];

    // Get all admin user IDs for all projects
    const adminIds = [
      ...new Set(
        projects.flatMap((p: any) =>
          p.members
            .filter((m: any) => m.role === "admin" && m.status === "active")
            .map((m: any) => m.userId.toString())
        )
      ),
    ];

    const [creatorsResult, adminsResult] = await Promise.all([
      UserService.getUsersByIds(creatorIds),
      UserService.getUsersByIds(adminIds),
    ]);

    const creatorsData = creatorsResult.success ? creatorsResult.data : [];
    const adminsData = adminsResult.success ? adminsResult.data : [];

    // Format response
    const projectList: ProjectListResponse[] = projects.map((project) => {
      const userMember = project.members.find(
        (m: any) => m.userId.toString() === userId && m.status === "active"
      );

      // Find creator info
      const creatorInfo = creatorsData?.find(
        (creator: any) => creator._id === project.createdBy.toString()
      );

      // Get admin members info
      const projectAdmins = project.members
        .filter((m: any) => m.role === "admin" && m.status === "active")
        .map((adminMember: any) => {
          const adminInfo = adminsData?.find(
            (admin: any) => admin._id === adminMember.userId.toString()
          );
          return {
            _id: adminMember.userId.toString(),
            fullName: adminInfo?.fullName || "Unknown User",
            email: adminInfo?.email || adminMember.email,
            avatar: adminInfo?.profileImage,
          };
        });

      const activeMembers = project.members.filter(
        (m: any) => m.status === "active"
      ).length;
      const pendingInvites = project.members.filter(
        (m: any) => m.status === "invited"
      ).length;

      return {
        _id: project._id.toString(),
        name: project.name,
        description: project.description,
        createdBy: {
          _id: project.createdBy.toString(),
          fullName: creatorInfo?.fullName || "Unknown User",
          email: creatorInfo?.email || "",
          avatar: creatorInfo?.profileImage,
        },
        admins: projectAdmins,
        role: userMember?.role || "viewer",
        memberCount: project.members.length,
        activeMembers,
        pendingInvites,
        taskCount: project.metadata.totalTasks,
        progress: project.metadata.progress,
        status: project.status,
        invitationCode: project.invitationCode,
        qrCodeUrl: project.qrCodeUrl,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      };
    });

    const pagination = calculatePagination(totalCount, page, limit);
    const response = successResponse(
      projectList,
      "Projects retrieved successfully",
      pagination
    );

    res.status(200).json(response);
  } catch (error) {
    console.error("Error getting user projects:", error);
    const { response, statusCode } = errorResponse(
      "Failed to get projects",
      500,
      error
    );
    res.status(statusCode).json(response);
  }
};

/**
 * Get project by ID
 * GET /api/projects/:projectId
 */
export const getProjectById = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<ProjectResponse>>
): Promise<void> => {
  try {
    const projectId = req.params.projectId;
    const userId = req.user?.userId;

    if (!isValidObjectId(projectId)) {
      const { response, statusCode } = errorResponse("Invalid project ID", 400);
      res.status(statusCode).json(response);
      return;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      const { response, statusCode } = errorResponse("Project not found", 404);
      res.status(statusCode).json(response);
      return;
    }

    // Check if user is member
    if (!project.isMember(userId!)) {
      const { response, statusCode } = errorResponse("Access denied", 403);
      res.status(statusCode).json(response);
      return;
    }

    // Get creator details
    const creatorResult = await UserService.getUserById(
      project.createdBy.toString()
    );
    const creatorDetails = creatorResult.success ? creatorResult.data : null;

    // Get member details
    const memberIds = project.members.map((m) => m.userId.toString());
    const membersResult = await UserService.getUsersByIds(memberIds);
    const membersData = membersResult.success ? membersResult.data : [];

    // Format project response with member details
    const formattedProject = formatProjectResponse(project, creatorDetails);
    if (membersData) {
      formattedProject.members = project.members.map((member: any) => {
        const userData = membersData.find(
          (u: any) => u._id === member.userId.toString()
        );
        return {
          userId: member.userId.toString(),
          email: member.email,
          fullName: userData?.fullName || "",
          role: member.role,
          joinedAt: member.joinedAt,
          status: member.status,
        };
      });
    }

    const response = successResponse(
      formattedProject,
      "Project retrieved successfully"
    );
    res.status(200).json(response);
  } catch (error) {
    console.error("Error getting project:", error);
    const { response, statusCode } = errorResponse(
      "Failed to get project",
      500,
      error
    );
    res.status(statusCode).json(response);
  }
};

/**
 * Update project
 * PUT /api/projects/:projectId
 */
export const updateProject = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<ProjectResponse>>
): Promise<void> => {
  try {
    const projectId = req.params.projectId;
    const userId = req.user?.userId;
    const updateData: UpdateProjectRequest = req.body;

    if (!isValidObjectId(projectId)) {
      const { response, statusCode } = errorResponse("Invalid project ID", 400);
      res.status(statusCode).json(response);
      return;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      const { response, statusCode } = errorResponse("Project not found", 404);
      res.status(statusCode).json(response);
      return;
    }

    // Check if user has admin permission
    if (!project.hasPermission(userId!, "admin")) {
      const { response, statusCode } = errorResponse(
        "Access denied. Admin role required.",
        403
      );
      res.status(statusCode).json(response);
      return;
    }

    // Update fields
    if (updateData.name) project.name = updateData.name;
    if (updateData.description !== undefined)
      project.description = updateData.description;
    if (updateData.status) project.status = updateData.status;

    if (updateData.settings) {
      if (updateData.settings.isPublic !== undefined) {
        project.settings.isPublic = updateData.settings.isPublic;
      }
      if (updateData.settings.allowMemberInvite !== undefined) {
        project.settings.allowMemberInvite =
          updateData.settings.allowMemberInvite;
      }
      if (updateData.settings.maxMembers !== undefined) {
        project.settings.maxMembers = updateData.settings.maxMembers;
      }
    }

    await project.save();

    // Update tasks if project is archived
    if (updateData.status === "archived") {
      await TaskService.updateProjectTasks(projectId, "archived");
    }

    // Get creator details for response
    const creatorResult = await UserService.getUserById(
      project.createdBy.toString()
    );
    const creatorDetails = creatorResult.success ? creatorResult.data : null;

    const response = successResponse(
      formatProjectResponse(project, creatorDetails),
      "Project updated successfully"
    );

    res.status(200).json(response);
  } catch (error) {
    console.error("Error updating project:", error);
    const { response, statusCode } = errorResponse(
      "Failed to update project",
      500,
      error
    );
    res.status(statusCode).json(response);
  }
};

/**
 * Delete project
 * DELETE /api/projects/:projectId
 */
export const deleteProject = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<null>>
): Promise<void> => {
  try {
    const projectId = req.params.projectId;
    const userId = req.user?.userId;

    if (!isValidObjectId(projectId)) {
      const { response, statusCode } = errorResponse("Invalid project ID", 400);
      res.status(statusCode).json(response);
      return;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      const { response, statusCode } = errorResponse("Project not found", 404);
      res.status(statusCode).json(response);
      return;
    }

    // Only creator can delete project
    if (project.createdBy.toString() !== userId) {
      const { response, statusCode } = errorResponse(
        "Access denied. Only project creator can delete the project.",
        403
      );
      res.status(statusCode).json(response);
      return;
    }

    // Soft delete by updating status
    project.status = "deleted";
    await project.save();

    // Update associated tasks
    await TaskService.updateProjectTasks(projectId, "deleted");

    // Get member emails for notification
    const memberEmails = project.members
      .filter((m) => m.status === "active" && m.userId.toString() !== userId)
      .map((m) => m.email);

    // Send deletion notification
    if (memberEmails.length > 0) {
      const userResult = await UserService.getUserById(userId!);
      const userName =
        userResult.success && userResult.data
          ? userResult.data.fullName || "Unknown User"
          : "Unknown User";

      await NotificationService.sendProjectDeletion({
        memberEmails,
        projectName: project.name,
        deletedBy: userName,
      });
    }

    const response = successResponse(null, "Project deleted successfully");
    res.status(200).json(response);
  } catch (error) {
    console.error("Error deleting project:", error);
    const { response, statusCode } = errorResponse(
      "Failed to delete project",
      500,
      error
    );
    res.status(statusCode).json(response);
  }
};
