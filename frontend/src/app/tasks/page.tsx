"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskBoard } from "@/components/tasks/TaskBoard";
import { TaskModal } from "@/components/tasks/TaskModal";
import {
  ITask,
  TaskStatus,
  TaskFilters,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskStats,
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
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Kanban,
  BarChart3,
  Settings,
  RefreshCw,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TasksPageProps {
  projectId?: string;
  className?: string;
}

type ViewType = "list" | "board" | "stats";

const STATUS_COLORS = {
  backlog: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-100 text-blue-700",
  blocked: "bg-red-100 text-red-700",
  done: "bg-green-100 text-green-700",
  archived: "bg-purple-100 text-purple-700",
};

const PRIORITY_COLORS = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export function TasksPage({ projectId, className }: TasksPageProps) {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<ViewType>("list");
  const [filters, setFilters] = useState<TaskFilters>({
    ...(projectId && { projectId }),
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ITask | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load tasks and stats
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tasksResponse, statsResponse] = await Promise.all([
        taskService.getTasks(filters, 1, 100), // Load more tasks for board view
        taskService.getTaskStats(filters),
      ]);

      if (tasksResponse.success && tasksResponse.data) {
        setTasks(tasksResponse.data);
      }

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== filters.search) {
        setFilters((prev) => ({
          ...prev,
          search: searchQuery || undefined,
        }));
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters.search]);

  const handleCreateTask = async (data: CreateTaskRequest) => {
    setIsSubmitting(true);
    try {
      const response = await taskService.createTask({
        ...data,
        projectId: projectId || data.projectId,
      });

      if (response.success && response.data) {
        setTasks((prev) => [response.data!, ...prev]);
        await loadData(); // Refresh stats
        console.log("Success: Task created successfully!");
      } else {
        throw new Error(response.error || "Failed to create task");
      }
    } catch (error) {
      console.error("Failed to create task:", error);
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
        await loadData(); // Refresh stats
        console.log("Success: Task updated successfully!");
      } else {
        throw new Error(response.error || "Failed to update task");
      }
    } catch (error) {
      console.error("Failed to update task:", error);
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
        await loadData(); // Refresh stats
        console.log("Success: Task deleted successfully!");
      } else {
        throw new Error(response.error || "Failed to delete task");
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      const response = await taskService.updateTaskStatus(taskId, status);
      if (response.success && response.data) {
        setTasks((prev) =>
          prev.map((task) => (task._id === taskId ? response.data! : task))
        );
        await loadData(); // Refresh stats
        console.log("Success: Task status updated successfully!");
      } else {
        throw new Error(response.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
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

  const renderStatsView = () => {
    if (!stats) {
      return (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-chalk-text-2" />
          <p className="text-chalk-text-2">Loading statistics...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-chalk-panel border-chalk-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-chalk-text-2">
                Total Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chalk-text">
                {stats.total}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-chalk-panel border-chalk-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-chalk-text-2">
                Overdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.overdue}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-chalk-panel border-chalk-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-chalk-text-2">
                Due Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.dueSoon}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-chalk-panel border-chalk-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-chalk-text-2">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.byStatus.done || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Distribution */}
        <Card className="bg-chalk-panel border-chalk-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-chalk-text">
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(stats.byStatus).map(([status, count]) => (
                <div key={status} className="text-center">
                  <Badge
                    className={cn(
                      "mb-2 w-full justify-center",
                      STATUS_COLORS[status as keyof typeof STATUS_COLORS]
                    )}
                    variant="outline"
                  >
                    {status.replace("_", " ").charAt(0).toUpperCase() +
                      status.slice(1)}
                  </Badge>
                  <div className="text-2xl font-bold text-chalk-text">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card className="bg-chalk-panel border-chalk-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-chalk-text">
              Priority Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(stats.byPriority).map(([priority, count]) => (
                <div key={priority} className="text-center">
                  <Badge
                    className={cn(
                      "mb-2 w-full justify-center",
                      PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS]
                    )}
                    variant="outline"
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Badge>
                  <div className="text-2xl font-bold text-chalk-text">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <motion.div
      className={cn("space-y-6", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-chalk-text">
            {projectId ? "Project Tasks" : "Tasks"}
          </h1>
          <p className="text-chalk-text-2 mt-1">
            Manage and track your tasks efficiently
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

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="flex-1 relative max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-chalk-text-2" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-chalk-panel border-chalk-border"
          />
        </div>

        {/* View Switcher */}
        <Tabs
          value={viewType}
          onValueChange={(value) => setViewType(value as ViewType)}
        >
          <TabsList className="bg-chalk-subtle">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="board" className="flex items-center gap-2">
              <Kanban className="h-4 w-4" />
              Board
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Stats
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Refresh */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadData()}
          disabled={loading}
          className="border-chalk-border"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Content */}
      <div className="min-h-[600px]">
        {viewType === "list" && (
          <TaskList
            projectId={projectId}
            initialFilters={filters}
            className="min-h-full"
          />
        )}

        {viewType === "board" && (
          <TaskBoard
            tasks={tasks}
            onTaskUpdate={openEditModal}
            onTaskCreate={handleCreateTask}
            onTaskDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
            projectId={projectId}
            className="min-h-full"
          />
        )}

        {viewType === "stats" && renderStatsView()}
      </div>

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
    </motion.div>
  );
}

export default TasksPage;
