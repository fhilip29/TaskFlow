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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-white border-b border-gray-200">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-teal-50/30" />
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          {/* Navigation */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/projects")}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </div>

          {/* Project Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {project.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                        {project.name}
                      </h1>
                      <Badge
                        className={`${getStatusColor(
                          project.status
                        )} mt-2 px-3 py-1 text-xs font-medium`}
                        variant="outline"
                      >
                        {project.status
                          .replace("_", " ")
                          .charAt(0)
                          .toUpperCase() +
                          project.status.replace("_", " ").slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed max-w-3xl">
                    {project.description}
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 -mr-2"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white border-gray-200 shadow-lg">
                    <DropdownMenuItem
                      onClick={() =>
                        setState((prev) => ({ ...prev, showEditModal: true }))
                      }
                      className="hover:bg-gray-50"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Project
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    <DropdownMenuItem
                      onClick={handleDeleteProject}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Progress Bar */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Project Progress
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {progress}%
                  </span>
                </div>
                <Progress value={progress} className="h-3 bg-gray-100" />
              </div>

              {/* Project Meta */}
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {members.length} team member
                    {members.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Primary Content */}
          <div className="xl:col-span-3 space-y-8">
            {/* Team Members Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Team Members
                      </h2>
                      <p className="text-sm text-gray-600">
                        {members.length} active member
                        {members.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      setState((prev) => ({ ...prev, showInviteModal: true }))
                    }
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                </div>
              </div>

              <div className="p-6">
                {members.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {members.map((member, index) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <MemberAvatar
                            member={member}
                            size="md"
                            showRole={false}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              {member.fullName ||
                                member.user?.fullName ||
                                member.email}
                            </div>
                            <div className="text-sm text-gray-600 capitalize">
                              {member.role.replace("_", " ")}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No team members yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Invite team members to start collaborating on this
                      project.
                    </p>
                    <Button
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          showInviteModal: true,
                        }))
                      }
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Your First Member
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Project Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Project Overview
                    </h2>
                    <p className="text-sm text-gray-600">
                      Tasks and milestones
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Tasks coming soon
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Task management and project timeline features are being
                    developed. Stay tuned for updates!
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-semibold text-gray-900">
                    {progress}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Team Size</span>
                  <span className="font-semibold text-gray-900">
                    {members.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium text-emerald-600 capitalize">
                    {project.status.replace("_", " ")}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-sm text-gray-600">Created</div>
                  <div className="font-medium text-gray-900">
                    {new Date(project.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600">No recent activity</p>
                <p className="text-xs text-gray-500 mt-1">
                  Activity will appear here as team members interact with the
                  project
                </p>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-200 hover:bg-gray-50"
                  onClick={() =>
                    setState((prev) => ({ ...prev, showEditModal: true }))
                  }
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Project
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-200 hover:bg-gray-50"
                  onClick={() =>
                    setState((prev) => ({ ...prev, showInviteModal: true }))
                  }
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Members
                </Button>
              </div>
            </motion.div>
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
