"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TaskCard } from "./TaskCard";
import {
  ITask,
  TaskStatus,
  CreateTaskRequest,
  UpdateTaskRequest,
  taskService,
} from "@/services/taskService";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Circle,
  Clock,
  Pause,
  CheckCircle2,
  Archive,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskBoardProps {
  tasks: ITask[];
  onTaskUpdate?: (task: ITask) => void;
  onTaskCreate?: (data: CreateTaskRequest) => Promise<void>;
  onTaskDelete?: (taskId: string) => Promise<void>;
  onStatusChange?: (taskId: string, status: TaskStatus) => Promise<void>;
  projectId?: string;
  className?: string;
}

const COLUMNS: {
  status: TaskStatus;
  label: string;
  color: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    status: "backlog",
    label: "Backlog",
    color: "bg-gray-50 border-gray-200",
    icon: <Circle className="h-4 w-4" />,
    description: "Tasks waiting to be started",
  },
  {
    status: "in_progress",
    label: "In Progress",
    color: "bg-blue-50 border-blue-200",
    icon: <Clock className="h-4 w-4" />,
    description: "Tasks currently being worked on",
  },
  {
    status: "blocked",
    label: "Blocked",
    color: "bg-red-50 border-red-200",
    icon: <Pause className="h-4 w-4" />,
    description: "Tasks that are blocked or on hold",
  },
  {
    status: "done",
    label: "Done",
    color: "bg-green-50 border-green-200",
    icon: <CheckCircle2 className="h-4 w-4" />,
    description: "Completed tasks",
  },
  {
    status: "archived",
    label: "Archived",
    color: "bg-purple-50 border-purple-200",
    icon: <Archive className="h-4 w-4" />,
    description: "Archived tasks",
  },
];

export function TaskBoard({
  tasks,
  onTaskUpdate,
  onTaskCreate,
  onTaskDelete,
  onStatusChange,
  projectId,
  className,
}: TaskBoardProps) {
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  // Group tasks by status
  const tasksByStatus = React.useMemo(() => {
    const grouped = COLUMNS.reduce((acc, column) => {
      acc[column.status] = tasks.filter(
        (task) => task.status === column.status
      );
      return acc;
    }, {} as Record<TaskStatus, ITask[]>);

    return grouped;
  }, [tasks]);

  const handleDragStart = useCallback((taskId: string) => {
    setDraggedTask(taskId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTask(null);
    setDragOverColumn(null);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, status: TaskStatus) => {
      e.preventDefault();
      setDragOverColumn(status);
    },
    []
  );

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, newStatus: TaskStatus) => {
      e.preventDefault();

      if (!draggedTask || !onStatusChange) return;

      const task = tasks.find((t) => t._id === draggedTask);
      if (!task || task.status === newStatus) return;

      try {
        await onStatusChange(draggedTask, newStatus);
      } catch (error) {
        console.error("Failed to update task status:", error);
      } finally {
        setDraggedTask(null);
        setDragOverColumn(null);
      }
    },
    [draggedTask, tasks, onStatusChange]
  );

  const getColumnStats = (status: TaskStatus) => {
    const columnTasks = tasksByStatus[status] || [];
    const total = columnTasks.length;
    const priorities = columnTasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, priorities };
  };

  return (
    <div className={cn("h-full overflow-x-auto", className)}>
      <div className="flex gap-6 min-w-max h-full p-1">
        {COLUMNS.map((column) => {
          const stats = getColumnStats(column.status);
          const isDropZone = dragOverColumn === column.status;

          return (
            <div
              key={column.status}
              className="flex flex-col min-w-[320px] max-w-[320px]"
              onDragOver={(e) => handleDragOver(e, column.status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              {/* Column Header */}
              <Card
                className={cn(
                  "mb-4 transition-all duration-200",
                  column.color,
                  isDropZone && "ring-2 ring-chalk-primary-500 ring-offset-2"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-full bg-white/50">
                        {column.icon}
                      </div>
                      <CardTitle className="text-lg font-semibold text-chalk-text">
                        {column.label}
                      </CardTitle>
                      <Badge variant="outline" className="bg-white/50">
                        {stats.total}
                      </Badge>
                    </div>

                    {/* Add Task Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        // TODO: Implement quick add for specific column
                        onTaskCreate?.({
                          projectId: projectId || "",
                          title: "",
                          priority: "medium",
                        });
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-sm text-chalk-text-2">
                    {column.description}
                  </p>

                  {/* Priority Distribution */}
                  {stats.total > 0 && (
                    <div className="flex gap-1 mt-2">
                      {Object.entries(stats.priorities).map(
                        ([priority, count]) => {
                          const priorityColors = {
                            low: "bg-green-200 text-green-800",
                            medium: "bg-yellow-200 text-yellow-800",
                            high: "bg-orange-200 text-orange-800",
                            critical: "bg-red-200 text-red-800",
                          };

                          return (
                            <Badge
                              key={priority}
                              variant="outline"
                              className={cn(
                                "text-xs",
                                priorityColors[
                                  priority as keyof typeof priorityColors
                                ]
                              )}
                            >
                              {priority}: {count}
                            </Badge>
                          );
                        }
                      )}
                    </div>
                  )}
                </CardHeader>
              </Card>

              {/* Tasks Column */}
              <div className="flex-1 space-y-3 min-h-[400px]">
                <AnimatePresence mode="popLayout">
                  {(tasksByStatus[column.status] || []).map((task) => (
                    <motion.div
                      key={task._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                      draggable
                      onDragStart={() => handleDragStart(task._id)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "cursor-grab active:cursor-grabbing",
                        draggedTask === task._id && "opacity-50 scale-95"
                      )}
                    >
                      <TaskCard
                        task={task}
                        viewMode="grid"
                        onUpdate={onTaskUpdate}
                        onDelete={onTaskDelete}
                        onStatusChange={onStatusChange}
                        className="shadow-sm hover:shadow-md transition-shadow"
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Drop Zone Indicator */}
                {isDropZone && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border-2 border-dashed border-chalk-primary-300 bg-chalk-primary-50 rounded-lg p-8 text-center"
                  >
                    <div className="text-chalk-primary-600">
                      <div className="text-sm font-medium mb-1">
                        Drop task here
                      </div>
                      <div className="text-xs text-chalk-primary-500">
                        Move to {column.label}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Empty State */}
                {tasksByStatus[column.status]?.length === 0 && !isDropZone && (
                  <div className="text-center py-8 text-chalk-text-2">
                    <div className="text-4xl mb-2 opacity-50">
                      {column.icon}
                    </div>
                    <p className="text-sm">
                      No tasks in {column.label.toLowerCase()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TaskBoard;
