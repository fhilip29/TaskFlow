import { Response } from "express";
import { Project } from "../models/Project";
import {
  UserService,
  NotificationService,
} from "../services/integrationService";
import {
  AuthenticatedRequest,
  ApiResponse,
  InviteMemberRequest,
  UpdateMemberRoleRequest,
  MemberResponse,
} from "../types";
import {
  isValidObjectId,
  errorResponse,
  successResponse,
} from "../utils/helpers";

/**
 * Invite member to project
 * POST /api/projects/:projectId/invite
 */
export const inviteMember = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<{ inviteId: string }>>
): Promise<void> => {
  try {
    const projectId = req.params.projectId;
    const userId = req.user?.userId;
    const inviteData: InviteMemberRequest = req.body;

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

    // Check if user has permission to invite (admin or member if allowed)
    const userRole = project.getMemberRole(userId!);
    if (!userRole) {
      const { response, statusCode } = errorResponse("Access denied", 403);
      res.status(statusCode).json(response);
      return;
    }

    if (
      userRole === "viewer" ||
      (userRole === "member" && !project.settings.allowMemberInvite)
    ) {
      const { response, statusCode } = errorResponse(
        "Insufficient permissions to invite members",
        403
      );
      res.status(statusCode).json(response);
      return;
    }

    // Check max members limit
    const activeMembers = project.members.filter(
      (m) => m.status === "active"
    ).length;
    if (
      project.settings.maxMembers &&
      activeMembers >= project.settings.maxMembers
    ) {
      const { response, statusCode } = errorResponse(
        "Project has reached maximum member limit",
        400
      );
      res.status(statusCode).json(response);
      return;
    }

    let targetUser: any;
    let targetEmail: string;

    // Get user details by ID or email
    if (inviteData.userId) {
      const userResult = await UserService.getUserById(inviteData.userId);
      if (!userResult.success || !userResult.data) {
        const { response, statusCode } = errorResponse("User not found", 404);
        res.status(statusCode).json(response);
        return;
      }
      targetUser = userResult.data;
      targetEmail = targetUser.email;
    } else if (inviteData.email) {
      const userResult = await UserService.getUserByEmail(inviteData.email);
      if (userResult.success && userResult.data) {
        targetUser = userResult.data;
      }
      targetEmail = inviteData.email;
    }

    // Check if user is already a member
    const existingMember = project.members.find(
      (m) =>
        (targetUser && m.userId.toString() === targetUser._id) ||
        m.email.toLowerCase() === targetEmail?.toLowerCase()
    );

    if (existingMember) {
      if (existingMember.status === "active") {
        const { response, statusCode } = errorResponse(
          "User is already a member of this project",
          400
        );
        res.status(statusCode).json(response);
        return;
      } else if (existingMember.status === "invited") {
        const { response, statusCode } = errorResponse(
          "User has already been invited to this project",
          400
        );
        res.status(statusCode).json(response);
        return;
      }
    }

    // Add new member
    const newMember = {
      userId: targetUser ? targetUser._id : null,
      email: targetEmail!,
      role: inviteData.role || "member",
      joinedAt: new Date(),
      invitedBy: userId as any,
      status: "invited" as const,
      invitationSentAt: new Date(),
    };

    if (existingMember) {
      // Update existing removed member
      existingMember.role = newMember.role;
      existingMember.joinedAt = newMember.joinedAt;
      existingMember.invitedBy = newMember.invitedBy as any;
      existingMember.status = newMember.status;
      existingMember.invitationSentAt = newMember.invitationSentAt;
    } else {
      // Add new member
      project.members.push(newMember as any);
    }

    await project.save();

    // Send invitation notification
    const inviterResult = await UserService.getUserById(userId!);
    const inviterName =
      inviterResult.success && inviterResult.data
        ? inviterResult.data.fullName || "Someone"
        : "Someone";

    await NotificationService.sendProjectInvitation({
      recipientEmail: targetEmail!,
      recipientId: targetUser?._id,
      projectName: project.name,
      inviterName,
      invitationCode: project.invitationCode,
      projectId: project._id.toString(),
    });

    const response = successResponse(
      { inviteId: project._id.toString() },
      "Member invited successfully"
    );

    res.status(201).json(response);
  } catch (error) {
    console.error("Error inviting member:", error);
    const { response, statusCode } = errorResponse(
      "Failed to invite member",
      500,
      error
    );
    res.status(statusCode).json(response);
  }
};

/**
 * Join project using invitation code
 * POST /api/projects/join/:invitationCode
 */
