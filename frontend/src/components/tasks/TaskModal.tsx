"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ITask,
  TaskPriority,
  TaskStatus,
  CreateTaskRequest,
  UpdateTaskRequest,
} from "@/services/taskService";
import {
  Calendar as CalendarIcon,
  X,
  Plus,
  AlertCircle,
  User,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskRequest | UpdateTaskRequest) => Promise<void>;
  task?: ITask | null;
  projectId?: string;
  isLoading?: boolean;
}

const PRIORITY_OPTIONS: {
  value: TaskPriority;
  label: string;
  color: string;
}[] = [
  { value: "low", label: "Low", color: "text-green-700" },
  { value: "medium", label: "Medium", color: "text-yellow-700" },
  { value: "high", label: "High", color: "text-orange-700" },
  { value: "critical", label: "Critical", color: "text-red-700" },
];

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: "backlog", label: "Backlog", color: "text-gray-700" },
  { value: "in_progress", label: "In Progress", color: "text-blue-700" },
  { value: "blocked", label: "Blocked", color: "text-red-700" },
  { value: "done", label: "Done", color: "text-green-700" },
  { value: "archived", label: "Archived", color: "text-purple-700" },
];

export function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  task,
  projectId,
  isLoading = false,
}: TaskModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as TaskPriority,
    status: "backlog" as TaskStatus,
    assignee: "",
    dueDate: null as Date | null,
    labels: [] as string[],
  });
  const [newLabel, setNewLabel] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!task;

  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
        assignee: task.assignee || "",
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        labels: [...task.labels],
      });
    } else {
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        status: "backlog",
        assignee: "",
        dueDate: null,
        labels: [],
      });
    }
    setErrors({});
    setNewLabel("");
  }, [task, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
    } else if (formData.title.length > 200) {
      newErrors.title = "Title cannot exceed 200 characters";
    }

    if (formData.description && formData.description.length > 2000) {
      newErrors.description = "Description cannot exceed 2000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        ...(isEditMode && { status: formData.status }),
        assignee: formData.assignee || undefined,
        dueDate: formData.dueDate || undefined,
        labels: formData.labels.filter((label) => label.trim()),
        ...(!isEditMode && projectId && { projectId }),
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error("Failed to save task:", error);
    }
  };

  const handleAddLabel = () => {
    const label = newLabel.trim();
    if (label && !formData.labels.includes(label) && label.length <= 50) {
      setFormData((prev) => ({
        ...prev,
        labels: [...prev.labels, label],
      }));
      setNewLabel("");
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      labels: prev.labels.filter((label) => label !== labelToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.target === document.activeElement) {
      e.preventDefault();
      if (newLabel.trim()) {
        handleAddLabel();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-chalk-panel border-chalk-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-chalk-text">
            {isEditMode ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-chalk-text font-medium">
              Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter task title"
              className={cn(
                "bg-chalk-panel border-chalk-border focus:border-chalk-primary-600",
                errors.title && "border-red-500"
              )}
              maxLength={200}
            />
            {errors.title && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.title}
              </p>
            )}
            <div className="text-xs text-chalk-text-3">
              {formData.title.length}/200 characters
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-chalk-text font-medium"
            >
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe the task in detail..."
              className={cn(
                "bg-chalk-panel border-chalk-border focus:border-chalk-primary-600 min-h-[100px]",
                errors.description && "border-red-500"
              )}
              maxLength={2000}
            />
            {errors.description && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.description}
              </p>
            )}
            <div className="text-xs text-chalk-text-3">
              {formData.description.length}/2000 characters
            </div>
          </div>

          {/* Priority & Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-2">
              <Label className="text-chalk-text font-medium">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: TaskPriority) =>
                  setFormData((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger className="bg-chalk-panel border-chalk-border">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-chalk-panel border-chalk-border">
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className={cn("font-medium", option.color)}>
                        {option.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status (only for edit mode) */}
            {isEditMode && (
              <div className="space-y-2">
                <Label className="text-chalk-text font-medium">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: TaskStatus) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="bg-chalk-panel border-chalk-border">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-chalk-panel border-chalk-border">
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className={cn("font-medium", option.color)}>
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-chalk-text font-medium">
              Due Date
            </Label>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-chalk-text-2" />
              <Input
                id="dueDate"
                type="datetime-local"
                value={
                  formData.dueDate
                    ? format(formData.dueDate, "yyyy-MM-dd'T'HH:mm")
                    : ""
                }
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  setFormData((prev) => ({ ...prev, dueDate: date }));
                }}
                className="bg-chalk-panel border-chalk-border focus:border-chalk-primary-600"
              />
              {formData.dueDate && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, dueDate: null }))
                  }
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Assignee (placeholder for future user selection) */}
          <div className="space-y-2">
            <Label htmlFor="assignee" className="text-chalk-text font-medium">
              Assignee
            </Label>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-chalk-text-2" />
              <Input
                id="assignee"
                value={formData.assignee}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, assignee: e.target.value }))
                }
                placeholder="User ID (temporary - will be user selector)"
                className="bg-chalk-panel border-chalk-border focus:border-chalk-primary-600"
              />
            </div>
          </div>

          {/* Labels */}
          <div className="space-y-2">
            <Label className="text-chalk-text font-medium">Labels</Label>

            {/* Existing Labels */}
            {formData.labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.labels.map((label, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-chalk-subtle text-chalk-text-2 border-chalk-border"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {label}
                    <button
                      type="button"
                      onClick={() => handleRemoveLabel(label)}
                      className="ml-2 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Add New Label */}
            <div className="flex gap-2">
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add label..."
                className="bg-chalk-panel border-chalk-border focus:border-chalk-primary-600"
                maxLength={50}
              />
              <Button
                type="button"
                onClick={handleAddLabel}
                variant="outline"
                size="sm"
                disabled={
                  !newLabel.trim() || formData.labels.includes(newLabel.trim())
                }
                className="shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-chalk-text-3">
              {newLabel.length}/50 characters
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-chalk-border text-chalk-text hover:bg-chalk-subtle"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.title.trim()}
              className="bg-chalk-primary-600 hover:bg-chalk-primary-700 text-white"
            >
              {isLoading
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Task"
                : "Create Task"}
            </Button>
          </DialogFooter>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}

export default TaskModal;
