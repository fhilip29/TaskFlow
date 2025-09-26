"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  Calendar,
  MoreHorizontal,
  UserPlus,
} from "lucide-react";
import { motion } from "framer-motion";
import { IProject, IProjectMember } from "@/types/project";
import { projectService } from "@/services/projectService";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { InviteMemberModal } from "@/components/projects/InviteMemberModal";
import { MemberAvatar } from "@/components/projects/MemberAvatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ProjectDetailPageState {
  project: IProject | null;
  members: IProjectMember[];
  loading: boolean;
  showEditModal: boolean;
  showInviteModal: boolean;
}

const ProjectDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [state, setState] = useState<ProjectDetailPageState>({
    project: null,
    members: [],
    loading: true,
    showEditModal: false,
    showInviteModal: false,
  });

  const loadProject = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      const [projectResponse, membersResponse] = await Promise.all([
        projectService.getProject(projectId),
        projectService.getProjectMembers(projectId),
      ]);

      setState((prev) => ({
        ...prev,
        project: projectResponse.data,
        members: membersResponse.data,
        loading: false,
      }));
    } catch (error) {
      console.error("Error loading project:", error);
      toast.error("Failed to load project details");
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const handleProjectUpdated = (updatedProject: IProject) => {
    setState((prev) => ({
      ...prev,
      project: updatedProject,
      showEditModal: false,
    }));
    toast.success("Project updated successfully!");
  };

  const handleDeleteProject = async () => {
    try {
      await projectService.deleteProject(projectId);
      toast.success("Project deleted successfully");
      router.push("/projects");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
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

  if (state.loading) {
    return (
      <div className="min-h-screen bg-chalk-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-chalk-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!state.project) {
    return (
      <div className="min-h-screen bg-chalk-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-chalk-text mb-2">
            Project not found
          </h2>
          <p className="text-chalk-text-2 mb-4">
            The project you're looking for doesn't exist.
          </p>
          <Button
            onClick={() => router.push("/projects")}
            className="bg-chalk-primary-500 hover:bg-chalk-primary-600 text-white"
          >
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const { project, members } = state;
  const progress = project.metadata?.progress || 0;

  return (
    <div className="min-h-screen bg-chalk-bg">
      {/* Header */}
      <div className="border-b border-chalk-border bg-chalk-panel/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/projects")}
              className="text-chalk-text-2 hover:text-chalk-text hover:bg-chalk-subtle"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-chalk-text tracking-tight mb-2">
                    {project.name}
                  </h1>
                  <p className="text-chalk-text-2 text-lg leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-chalk-text-2 hover:text-chalk-text hover:bg-chalk-subtle"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-chalk-panel border-chalk-border">
                    <DropdownMenuItem
                      onClick={() =>
                        setState((prev) => ({ ...prev, showEditModal: true }))
                      }
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Project
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-chalk-border" />
                    <DropdownMenuItem
                      onClick={handleDeleteProject}
                      className="text-red-500 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Status Badge */}
              <div className="flex flex-wrap gap-3 mb-6">
                <Badge
                  className={getStatusColor(project.status)}
                  variant="outline"
                >
                  {project.status.replace("_", " ").charAt(0).toUpperCase() +
                    project.status.replace("_", " ").slice(1)}
                </Badge>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-chalk-text">
                    Progress
                  </span>
                  <span className="text-sm text-chalk-text-2">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-chalk-text-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Team Members Section */}
            <div className="lg:w-80">
              <div className="bg-chalk-panel border border-chalk-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-chalk-text-2" />
                    <h3 className="font-semibold text-chalk-text">
                      Team Members
                    </h3>
                    <span className="text-sm text-chalk-text-2">
                      ({members.length})
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setState((prev) => ({ ...prev, showInviteModal: true }))
                    }
                    className="text-chalk-primary-500 hover:text-chalk-primary-600 hover:bg-chalk-subtle"
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {members.map((member) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-chalk-subtle/50 hover:bg-chalk-subtle transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <MemberAvatar
                          member={member}
                          size="sm"
                          showRole={false}
                        />
                        <div>
                          <div className="font-medium text-chalk-text text-sm">
                            {member.user.name}
                          </div>
                          <div className="text-xs text-chalk-text-2">
                            {member.role
                              .replace("_", " ")
                              .charAt(0)
                              .toUpperCase() +
                              member.role.replace("_", " ").slice(1)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {members.length === 0 && (
                    <div className="text-center py-8 text-chalk-text-2">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No team members yet</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            showInviteModal: true,
                          }))
                        }
                        className="mt-3 border-chalk-border bg-chalk-panel hover:bg-chalk-subtle"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite Members
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area - Ready for tasks, files, etc. */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-chalk-panel border border-chalk-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-chalk-text mb-4">
                Project Overview
              </h2>
              <p className="text-chalk-text-2 mb-6">
                This section will contain project tasks, milestones, and other
                project-specific content.
              </p>
              <div className="text-center py-8 text-chalk-text-2">
                <div className="rounded-full bg-chalk-subtle p-4 mb-4 inline-block">
                  <Calendar className="h-8 w-8" />
                </div>
                <p>Tasks and timeline coming soon...</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Stats */}
            <div className="bg-chalk-panel border border-chalk-border rounded-lg p-6">
              <h3 className="font-semibold text-chalk-text mb-4">
                Project Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-chalk-text-2">Total Tasks</span>
                  <span className="font-medium text-chalk-text">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-chalk-text-2">Completed</span>
                  <span className="font-medium text-chalk-text">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-chalk-text-2">In Progress</span>
                  <span className="font-medium text-chalk-text">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-chalk-text-2">Team Size</span>
                  <span className="font-medium text-chalk-text">
                    {members.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-chalk-panel border border-chalk-border rounded-lg p-6">
              <h3 className="font-semibold text-chalk-text mb-4">
                Recent Activity
              </h3>
              <div className="text-center py-6 text-chalk-text-2">
                <p className="text-sm">No recent activity</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Project Modal */}
      <ProjectModal
        open={state.showEditModal}
        onOpenChange={(open) =>
          setState((prev) => ({ ...prev, showEditModal: open }))
        }
        project={project}
        onProjectCreated={handleProjectUpdated}
      />

      {/* Invite Member Modal */}
      <InviteMemberModal
        open={state.showInviteModal}
        onOpenChange={(open) =>
          setState((prev) => ({ ...prev, showInviteModal: open }))
        }
        projectId={project._id}
        projectName={project.name}
        invitationCode={project.invitationCode}
        canInvite={true} // TODO: Add proper permission check
        onMemberInvited={() => {
          loadProject();
          setState((prev) => ({ ...prev, showInviteModal: false }));
        }}
      />
    </div>
  );
};

export default ProjectDetailPage;
