import {
  UserServiceResponse,
  UsersServiceResponse,
  TaskServiceResponse,
} from "../types";

// User Service Integration Stub
export class UserService {
  private static baseUrl =
    process.env.USER_SERVICE_URL || "http://localhost:4001";

  /**
   * Get user details by user ID
   */
  static async getUserById(userId: string): Promise<UserServiceResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/${userId}`);

      if (!response.ok) {
        // Fallback to stub if service is unavailable
        console.log(
          `[FALLBACK] User service unavailable, using stub for ID: ${userId}`
        );
        return {
          success: true,
          data: {
            _id: userId,
            email: `user${userId.slice(-4)}@example.com`,
            fullName: `User ${userId.slice(-4)}`,
            profileImage: undefined,
          },
        };
      }

      const data = (await response.json()) as any;
      if (data.success && data.data) {
        return {
          success: true,
          data: {
            _id: data.data._id,
            email: data.data.email,
            fullName:
              data.data.fullName ||
              `${data.data.firstName || ""} ${
                data.data.lastName || ""
              }`.trim() ||
              "Unknown User",
            profileImage: data.data.profileImage,
          },
        };
      }

      return { success: false, message: "User not found" };
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      // Fallback to stub on network error
      console.log(`[FALLBACK] Network error, using stub for ID: ${userId}`);
      return {
        success: true,
        data: {
          _id: userId,
          email: `user${userId.slice(-4)}@example.com`,
          fullName: `User ${userId.slice(-4)}`,
          profileImage: undefined,
        },
      };
    }
  }

  /**
   * Get user details by email
   */
  static async getUserByEmail(email: string): Promise<UserServiceResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/users/email/${encodeURIComponent(email)}`
      );

      if (!response.ok) {
        // Fallback to stub if service is unavailable
        console.log(
          `[FALLBACK] User service unavailable, using stub for email: ${email}`
        );
        return {
          success: true,
          data: {
            _id: "507f1f77bcf86cd799439011",
            email: email,
            fullName: "Sample User",
            profileImage: undefined,
          },
        };
      }

      const data = (await response.json()) as any;
      if (data.success && data.data) {
        return {
          success: true,
          data: {
            _id: data.data._id,
            email: data.data.email,
            fullName:
              data.data.fullName ||
              `${data.data.firstName || ""} ${
                data.data.lastName || ""
              }`.trim() ||
              "Unknown User",
            profileImage: data.data.profileImage,
          },
        };
      }

      return { success: false, message: "User not found" };
    } catch (error) {
      console.error("Error fetching user by email:", error);
      // Fallback to stub on network error
      console.log(`[FALLBACK] Network error, using stub for email: ${email}`);
      return {
        success: true,
        data: {
          _id: "507f1f77bcf86cd799439011",
          email: email,
          fullName: "Sample User",
          profileImage: undefined,
        },
      };
    }
  }

  /**
   * Get multiple users by IDs
   */
  static async getUsersByIds(userIds: string[]): Promise<UsersServiceResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds }),
      });

      if (!response.ok) {
        // Fallback to stub if service is unavailable
        console.log(
          `[FALLBACK] User service unavailable, using stub for IDs:`,
          userIds
        );
        const users = userIds.map((id) => ({
          _id: id,
          email: `user${id.slice(-4)}@example.com`,
          fullName: `User ${id.slice(-4)}`,
          profileImage: undefined,
        }));

        return {
          success: true,
          data: users,
        };
      }

      const data = (await response.json()) as any;
      if (data.success && data.data) {
        const formattedUsers = data.data.map((user: any) => ({
          _id: user._id,
          email: user.email,
          fullName:
            user.fullName ||
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            "Unknown User",
          profileImage: user.profileImage,
        }));

        return {
          success: true,
          data: formattedUsers,
        };
      }

      return { success: false, message: "Users not found" };
    } catch (error) {
      console.error("Error fetching users by IDs:", error);
      // Fallback to stub on network error
      console.log(`[FALLBACK] Network error, using stub for IDs:`, userIds);
      const users = userIds.map((id) => ({
        _id: id,
        email: `user${id.slice(-4)}@example.com`,
        fullName: `User ${id.slice(-4)}`,
        profileImage: undefined,
      }));

      return {
        success: true,
        data: users,
      };
    }
  }
}

