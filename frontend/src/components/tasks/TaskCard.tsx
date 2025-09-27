"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ITask, TaskPriority, TaskStatus } from "@/services/taskService";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Clock,
  User,
  Calendar,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Tag,
  AlertCircle,
  CheckCircle2,
  Circle,
  Pause,
  Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isAfter, isBefore, addDays } from "date-fns";

const MotionCard = motion(Card);

interface TaskCardProps {
  task: ITask;
  onUpdate?: (task: ITask) => void;
  onDelete?: (taskId: string) => Promise<void>;
  onStatusChange?: (taskId: string, status: TaskStatus) => Promise<void>;
  viewMode?: "grid" | "list";
  className?: string;
  showProject?: boolean;
}

export function TaskCard({
  task,
  onUpdate,
  onDelete,
  onStatusChange,
  viewMode = "grid",
  className,
  showProject = false,
}: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "backlog":
        return <Circle className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "blocked":
        return <Pause className="h-4 w-4" />;
      case "done":
        return <CheckCircle2 className="h-4 w-4" />;
      case "archived":
        return <Archive className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "backlog":
        return "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200";
      case "in_progress":
        return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200";
      case "blocked":
        return "bg-red-100 text-red-700 border-red-200 hover:bg-red-200";
      case "done":
        return "bg-green-100 text-green-700 border-green-200 hover:bg-green-200";
      case "archived":
        return "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200";
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "low":
        return "bg-green-50 text-green-700 border-green-200";
      case "medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "high":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "critical":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case "critical":
      case "high":
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const isOverdue = task.dueDate
    ? isAfter(new Date(), new Date(task.dueDate))
    : false;
  const isDueSoon = task.dueDate
    ? isAfter(new Date(task.dueDate), new Date()) &&
      isBefore(new Date(task.dueDate), addDays(new Date(), 3))
    : false;

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await onStatusChange?.(task._id, newStatus);
    } catch (error) {
      console.error("Failed to update task status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await onDelete?.(task._id);
    }
  };

  const formatDueDate = (date: Date) => {
    return format(new Date(date), "MMM d, yyyy");
  };

  if (viewMode === "list") {
    return (
      <MotionCard
        className={cn(
          "overflow-hidden hover:shadow-md transition-all duration-300 group cursor-pointer bg-chalk-panel border-chalk-border",
          isOverdue && "border-l-4 border-l-red-500",
          isDueSoon && !isOverdue && "border-l-4 border-l-orange-400",
          className
        )}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: 4 }}
        transition={{ duration: 0.3 }}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex items-center gap-4">
              {/* Status Icon */}
              <div
                className={cn("p-2 rounded-full", getStatusColor(task.status))}
              >
                {getStatusIcon(task.status)}
              </div>

              {/* Task Info */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-chalk-text group-hover:text-chalk-primary-600 transition-colors mb-1">
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-chalk-text-2 line-clamp-1 mb-2">
                    {task.description}
                  </p>
                )}

                {/* Labels */}
                {task.labels.length > 0 && (
                  <div className="flex gap-1 mb-2">
                    {task.labels.slice(0, 3).map((label, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs bg-chalk-subtle text-chalk-text-2 border-chalk-border"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {label}
                      </Badge>
                    ))}
                    {task.labels.length > 3 && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-chalk-subtle text-chalk-text-2 border-chalk-border"
                      >
                        +{task.labels.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Status & Priority Badges */}
              <div className="flex items-center gap-2">
                <Badge
                  className={getStatusColor(task.status)}
                  variant="outline"
                >
                  {getStatusIcon(task.status)}
                  <span className="ml-1 capitalize">
                    {task.status.replace("_", " ")}
                  </span>
                </Badge>

                <Badge
                  className={cn(
                    getPriorityColor(task.priority),
                    "flex items-center gap-1"
                  )}
                  variant="outline"
                >
                  {getPriorityIcon(task.priority)}
                  <span className="capitalize">{task.priority}</span>
                </Badge>
              </div>

              {/* Due Date */}
              {task.dueDate && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-sm",
                    isOverdue
                      ? "text-red-600"
                      : isDueSoon
                      ? "text-orange-600"
                      : "text-chalk-text-2"
                  )}
                >
                  <Calendar className="h-4 w-4" />
                  <span>{formatDueDate(task.dueDate)}</span>
                </div>
              )}

              {/* Assignee */}
              {task.assignee && (
                <div className="flex items-center gap-1 text-sm text-chalk-text-2">
                  <User className="h-4 w-4" />
                  <span>Assigned</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-chalk-text-2 hover:text-chalk-text hover:bg-chalk-subtle"
                  disabled={isUpdating}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-chalk-panel border-chalk-border"
              >
                <DropdownMenuItem onClick={() => onUpdate?.(task)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdate?.(task)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-chalk-border" />

                {/* Quick Status Changes */}
                {task.status !== "in_progress" && (
                  <DropdownMenuItem
                    onClick={() => handleStatusChange("in_progress")}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Start Progress
                  </DropdownMenuItem>
                )}
                {task.status !== "done" && (
                  <DropdownMenuItem onClick={() => handleStatusChange("done")}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark Done
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="bg-chalk-border" />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-500 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </MotionCard>
    );
  }

  // Grid view (default)
  return (
    <MotionCard
      className={cn(
        "overflow-hidden hover:shadow-md transition-all duration-300 group cursor-pointer bg-chalk-panel border-chalk-border",
        isOverdue && "border-l-4 border-l-red-500",
        isDueSoon && !isOverdue && "border-l-4 border-l-orange-400",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={cn("p-1 rounded-full", getStatusColor(task.status))}
              >
                {getStatusIcon(task.status)}
              </div>
              <CardTitle className="text-lg font-semibold text-chalk-text group-hover:text-chalk-primary-600 transition-colors line-clamp-1">
                {task.title}
              </CardTitle>
            </div>
            {task.description && (
              <p className="text-sm text-chalk-text-2 line-clamp-2 mb-3">
                {task.description}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-chalk-text-2 hover:text-chalk-text hover:bg-chalk-subtle"
                disabled={isUpdating}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-chalk-panel border-chalk-border"
            >
              <DropdownMenuItem onClick={() => onUpdate?.(task)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdate?.(task)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-chalk-border" />

              {/* Quick Status Changes */}
              {task.status !== "in_progress" && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange("in_progress")}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Start Progress
                </DropdownMenuItem>
              )}
              {task.status !== "done" && (
                <DropdownMenuItem onClick={() => handleStatusChange("done")}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark Done
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator className="bg-chalk-border" />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-500 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Status & Priority Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className={getStatusColor(task.status)} variant="outline">
            {getStatusIcon(task.status)}
            <span className="ml-1 capitalize">
              {task.status.replace("_", " ")}
            </span>
          </Badge>
          <Badge
            className={cn(
              getPriorityColor(task.priority),
              "flex items-center gap-1"
            )}
            variant="outline"
          >
            {getPriorityIcon(task.priority)}
            <span className="capitalize">{task.priority}</span>
          </Badge>
        </div>

        {/* Labels */}
        {task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {task.labels.slice(0, 4).map((label, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs bg-chalk-subtle text-chalk-text-2 border-chalk-border"
              >
                <Tag className="h-3 w-3 mr-1" />
                {label}
              </Badge>
            ))}
            {task.labels.length > 4 && (
              <Badge
                variant="outline"
                className="text-xs bg-chalk-subtle text-chalk-text-2 border-chalk-border"
              >
                +{task.labels.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Footer Info */}
        <div className="flex items-center justify-between text-sm text-chalk-text-2">
          {task.dueDate && (
            <div
              className={cn(
                "flex items-center gap-1",
                isOverdue
                  ? "text-red-600 font-medium"
                  : isDueSoon
                  ? "text-orange-600 font-medium"
                  : "text-chalk-text-2"
              )}
            >
              <Calendar className="h-4 w-4" />
              <span>{formatDueDate(task.dueDate)}</span>
            </div>
          )}

          {task.assignee && (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>Assigned</span>
            </div>
          )}

          {!task.dueDate && !task.assignee && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{format(new Date(task.updatedAt), "MMM d")}</span>
            </div>
          )}
        </div>
      </CardContent>
    </MotionCard>
  );
}

export default TaskCard;
