import { ApiResponse, PaginatedResponse } from "@/types/backend";

// Task types aligned with backend schema
export type TaskStatus =
  | "backlog"
  | "in_progress"
  | "blocked"
  | "done"
  | "archived";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface ITask {
  _id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  creator: string; // User ID
  assignee?: string; // User ID
  dueDate?: Date;
  labels: string[];
  watchers: string[]; // User IDs
  isDeleted: boolean;
  lastStatusChangeAt: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskActivity {
  _id: string;
  taskId: string;
  userId: string;
  action: string;
  oldValue?: any;
  newValue?: any;
  metadata: Record<string, any>;
  timestamp: Date;
}

export interface CreateTaskRequest {
  projectId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  assignee?: string;
  dueDate?: Date;
  labels?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  dueDate?: Date;
  labels?: string[];
}

export interface TaskFilters {
  projectId?: string;
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignee?: string[];
  creator?: string;
  labels?: string[];
  search?: string;
  dueDate?: {
    from?: Date;
    to?: Date;
  };
}

export interface TaskStats {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  overdue: number;
  dueSoon: number;
}

const API_BASE =
  process.env.NEXT_PUBLIC_TASK_SERVICE_URL || "http://localhost:3003";

class TaskService {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.message || "Request failed");
    }

    return response.json();
  }

  // Task CRUD operations
  async createTask(data: CreateTaskRequest): Promise<ApiResponse<ITask>> {
    return this.fetchWithAuth("/api/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getTasks(
    filters?: TaskFilters,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<ITask>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v.toString()));
          } else if (typeof value === "object" && key === "dueDate") {
            const dueDateFilter = value as { from?: Date; to?: Date };
            if (dueDateFilter.from) {
              params.append("dueDateFrom", dueDateFilter.from.toISOString());
            }
            if (dueDateFilter.to) {
              params.append("dueDateTo", dueDateFilter.to.toISOString());
            }
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    return this.fetchWithAuth(`/api/tasks?${params}`);
  }

  async getTaskById(id: string): Promise<ApiResponse<ITask>> {
    return this.fetchWithAuth(`/api/tasks/${id}`);
  }

  async updateTask(
    id: string,
    data: UpdateTaskRequest
  ): Promise<ApiResponse<ITask>> {
    return this.fetchWithAuth(`/api/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string): Promise<ApiResponse<void>> {
    return this.fetchWithAuth(`/api/tasks/${id}`, {
      method: "DELETE",
    });
  }

  // Task status operations
  async updateTaskStatus(
    id: string,
    status: TaskStatus
  ): Promise<ApiResponse<ITask>> {
    return this.fetchWithAuth(`/api/tasks/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  async assignTask(id: string, assignee: string): Promise<ApiResponse<ITask>> {
    return this.fetchWithAuth(`/api/tasks/${id}/assign`, {
      method: "PATCH",
      body: JSON.stringify({ assignee }),
    });
  }

  async unassignTask(id: string): Promise<ApiResponse<ITask>> {
    return this.fetchWithAuth(`/api/tasks/${id}/unassign`, {
      method: "PATCH",
    });
  }

  // Watcher operations
  async addWatcher(id: string, userId: string): Promise<ApiResponse<ITask>> {
    return this.fetchWithAuth(`/api/tasks/${id}/watchers`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  }

  async removeWatcher(id: string, userId: string): Promise<ApiResponse<ITask>> {
    return this.fetchWithAuth(`/api/tasks/${id}/watchers/${userId}`, {
      method: "DELETE",
    });
  }

  // Activity and analytics
  async getTaskActivity(id: string): Promise<ApiResponse<ITaskActivity[]>> {
    return this.fetchWithAuth(`/api/tasks/${id}/activity`);
  }

  async getTaskStats(filters?: TaskFilters): Promise<ApiResponse<TaskStats>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v.toString()));
          } else if (typeof value === "object" && key === "dueDate") {
            const dueDateFilter = value as { from?: Date; to?: Date };
            if (dueDateFilter.from) {
              params.append("dueDateFrom", dueDateFilter.from.toISOString());
            }
            if (dueDateFilter.to) {
              params.append("dueDateTo", dueDateFilter.to.toISOString());
            }
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const queryString = params.toString();
    return this.fetchWithAuth(
      `/api/tasks/stats${queryString ? `?${queryString}` : ""}`
    );
  }

  // Bulk operations
  async bulkUpdateStatus(
    taskIds: string[],
    status: TaskStatus
  ): Promise<ApiResponse<ITask[]>> {
    return this.fetchWithAuth("/api/tasks/bulk/status", {
      method: "PATCH",
      body: JSON.stringify({ taskIds, status }),
    });
  }

  async bulkAssign(
    taskIds: string[],
    assignee: string
  ): Promise<ApiResponse<ITask[]>> {
    return this.fetchWithAuth("/api/tasks/bulk/assign", {
      method: "PATCH",
      body: JSON.stringify({ taskIds, assignee }),
    });
  }

  async bulkDelete(taskIds: string[]): Promise<ApiResponse<void>> {
    return this.fetchWithAuth("/api/tasks/bulk/delete", {
      method: "DELETE",
      body: JSON.stringify({ taskIds }),
    });
  }

  // Search operations
  async searchTasks(
    query: string,
    filters?: TaskFilters,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<ITask>> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== "search") {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v.toString()));
          } else if (typeof value === "object" && key === "dueDate") {
            const dueDateFilter = value as { from?: Date; to?: Date };
            if (dueDateFilter.from) {
              params.append("dueDateFrom", dueDateFilter.from.toISOString());
            }
            if (dueDateFilter.to) {
              params.append("dueDateTo", dueDateFilter.to.toISOString());
            }
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    return this.fetchWithAuth(`/api/tasks/search?${params}`);
  }
}

export const taskService = new TaskService();
