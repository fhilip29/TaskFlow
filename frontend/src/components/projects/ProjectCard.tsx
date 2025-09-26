import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { IProject, IProjectListItem } from "@/types/project";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Calendar,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  Clock,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { AdminAvatars } from "./AdminAvatars";

const MotionCard = motion(Card);

interface ProjectCardProps {
  project: IProject | IProjectListItem;
  onUpdate?: (project: IProject | IProjectListItem) => void;
  onDelete?: (projectId: string) => void;
  viewMode?: "grid" | "list";
  className?: string;
}

export function ProjectCard({
  project,
  onUpdate,
  onDelete,
  viewMode = "grid",
  className,
}: ProjectCardProps) {
  // Type guard to check if project is IProject
  const isFullProject = (p: IProject | IProjectListItem): p is IProject => {
    return "members" in p;
  };

  // Helper functions to get data consistently
  const getMemberCount = () => {
    if (isFullProject(project)) {
      return project.members?.length || 0;
    }
    return (project as IProjectListItem).memberCount || 0;
  };

  const getActiveMembers = () => {
    if (isFullProject(project)) {
      return project.members?.filter((m) => m.status === "active").length || 0;
    }
    return (project as IProjectListItem).activeMembers || 0;
  };

  const getPendingInvites = () => {
    if (isFullProject(project)) {
      return project.members?.filter((m) => m.status === "invited").length || 0;
    }
    return (project as IProjectListItem).pendingInvites || 0;
  };

  const getAdmins = () => {
    if (isFullProject(project)) {
      return (
        project.members
          ?.filter((m) => m.role === "admin" && m.status === "active")
          .map((m) => ({
            _id: m.userId,
            fullName: m.fullName || m.user?.fullName || "Unknown",
            email: m.email,
            profileImage: m.profileImage || m.user?.profileImage,
          })) || []
      );
    }
    return (project as IProjectListItem).admins || [];
  };

  const getProgress = () => {
    if (isFullProject(project)) {
      return project.metadata?.progress || 0;
    }
    return (project as IProjectListItem).progress || 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_progress":
        return "bg-green-100 text-green-800 border-green-200";
      case "on_hold":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "archived":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "deleted":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      onDelete?.(project._id);
    }
  };

  if (viewMode === "list") {
    return (
      <MotionCard
        className={cn(
          "overflow-hidden hover:shadow-md transition-all duration-300 group cursor-pointer bg-chalk-panel border-chalk-border",
          className
        )}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: 4 }}
        transition={{ duration: 0.3 }}
      >
        <Link href={`/projects/${project._id}`} className="block">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-chalk-text group-hover:text-chalk-primary-600 transition-colors mb-1">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-chalk-text-2 line-clamp-1">
                      {project.description}
                    </p>
                  )}
                  {/* Show creator info */}
                  {"createdBy" in project && project.createdBy && (
                    <p className="text-xs text-chalk-text-3 mt-1">
                      Created by {project.createdBy.fullName}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <Badge
                    className={getStatusColor(project.status)}
                    variant="outline"
                  >
                    {project.status.replace("_", " ").charAt(0).toUpperCase() +
                      project.status.replace("_", " ").slice(1)}
                  </Badge>

                  {/* Admin Avatars */}
                  <AdminAvatars admins={getAdmins()} size="sm" maxDisplay={2} />

                  {/* Member Statistics */}
                  <div className="flex items-center gap-4 text-chalk-text-2">
                    <div className="flex items-center gap-1">
                      <UserCheck className="h-4 w-4" />
                      <span className="text-sm">{getActiveMembers()}</span>
                    </div>

                    {getPendingInvites() > 0 && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-orange-600">
                          {getPendingInvites()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="w-24">
                    <Progress value={getProgress()} className="h-2" />
                    <span className="text-xs text-chalk-text-2 mt-1 block text-center">
                      {getProgress()}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-chalk-text-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  onClick={(e: React.MouseEvent) => e.preventDefault()}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-chalk-text-2 hover:text-chalk-text hover:bg-chalk-subtle"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-chalk-panel border-chalk-border"
                >
                  <DropdownMenuItem
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      window.open(`/projects/${project._id}`, "_blank");
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      onUpdate?.(project);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Project
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-chalk-border" />
                  <DropdownMenuItem
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      handleDelete();
                    }}
                    className="text-red-500 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Link>
      </MotionCard>
    );
  }

  // Grid view (default)
  return (
    <MotionCard
      className={cn(
        "overflow-hidden hover:shadow-md transition-all duration-300 group cursor-pointer bg-chalk-panel border-chalk-border",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/projects/${project._id}`} className="block">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-chalk-text group-hover:text-chalk-primary-600 transition-colors line-clamp-1">
                {project.name}
              </CardTitle>
              {project.description && (
                <p className="text-sm text-chalk-text-2 mt-1 line-clamp-2">
                  {project.description}
                </p>
              )}
              {/* Show creator info */}
              {"createdBy" in project && project.createdBy && (
                <p className="text-xs text-chalk-text-3 mt-2">
                  Created by {project.createdBy.fullName}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                onClick={(e: React.MouseEvent) => e.preventDefault()}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-chalk-text-2 hover:text-chalk-text hover:bg-chalk-subtle"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-chalk-panel border-chalk-border"
              >
                <DropdownMenuItem
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    window.open(`/projects/${project._id}`, "_blank");
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    onUpdate?.(project);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Project
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-chalk-border" />
                <DropdownMenuItem
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    handleDelete();
                  }}
                  className="text-red-500 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Admin Avatars Section */}
          <div className="mb-4">
            <AdminAvatars admins={getAdmins()} size="md" maxDisplay={3} />
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className={getStatusColor(project.status)} variant="outline">
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Badge>
          </div>

          {/* Progress Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-chalk-text">
                Progress
              </span>
              <span className="text-sm text-chalk-text-2">
                {getProgress()}%
              </span>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>

          {/* Enhanced Stats Section */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1 text-chalk-text-2">
                <UserCheck className="w-3 h-3 text-green-500" />
                <span className="text-xs">Active</span>
              </div>
              <span className="text-sm font-semibold text-chalk-text">
                {getActiveMembers()}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1 text-chalk-text-2">
                {getPendingInvites() > 0 ? (
                  <Clock className="w-3 h-3 text-orange-500" />
                ) : (
                  <Calendar className="w-3 h-3" />
                )}
                <span className="text-xs">
                  {getPendingInvites() > 0 ? "Pending" : "Updated"}
                </span>
              </div>
              <span
                className={cn(
                  "text-sm font-semibold",
                  getPendingInvites() > 0
                    ? "text-orange-600"
                    : "text-chalk-text"
                )}
              >
                {getPendingInvites() > 0
                  ? getPendingInvites()
                  : new Date(project.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
              </span>
            </div>
          </div>
        </CardContent>
      </Link>
    </MotionCard>
  );
}

export default ProjectCard;
