"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TaskCard } from "./TaskCard";
import { TaskModal } from "./TaskModal";
import {
  ITask,
  TaskStatus,
  TaskPriority,
  TaskFilters,
  CreateTaskRequest,
  UpdateTaskRequest,
  taskService,
} from "@/services/taskService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  RefreshCw,
  SortAsc,
  SortDesc,
  Calendar,
  User,
  CheckSquare,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskListProps {
  projectId?: string;
  initialFilters?: TaskFilters;
  className?: string;
}

type ViewMode = "grid" | "list";
type SortField =
  | "title"
  | "status"
  | "priority"
  | "dueDate"
  | "createdAt"
  | "updatedAt";
type SortDirection = "asc" | "desc";

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: "backlog", label: "Backlog", color: "bg-gray-100 text-gray-700" },
  {
    value: "in_progress",
    label: "In Progress",
    color: "bg-blue-100 text-blue-700",
  },
  { value: "blocked", label: "Blocked", color: "bg-red-100 text-red-700" },
  { value: "done", label: "Done", color: "bg-green-100 text-green-700" },
  {
    value: "archived",
    label: "Archived",
    color: "bg-purple-100 text-purple-700",
  },
];

const PRIORITY_OPTIONS: {
  value: TaskPriority;
  label: string;
  color: string;
}[] = [
  { value: "low", label: "Low", color: "bg-green-100 text-green-700" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-700" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-700" },
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-700" },
];