export const joinProjectByCode = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<{ projectId: string }>>
): Promise<void> => {
  try {
    const invitationCode = req.params.invitationCode;
    const userId = req.user?.userId;

    if (!invitationCode) {
      const { response, statusCode } = errorResponse(
        "Invitation code is required",
        400
      );
      res.status(statusCode).json(response);
      return;
    }

    const project = await Project.findOne({
      invitationCode: invitationCode.toUpperCase(),
      status: "active",
    });

    if (!project) {
      const { response, statusCode } = errorResponse(
        "Invalid or expired invitation code",
        404
      );
      res.status(statusCode).json(response);
      return;
    }

    // Get user details
    const userResult = await UserService.getUserById(userId!);
    if (!userResult.success || !userResult.data) {
      const { response, statusCode } = errorResponse(
        "Unable to verify user",
        400
      );
      res.status(statusCode).json(response);
      return;
    }

    const user = userResult.data;

    // Check if user is already a member
    const existingMember = project.members.find(
      (m) =>
        m.userId.toString() === userId ||
        m.email.toLowerCase() === user.email.toLowerCase()
    );

    if (existingMember) {
      if (existingMember.status === "active") {
        const { response, statusCode } = errorResponse(
          "You are already a member of this project",
          400
        );
        res.status(statusCode).json(response);
        return;
      } else {
        // Update existing member to active
        existingMember.userId = userId as any;
        existingMember.email = user.email;
        existingMember.status = "active";
        existingMember.joinedAt = new Date();
      }
    } else {
      // Add as new member
      project.members.push({
        userId: userId as any,
        email: user.email,
        role: "member",
        joinedAt: new Date(),
        status: "active",
      } as any);
    }

    await project.save();

    const response = successResponse(
      { projectId: project._id.toString() },
      "Successfully joined the project"
    );

    res.status(200).json(response);
  } catch (error) {
    console.error("Error joining project:", error);
    const { response, statusCode } = errorResponse(
      "Failed to join project",
      500,
      error
    );
    res.status(statusCode).json(response);
  }
};

/**
 * Get project members with detailed information
 * GET /api/projects/:projectId/members
 */
export const getProjectMembers = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<MemberResponse[]>>
): Promise<void> => {
  try {
    const projectId = req.params.projectId;
    const userId = req.user?.userId;
    const { status } = req.query; // Filter by status: 'active', 'invited', 'removed'

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

    // Filter members by status if provided
    let filteredMembers = project.members;
    if (status && typeof status === "string") {
      filteredMembers = project.members.filter((m) => m.status === status);
    }

    // Get user details for all members with userId
    const memberIds = filteredMembers
      .filter((m) => m.userId)
      .map((m) => m.userId.toString());

    const membersResult = await UserService.getUsersByIds(memberIds);
    const membersData = membersResult.success ? membersResult.data : [];

    // Get inviter details for invited members
    const inviterIds = filteredMembers
      .filter((m) => m.invitedBy && m.status === "invited")
      .map((m) => m.invitedBy!.toString());

    const uniqueInviterIds = [...new Set(inviterIds)];
    const invitersResult = await UserService.getUsersByIds(uniqueInviterIds);
    const invitersData = invitersResult.success ? invitersResult.data : [];

    // Format members response with enhanced details
    const members: MemberResponse[] = filteredMembers.map((member) => {
      const userData = membersData
        ? membersData.find((u: any) => u._id === member.userId?.toString())
        : null;

      const inviterData =
        member.invitedBy && invitersData
          ? invitersData.find(
              (u: any) => u._id === member.invitedBy!.toString()
            )
          : null;

      const memberResponse: MemberResponse = {
        userId: member.userId?.toString() || "",
        email: member.email,
        fullName: userData?.fullName || "",
        profileImage: userData?.profileImage,
        role: member.role,
        joinedAt: member.joinedAt,
        status: member.status,
        isOnline: userData?.isOnline || false,
        lastActive: member.lastActive || userData?.lastActive,
      };

      // Add invitation details for invited members
      if (member.status === "invited") {
        memberResponse.invitationSentAt = member.invitationSentAt;
        memberResponse.invitedBy = {
          userId: member.invitedBy?.toString() || "",
          fullName: inviterData?.fullName || "Unknown",
          profileImage: inviterData?.profileImage,
        };
      }

      return memberResponse;
    });

    // Sort members: admins first, then by join date
    members.sort((a, b) => {
      if (a.role === "admin" && b.role !== "admin") return -1;
      if (b.role === "admin" && a.role !== "admin") return 1;
      return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
    });

    const response = successResponse(
      members,
      "Project members retrieved successfully"
    );
    res.status(200).json(response);
  } catch (error) {
    console.error("Error getting project members:", error);
    const { response, statusCode } = errorResponse(
      "Failed to get project members",
      500,
      error
    );
    res.status(statusCode).json(response);
  }
};

/**
 * Update member role
 * PUT /api/projects/:projectId/members/:memberId/role
 */
