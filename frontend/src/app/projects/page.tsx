"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Home,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  IProject,
  IProjectListItem,
  ProjectFilterOptions,
} from "@/types/project";
import { projectService } from "@/services/projectService";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ProjectsPageState {
  projects: IProjectListItem[];
  loading: boolean;
  searchQuery: string;
  filterStatus: string;
  viewMode: "grid" | "list";
  totalProjects: number;
  currentPage: number;
  showCreateModal: boolean;
}

const ProjectsPage: React.FC = () => {
  const [state, setState] = useState<ProjectsPageState>({
    projects: [],
    loading: true,
    searchQuery: "",
    filterStatus: "all",
    viewMode: "grid",
    totalProjects: 0,
    currentPage: 1,
    showCreateModal: false,
  });

  const loadProjects = async (filters?: ProjectFilterOptions) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      const queryFilters: ProjectFilterOptions = filters || {
        search: state.searchQuery || undefined,
        status: state.filterStatus === "all" ? undefined : state.filterStatus,
        page: state.currentPage,
        limit: 12,
      };

      const response = await projectService.getProjects(queryFilters);

      // Handle response safely
      const projectsData = response?.data || [];
      const totalCount = response?.pagination?.total || projectsData.length;

      setState((prev) => ({
        ...prev,
        projects: Array.isArray(projectsData) ? projectsData : [],
        totalProjects: totalCount,
        loading: false,
      }));
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Failed to load projects");
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    const filters = {
      search: state.searchQuery || undefined,
      status: state.filterStatus === "all" ? undefined : state.filterStatus,
      page: state.currentPage,
      limit: 12,
    };
    loadProjects(filters);
  }, [state.searchQuery, state.filterStatus, state.currentPage]);

  // Development helper: auto-create token if none exists
  useEffect(() => {
    const initializeAuth = async () => {
      if (
        !localStorage.getItem("token") &&
        process.env.NODE_ENV === "development"
      ) {
        try {
          // Create a test user account
          const registerResponse = await fetch(
            "http://localhost:4000/api/auth/register",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fullName: "Test User",
                email: "test@example.com",
                password: "password123",
              }),
            }
          );

          // Login to get token
          const loginResponse = await fetch(
            "http://localhost:4000/api/auth/login",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: "test@example.com",
                password: "password123",
              }),
            }
          );

          if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            if (loginData.token) {
              localStorage.setItem("token", loginData.token);
              console.log("✅ Development token created");
              // Reload projects with new token
              const filters = {
                search: state.searchQuery || undefined,
                status:
                  state.filterStatus === "all" ? undefined : state.filterStatus,
                page: state.currentPage,
                limit: 12,
              };
              loadProjects(filters);
            }
          }
        } catch (error) {
          console.log("ℹ️ Could not create development token, using mock data");
        }
      }
    };

    initializeAuth();
  }, []);

  const handleSearch = (query: string) => {
    setState((prev) => ({
      ...prev,
      searchQuery: query,
      currentPage: 1,
    }));
  };

  const handleFilterChange = (status: string) => {
    setState((prev) => ({
      ...prev,
      filterStatus: status,
      currentPage: 1,
    }));
  };

  // Helper function to convert IProject to IProjectListItem
  const convertToListItem = (project: IProject): IProjectListItem => ({
    _id: project._id,
    name: project.name,
    description: project.description,
    role: "admin", // This should come from the user's role in the project
    memberCount: project.members?.length || 0,
    taskCount: project.metadata?.totalTasks || 0,
    progress: project.metadata?.progress || 0,
    status: project.status,
    updatedAt: project.updatedAt,
    // Enhanced member information
    admins:
      project.members
        ?.filter((m) => m.role === "admin" && m.status === "active")
        .map((m) => ({
          _id: m.userId,
          fullName: m.fullName || m.user?.fullName || "Unknown",
          email: m.email,
          profileImage: m.profileImage || m.user?.profileImage,
        })) || [],
    activeMembers:
      project.members?.filter((m) => m.status === "active").length || 0,
    pendingInvites:
      project.members?.filter((m) => m.status === "invited").length || 0,
    invitationCode: project.invitationCode,
  });

  const handleProjectCreated = (project: IProject) => {
    // Reload projects from backend to get the most up-to-date data
    const filters = {
      search: state.searchQuery || undefined,
      status: state.filterStatus === "all" ? undefined : state.filterStatus,
      page: state.currentPage,
      limit: 12,
    };
    loadProjects(filters);
    toast.success("Project created successfully!");
  };

  const handleProjectUpdated = (
    updatedProject: IProject | IProjectListItem
  ) => {
    let updatedListItem: IProjectListItem;

    if ("members" in updatedProject) {
      // It's an IProject, convert it
      updatedListItem = convertToListItem(updatedProject);
    } else {
      // It's already an IProjectListItem
      updatedListItem = updatedProject;
    }

    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p._id === updatedListItem._id ? updatedListItem : p
      ),
    }));
  };

  const handleProjectDeleted = (projectId: string) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p._id !== projectId),
      totalProjects: prev.totalProjects - 1,
    }));
    toast.success("Project deleted successfully");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div className="min-h-screen bg-chalk-bg">
      {/* Header */}
      <div className="border-b border-chalk-border bg-chalk-panel/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Navigation Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-chalk-text-2 mb-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 hover:text-chalk-text transition-colors"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-chalk-text font-medium">Projects</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-chalk-text tracking-tight">
                Projects
              </h1>
              <p className="text-chalk-text-2 mt-1">
                Manage and track your projects
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <Button
                onClick={() =>
                  setState((prev) => ({ ...prev, showCreateModal: true }))
                }
                variant="primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-chalk-text-2" />
            <Input
              placeholder="Search projects..."
              value={state.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-chalk-panel border-chalk-border focus:border-chalk-primary-400"
            />
          </div>

          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Status:{" "}
                {state.filterStatus === "all"
                  ? "All"
                  : state.filterStatus.charAt(0).toUpperCase() +
                    state.filterStatus.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-chalk-panel border-chalk-border">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-chalk-border" />
              <DropdownMenuItem onClick={() => handleFilterChange("all")}>
                All Projects
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("planning")}>
                Planning
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleFilterChange("in_progress")}
              >
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("on_hold")}>
                On Hold
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("completed")}>
                Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Mode Toggle */}
          <div className="flex border border-chalk-border rounded-lg overflow-hidden bg-chalk-panel">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setState((prev) => ({ ...prev, viewMode: "grid" }))
              }
              className={`rounded-none ${
                state.viewMode === "grid"
                  ? "bg-chalk-primary-500 text-white"
                  : "text-chalk-text-2 hover:text-chalk-text hover:bg-chalk-subtle"
              }`}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setState((prev) => ({ ...prev, viewMode: "list" }))
              }
              className={`rounded-none ${
                state.viewMode === "list"
                  ? "bg-chalk-primary-500 text-white"
                  : "text-chalk-text-2 hover:text-chalk-text hover:bg-chalk-subtle"
              }`}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Projects Grid/List */}
        {state.loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-chalk-primary-500 border-t-transparent"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={state.viewMode}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={
                state.viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {state.projects.length > 0 ? (
                state.projects.map((project) => (
                  <motion.div key={project._id} variants={itemVariants}>
                    <ProjectCard
                      project={project}
                      onUpdate={handleProjectUpdated}
                      onDelete={handleProjectDeleted}
                      viewMode={state.viewMode}
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  variants={itemVariants}
                  className="col-span-full flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="rounded-full bg-chalk-subtle p-4 mb-4">
                    <Plus className="h-8 w-8 text-chalk-text-2" />
                  </div>
                  <h3 className="text-lg font-semibold text-chalk-text mb-2">
                    No projects found
                  </h3>
                  <p className="text-chalk-text-2 mb-4">
                    {state.searchQuery || state.filterStatus !== "all"
                      ? "Try adjusting your filters or search terms"
                      : "Get started by creating your first project"}
                  </p>
                  <Button
                    onClick={() =>
                      setState((prev) => ({ ...prev, showCreateModal: true }))
                    }
                    variant="primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {state.totalProjects > 12 && (
          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={state.currentPage === 1}
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    currentPage: prev.currentPage - 1,
                  }))
                }
              >
                Previous
              </Button>
              <span className="text-sm text-chalk-text-2 px-3">
                Page {state.currentPage} of{" "}
                {Math.ceil(state.totalProjects / 12)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={
                  state.currentPage >= Math.ceil(state.totalProjects / 12)
                }
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    currentPage: prev.currentPage + 1,
                  }))
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <ProjectModal
        open={state.showCreateModal}
        onOpenChange={(open) =>
          setState((prev) => ({ ...prev, showCreateModal: open }))
        }
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};

export default ProjectsPage;
