import {
  IProject,
  IProjectListItem,
  IProjectMember,
  CreateProjectRequest,
  UpdateProjectRequest,
  InviteMemberRequest,
  UpdateMemberRoleRequest,
  ProjectsResponse,
  ProjectResponse,
  MembersResponse,
  ProjectsQuery,
} from "@/types/project";

const BASE_URL = "http://localhost:4002/api";

class ProjectService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem("token");
    const url = `${BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  // Project CRUD operations
  async getProjects(params: ProjectsQuery = {}): Promise<ProjectsResponse> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/projects${queryString ? `?${queryString}` : ""}`;

    return this.makeRequest<ProjectsResponse>(endpoint);
  }

  async getProject(projectId: string): Promise<ProjectResponse> {
    return this.makeRequest<ProjectResponse>(`/projects/${projectId}`);
  }

  async createProject(data: CreateProjectRequest): Promise<ProjectResponse> {
    return this.makeRequest<ProjectResponse>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProject(
    projectId: string,
    data: UpdateProjectRequest
  ): Promise<ProjectResponse> {
    return this.makeRequest<ProjectResponse>(`/projects/${projectId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProject(
    projectId: string
  ): Promise<{ success: boolean; message: string }> {
    return this.makeRequest(`/projects/${projectId}`, {
      method: "DELETE",
    });
  }

  // Member management
  async getProjectMembers(projectId: string): Promise<MembersResponse> {
    return this.makeRequest<MembersResponse>(`/projects/${projectId}/members`);
  }

  async inviteMember(
    projectId: string,
    data: InviteMemberRequest
  ): Promise<{
    success: boolean;
    message: string;
    data: { inviteId: string };
  }> {
    return this.makeRequest(`/projects/${projectId}/invite`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateMemberRole(
    projectId: string,
    memberId: string,
    data: UpdateMemberRoleRequest
  ): Promise<{ success: boolean; message: string }> {
    return this.makeRequest(`/projects/${projectId}/members/${memberId}/role`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async removeMember(
    projectId: string,
    memberId: string
  ): Promise<{ success: boolean; message: string }> {
    return this.makeRequest(`/projects/${projectId}/members/${memberId}`, {
      method: "DELETE",
    });
  }

  async leaveProject(
    projectId: string
  ): Promise<{ success: boolean; message: string }> {
    return this.makeRequest(`/projects/${projectId}/leave`, {
      method: "POST",
    });
  }

  async joinProject(invitationCode: string): Promise<{
    success: boolean;
    message: string;
    data: { projectId: string };
  }> {
    return this.makeRequest(`/projects/join/${invitationCode}`, {
      method: "POST",
    });
  }
}

export const projectService = new ProjectService();
export default projectService;