// Task Service Integration Stub
export class TaskService {
  private static baseUrl =
    process.env.TASK_SERVICE_URL || "http://localhost:4003";

  /**
   * Get tasks for a project
   */
  static async getProjectTasks(
    projectId: string
  ): Promise<TaskServiceResponse> {
    try {
      // TODO: Implement actual HTTP call to task service
      // const response = await fetch(`${this.baseUrl}/api/tasks/project/${projectId}`);
      // const data = await response.json();
      // return data;

      // Stub implementation
      console.log(`[STUB] Getting tasks for project: ${projectId}`);
      return {
        success: true,
        data: [
          {
            _id: "task1",
            title: "Sample Task 1",
            status: "completed",
            priority: "high",
            assignedTo: "507f1f77bcf86cd799439011",
            dueDate: new Date(Date.now() + 86400000), // tomorrow
          },
          {
            _id: "task2",
            title: "Sample Task 2",
            status: "in_progress",
            priority: "medium",
            assignedTo: "507f1f77bcf86cd799439012",
          },
        ],
      };
    } catch (error) {
      console.error("Error fetching project tasks:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get task statistics for a project
   */
  static async getProjectTaskStats(
    projectId: string
  ): Promise<{ total: number; completed: number }> {
    try {
      // TODO: Implement actual HTTP call to task service
      // const response = await fetch(`${this.baseUrl}/api/tasks/project/${projectId}/stats`);
      // const data = await response.json();
      // return data;

      // Stub implementation
      console.log(`[STUB] Getting task stats for project: ${projectId}`);
      return {
        total: 10,
        completed: 6,
      };
    } catch (error) {
      console.error("Error fetching project task stats:", error);
      return {
        total: 0,
        completed: 0,
      };
    }
  }

  /**
   * Update project tasks when project is deleted/archived
   */
  static async updateProjectTasks(
    projectId: string,
    status: "archived" | "deleted"
  ): Promise<boolean> {
    try {
      // TODO: Implement actual HTTP call to task service
      // const response = await fetch(`${this.baseUrl}/api/tasks/project/${projectId}/status`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status })
      // });
      // return response.ok;

      // Stub implementation
      console.log(
        `[STUB] Updating tasks for project ${projectId} to status: ${status}`
      );
      return true;
    } catch (error) {
      console.error("Error updating project tasks:", error);
      return false;
    }
  }
}

// Notification Service Integration Stub
export class NotificationService {
  /**
   * Send project invitation notification
   */
  static async sendProjectInvitation(data: {
    recipientEmail: string;
    recipientId?: string;
    projectName: string;
    inviterName: string;
    invitationCode: string;
    projectId: string;
  }): Promise<boolean> {
    try {
      // TODO: Implement actual notification sending (email, push, etc.)
      console.log(`[STUB] Sending project invitation notification:`, {
        to: data.recipientEmail,
        project: data.projectName,
        from: data.inviterName,
        code: data.invitationCode,
      });

      // Simulate email sending
      return true;
    } catch (error) {
      console.error("Error sending project invitation:", error);
      return false;
    }
  }

  /**
   * Send project update notification
   */
  static async sendProjectUpdate(data: {
    memberEmails: string[];
    projectName: string;
    updateType:
      | "role_changed"
      | "member_added"
      | "member_removed"
      | "project_updated";
    details: string;
  }): Promise<boolean> {
    try {
      // TODO: Implement actual notification sending
      console.log(`[STUB] Sending project update notification:`, {
        to: data.memberEmails,
        project: data.projectName,
        type: data.updateType,
        details: data.details,
      });

      return true;
    } catch (error) {
      console.error("Error sending project update:", error);
      return false;
    }
  }

  /**
   * Send project deletion notification
   */
  static async sendProjectDeletion(data: {
    memberEmails: string[];
    projectName: string;
    deletedBy: string;
  }): Promise<boolean> {
    try {
      // TODO: Implement actual notification sending
      console.log(`[STUB] Sending project deletion notification:`, {
        to: data.memberEmails,
        project: data.projectName,
        deletedBy: data.deletedBy,
      });

      return true;
    } catch (error) {
      console.error("Error sending project deletion notification:", error);
      return false;
    }
  }
}
