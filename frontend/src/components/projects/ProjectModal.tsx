"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, FolderPlus, Settings, ChevronDown } from "lucide-react";
import { IProject } from "@/types/project";
import { projectService } from "@/services/projectService";
import { toast } from "sonner";

interface ProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: IProject;
  onProjectCreated?: (project: IProject) => void;
  onProjectUpdated?: (project: IProject) => void;
}

interface FormData {
  name: string;
  description: string;
  isPublic: boolean;
  allowMemberInvite: boolean;
  maxMembers: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  maxMembers?: string;
}

export function ProjectModal({
  open,
  onOpenChange,
  project,
  onProjectCreated,
  onProjectUpdated,
}: ProjectModalProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    isPublic: false,
    allowMemberInvite: true,
    maxMembers: "50",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const isEditing = !!project;

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || "",
        isPublic: project.settings.isPublic,
        allowMemberInvite: project.settings.allowMemberInvite,
        maxMembers: String(project.settings.maxMembers || 50),
      });
    } else if (open) {
      setFormData({
        name: "",
        description: "",
        isPublic: false,
        allowMemberInvite: true,
        maxMembers: "50",
      });
    }
    setErrors({});
  }, [project, open]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Project name must be at least 3 characters";
    } else if (formData.name.length > 100) {
      newErrors.name = "Project name cannot exceed 100 characters";
    }

    if (formData.description.length > 500) {
      newErrors.description = "Description cannot exceed 500 characters";
    }

    const maxMembers = parseInt(formData.maxMembers);
    if (isNaN(maxMembers) || maxMembers < 1) {
      newErrors.maxMembers = "Must allow at least 1 member";
    } else if (maxMembers > 1000) {
      newErrors.maxMembers = "Cannot exceed 1000 members";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const requestData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        isPublic: formData.isPublic,
        allowMemberInvite: formData.allowMemberInvite,
        maxMembers: parseInt(formData.maxMembers),
      };

      if (isEditing && project) {
        const response = await projectService.updateProject(project._id, {
          name: requestData.name,
          description: requestData.description,
          settings: {
            isPublic: requestData.isPublic,
            allowMemberInvite: requestData.allowMemberInvite,
            maxMembers: requestData.maxMembers,
          },
        });
        onProjectUpdated?.(response.data);
        toast.success("Project updated successfully!");
      } else {
        const response = await projectService.createProject(requestData);
        onProjectCreated?.(response.data);
        toast.success("Project created successfully!");
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save project"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] bg-white border-chalk-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-chalk-text">
            <FolderPlus className="h-5 w-5 text-chalk-primary-500" />
            {isEditing ? "Edit Project" : "Create New Project"}
          </DialogTitle>
          <DialogDescription className="text-chalk-text-2">
            {isEditing
              ? "Update your project details and settings."
              : "Create a new project to organize your work and collaborate with others."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-chalk-text font-medium">
                Project Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter project name..."
                className={`mt-1 bg-chalk-bg border-chalk-border focus:border-chalk-primary-400 ${
                  errors.name ? "border-red-500" : ""
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
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
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe what this project is about..."
                rows={3}
                className={`mt-1 bg-chalk-bg border-chalk-border focus:border-chalk-primary-400 resize-none ${
                  errors.description ? "border-red-500" : ""
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
              <p className="text-chalk-text-2 text-xs mt-1">
                {formData.description.length}/500 characters
              </p>
            </div>
          </div>

          {/* Advanced Settings Toggle */}
          <div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full justify-between p-0 h-auto font-medium text-chalk-text hover:bg-transparent"
            >
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Advanced Settings
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  showAdvanced ? "rotate-180" : ""
                }`}
              />
            </Button>

            {showAdvanced && (
              <div className="mt-4 space-y-4 p-4 rounded-lg bg-chalk-subtle/30 border border-chalk-border">
                {/* Public Project Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label className="text-chalk-text font-medium">
                      Public Project
                    </Label>
                    <p className="text-chalk-text-2 text-sm">
                      Anyone can discover and view this project
                    </p>
                  </div>
                  <Switch
                    checked={formData.isPublic}
                    onCheckedChange={(checked) =>
                      handleInputChange("isPublic", checked)
                    }
                  />
                </div>

                {/* Member Invite Permission */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label className="text-chalk-text font-medium">
                      Allow Member Invitations
                    </Label>
                    <p className="text-chalk-text-2 text-sm">
                      Members can invite others to join the project
                    </p>
                  </div>
                  <Switch
                    checked={formData.allowMemberInvite}
                    onCheckedChange={(checked) =>
                      handleInputChange("allowMemberInvite", checked)
                    }
                  />
                </div>

                {/* Maximum Members */}
                <div>
                  <Label
                    htmlFor="maxMembers"
                    className="text-chalk-text font-medium"
                  >
                    Maximum Members
                  </Label>
                  <Input
                    id="maxMembers"
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.maxMembers}
                    onChange={(e) =>
                      handleInputChange("maxMembers", e.target.value)
                    }
                    className={`mt-1 bg-chalk-bg border-chalk-border focus:border-chalk-primary-400 ${
                      errors.maxMembers ? "border-red-500" : ""
                    }`}
                  />
                  {errors.maxMembers && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.maxMembers}
                    </p>
                  )}
                  <p className="text-chalk-text-2 text-xs mt-1">
                    Set to 0 for unlimited members
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{isEditing ? "Update Project" : "Create Project"}</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