export function TaskList({
  projectId,
  initialFilters = {},
  className,
}: TaskListProps) {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<TaskFilters>(initialFilters);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ITask | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simple toast replacement
  const showToast = (
    title: string,
    description: string,
    variant?: "default" | "destructive"
  ) => {
    console.log(
      `${
        variant === "destructive" ? "Error" : "Success"
      }: ${title} - ${description}`
    );
    // TODO: Replace with actual toast implementation
  };

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const loadTasks = useCallback(
    async (resetPage = false) => {
      setLoading(true);
      try {
        const currentPage = resetPage ? 1 : page;
        const searchFilters = searchQuery
          ? { ...filters, search: searchQuery }
          : filters;

        if (projectId) {
          searchFilters.projectId = projectId;
        }

        const response = await taskService.getTasks(
          searchFilters,
          currentPage,
          limit
        );

        if (response.success && response.data) {
          if (resetPage) {
            setTasks(response.data);
            setPage(1);
          } else {
            setTasks((prev) =>
              currentPage === 1 ? response.data! : [...prev, ...response.data!]
            );
          }

          if (response.pagination) {
            setTotal(response.pagination.total);
            setHasMore(currentPage < response.pagination.pages);
          }
        } else {
          throw new Error(response.error || "Failed to load tasks");
        }
      } catch (error) {
        console.error("Failed to load tasks:", error);
        showToast(
          "Error",
          "Failed to load tasks. Please try again.",
          "destructive"
        );
      } finally {
        setLoading(false);
      }
    },
    [filters, searchQuery, projectId, page, limit]
  );

  // Load tasks on mount and when dependencies change
  React.useEffect(() => {
    loadTasks(true);
  }, [filters, searchQuery, projectId]);

  const handleCreateTask = async (data: CreateTaskRequest) => {
    setIsSubmitting(true);
    try {
      const response = await taskService.createTask(data);
      if (response.success && response.data) {
        setTasks((prev) => [response.data!, ...prev]);
        showToast("Success", "Task created successfully!");
      } else {
        throw new Error(response.error || "Failed to create task");
      }
    } catch (error) {
      console.error("Failed to create task:", error);
      showToast(
        "Error",
        "Failed to create task. Please try again.",
        "destructive"
      );
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (data: UpdateTaskRequest) => {
    if (!editingTask) return;

    setIsSubmitting(true);
    try {
      const response = await taskService.updateTask(editingTask._id, data);
      if (response.success && response.data) {
        setTasks((prev) =>
          prev.map((task) =>
            task._id === editingTask._id ? response.data! : task
          )
        );
        showToast("Success", "Task updated successfully!");
      } else {
        throw new Error(response.error || "Failed to update task");
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      showToast(
        "Error",
        "Failed to update task. Please try again.",
        "destructive"
      );
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await taskService.deleteTask(taskId);
      if (response.success) {
        setTasks((prev) => prev.filter((task) => task._id !== taskId));
        showToast("Success", "Task deleted successfully!");
      } else {
        throw new Error(response.error || "Failed to delete task");
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
      showToast(
        "Error",
        "Failed to delete task. Please try again.",
        "destructive"
      );
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      const response = await taskService.updateTaskStatus(taskId, status);
      if (response.success && response.data) {
        setTasks((prev) =>
          prev.map((task) => (task._id === taskId ? response.data! : task))
        );
        showToast("Success", "Task status updated successfully!");
      } else {
        throw new Error(response.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
      showToast(
        "Error",
        "Failed to update task status. Please try again.",
        "destructive"
      );
    }
  };

  const handleFilterChange = (key: keyof TaskFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setSearchQuery("");
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: ITask) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status && filters.status.length > 0) count++;
    if (filters.priority && filters.priority.length > 0) count++;
    if (filters.assignee && filters.assignee.length > 0) count++;
    if (filters.labels && filters.labels.length > 0) count++;
    if (searchQuery) count++;
    return count;
  };

  const sortedTasks = React.useMemo(() => {
    const sorted = [...tasks].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "priority":
          const priorityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case "dueDate":
          const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case "createdAt":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "updatedAt":
          comparison =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [tasks, sortField, sortDirection]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-chalk-text">
            {projectId ? "Project Tasks" : "All Tasks"}
          </h2>
          <p className="text-sm text-chalk-text-2 mt-1">
            {total} task{total !== 1 ? "s" : ""} found
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={openCreateModal}
            className="bg-chalk-primary-600 hover:bg-chalk-primary-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-chalk-text-2" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-chalk-panel border-chalk-border"
          />
        </div>

        {/* Filters */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-chalk-border">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {getActiveFilterCount() > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 px-1 min-w-[1rem] h-5"
                >
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-chalk-panel border-chalk-border">
            {/* Status Filter */}
            <div className="p-2">
              <label className="text-xs font-medium text-chalk-text-2 uppercase tracking-wider">
                Status
              </label>
              {STATUS_OPTIONS.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={filters.status?.includes(option.value) || false}
                  onCheckedChange={(checked) => {
                    const currentStatus = filters.status || [];
                    const newStatus = checked
                      ? [...currentStatus, option.value]
                      : currentStatus.filter((s) => s !== option.value);
                    handleFilterChange(
                      "status",
                      newStatus.length > 0 ? newStatus : undefined
                    );
                  }}
                >
                  <Badge className={cn("mr-2", option.color)} variant="outline">
                    {option.label}
                  </Badge>
                </DropdownMenuCheckboxItem>
              ))}
            </div>

            <DropdownMenuSeparator />

            {/* Priority Filter */}
            <div className="p-2">
              <label className="text-xs font-medium text-chalk-text-2 uppercase tracking-wider">
                Priority
              </label>
              {PRIORITY_OPTIONS.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={filters.priority?.includes(option.value) || false}
                  onCheckedChange={(checked) => {
                    const currentPriority = filters.priority || [];
                    const newPriority = checked
                      ? [...currentPriority, option.value]
                      : currentPriority.filter((p) => p !== option.value);
                    handleFilterChange(
                      "priority",
                      newPriority.length > 0 ? newPriority : undefined
                    );
                  }}
                >
                  <Badge className={cn("mr-2", option.color)} variant="outline">
                    {option.label}
                  </Badge>
                </DropdownMenuCheckboxItem>
              ))}
            </div>

            {getActiveFilterCount() > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={clearFilters}>
                  Clear Filters
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-chalk-border">
              {sortDirection === "asc" ? (
                <SortAsc className="h-4 w-4 mr-2" />
              ) : (
                <SortDesc className="h-4 w-4 mr-2" />
              )}
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-chalk-panel border-chalk-border">
            <DropdownMenuItem onClick={() => setSortField("title")}>
              Title
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortField("status")}>
              Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortField("priority")}>
              Priority
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortField("dueDate")}>
              Due Date
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortField("updatedAt")}>
              Last Updated
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                setSortDirection(sortDirection === "asc" ? "desc" : "asc")
              }
            >
              {sortDirection === "asc" ? "Descending" : "Ascending"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Mode */}
        <div className="flex border border-chalk-border rounded-lg overflow-hidden">
          <Button
            variant={viewMode === "grid" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="rounded-none"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="rounded-none border-l"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* Refresh */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadTasks(true)}
          disabled={loading}
          className="border-chalk-border"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Task Grid/List */}
      {loading && tasks.length === 0 ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-chalk-text-2" />
          <p className="text-chalk-text-2">Loading tasks...</p>
        </div>
      ) : sortedTasks.length === 0 ? (
        <div className="text-center py-12">
          <CheckSquare className="h-12 w-12 mx-auto mb-4 text-chalk-text-2" />
          <h3 className="text-lg font-semibold text-chalk-text mb-2">
            No tasks found
          </h3>
          <p className="text-chalk-text-2 mb-4">
            {getActiveFilterCount() > 0
              ? "Try adjusting your filters or search query."
              : "Create your first task to get started."}
          </p>
          {getActiveFilterCount() === 0 && (
            <Button
              onClick={openCreateModal}
              className="bg-chalk-primary-600 hover:bg-chalk-primary-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          )}
        </div>
      ) : (
        <>
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            )}
          >
            <AnimatePresence mode="popLayout">
              {sortedTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  viewMode={viewMode}
                  onUpdate={openEditModal}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => {
                  setPage((prev) => prev + 1);
                  loadTasks();
                }}
                disabled={loading}
                className="border-chalk-border"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Load More Tasks
              </Button>
            </div>
          )}
        </>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={(data: CreateTaskRequest | UpdateTaskRequest) => {
          return editingTask
            ? handleUpdateTask(data as UpdateTaskRequest)
            : handleCreateTask(data as CreateTaskRequest);
        }}
        task={editingTask}
        projectId={projectId}
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default TaskList;