export const updateMemberRole = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<null>>
): Promise<void> => {
  try {
    const { projectId, memberId } = req.params;
    const userId = req.user?.userId;
    const { role }: UpdateMemberRoleRequest = req.body;

    if (!isValidObjectId(projectId) || !isValidObjectId(memberId)) {
      const { response, statusCode } = errorResponse(
        "Invalid project or member ID",
        400
      );
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

    // Find the member to update
    const member = project.members.find(
      (m) => m.userId.toString() === memberId && m.status === "active"
    );

    if (!member) {
      const { response, statusCode } = errorResponse("Member not found", 404);
      res.status(statusCode).json(response);
      return;
    }

    // Prevent changing creator's role to non-admin
    if (project.createdBy.toString() === memberId && role !== "admin") {
      const { response, statusCode } = errorResponse(
        "Cannot change project creator's role",
        400
      );
      res.status(statusCode).json(response);
      return;
    }

    // Update member role
    member.role = role;
    await project.save();

    // Send notification
    const userResult = await UserService.getUserById(userId!);
    const updaterName =
      userResult.success && userResult.data
        ? userResult.data.fullName || "Someone"
        : "Someone";

    await NotificationService.sendProjectUpdate({
      memberEmails: [member.email],
      projectName: project.name,
      updateType: "role_changed",
      details: `Your role has been changed to ${role} by ${updaterName}`,
    });

    const response = successResponse(null, "Member role updated successfully");
    res.status(200).json(response);
  } catch (error) {
    console.error("Error updating member role:", error);
    const { response, statusCode } = errorResponse(
      "Failed to update member role",
      500,
      error
    );
    res.status(statusCode).json(response);
  }
};

/**
 * Remove member from project
 * DELETE /api/projects/:projectId/members/:memberId
 */
export const removeMember = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<null>>
): Promise<void> => {
  try {
    const { projectId, memberId } = req.params;
    const userId = req.user?.userId;

    if (!isValidObjectId(projectId) || !isValidObjectId(memberId)) {
      const { response, statusCode } = errorResponse(
        "Invalid project or member ID",
        400
      );
      res.status(statusCode).json(response);
      return;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      const { response, statusCode } = errorResponse("Project not found", 404);
      res.status(statusCode).json(response);
      return;
    }

    // Check permissions: admin can remove anyone, members can remove themselves
    const userRole = project.getMemberRole(userId!);
    const canRemove = userRole === "admin" || memberId === userId;

    if (!canRemove) {
      const { response, statusCode } = errorResponse("Access denied", 403);
      res.status(statusCode).json(response);
      return;
    }

    // Cannot remove project creator
    if (project.createdBy.toString() === memberId) {
      const { response, statusCode } = errorResponse(
        "Cannot remove project creator",
        400
      );
      res.status(statusCode).json(response);
      return;
    }

    // Find and remove member
    const memberIndex = project.members.findIndex(
      (m) => m.userId.toString() === memberId && m.status === "active"
    );

    if (memberIndex === -1) {
      const { response, statusCode } = errorResponse("Member not found", 404);
      res.status(statusCode).json(response);
      return;
    }

    const removedMember = project.members[memberIndex];
    project.members[memberIndex].status = "removed";
    await project.save();

    // Send notification if removed by admin
    if (userId !== memberId) {
      const userResult = await UserService.getUserById(userId!);
      const removerName =
        userResult.success && userResult.data
          ? userResult.data.fullName || "Admin"
          : "Admin";

      await NotificationService.sendProjectUpdate({
        memberEmails: [removedMember.email],
        projectName: project.name,
        updateType: "member_removed",
        details: `You have been removed from the project by ${removerName}`,
      });
    }

    const response = successResponse(null, "Member removed successfully");
    res.status(200).json(response);
  } catch (error) {
    console.error("Error removing member:", error);
    const { response, statusCode } = errorResponse(
      "Failed to remove member",
      500,
      error
    );
    res.status(statusCode).json(response);
  }
};

/**
 * Leave project
 * POST /api/projects/:projectId/leave
 */
export const leaveProject = async (
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

    // Cannot leave if user is the creator
    if (project.createdBy.toString() === userId) {
      const { response, statusCode } = errorResponse(
        "Project creator cannot leave the project",
        400
      );
      res.status(statusCode).json(response);
      return;
    }

    // Find and remove member
    const memberIndex = project.members.findIndex(
      (m) => m.userId.toString() === userId && m.status === "active"
    );

    if (memberIndex === -1) {
      const { response, statusCode } = errorResponse(
        "You are not a member of this project",
        404
      );
      res.status(statusCode).json(response);
      return;
    }

    project.members[memberIndex].status = "removed";
    await project.save();

    const response = successResponse(null, "Successfully left the project");
    res.status(200).json(response);
  } catch (error) {
    console.error("Error leaving project:", error);
    const { response, statusCode } = errorResponse(
      "Failed to leave project",
      500,
      error
    );
    res.status(statusCode).json(response);
  }
};
