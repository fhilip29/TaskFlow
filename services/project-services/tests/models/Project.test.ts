import { Project } from "../../src/models/Project";
import { IProject, IProjectMember } from "../../src/types";
import { Types } from "mongoose";

describe("Project Model", () => {
  const userId = new Types.ObjectId();
  const mockProjectData = {
    name: "Test Project",
    description: "A test project",
    createdBy: userId,
    settings: {
      isPublic: false,
      allowMemberInvite: true,
      maxMembers: 50,
    },
  };

  describe("Project Creation", () => {
    it("should create a new project with required fields", async () => {
      const project = new Project(mockProjectData);
      const savedProject = await project.save();

      expect(savedProject.name).toBe(mockProjectData.name);
      expect(savedProject.description).toBe(mockProjectData.description);
      expect(savedProject.createdBy).toEqual(userId);
      expect(savedProject.status).toBe("active");
      expect(savedProject.invitationCode).toBeTruthy();
      expect(savedProject.invitationCode.length).toBe(8);
      expect(savedProject.members.length).toBe(1);
      expect(savedProject.members[0].role).toBe("admin");
    });

    it("should generate unique invitation codes", async () => {
      const project1 = new Project({ ...mockProjectData, name: "Project 1" });
      const project2 = new Project({ ...mockProjectData, name: "Project 2" });

      const savedProject1 = await project1.save();
      const savedProject2 = await project2.save();

      expect(savedProject1.invitationCode).not.toBe(
        savedProject2.invitationCode
      );
    });

    it("should fail validation with missing required fields", async () => {
      const invalidProject = new Project({});

      await expect(invalidProject.save()).rejects.toThrow();
    });

    it("should validate project name length", async () => {
      const projectWithLongName = new Project({
        ...mockProjectData,
        name: "a".repeat(101), // Exceeds 100 character limit
      });

      await expect(projectWithLongName.save()).rejects.toThrow();
    });
  });

  describe("Project Methods", () => {
    let project: IProject;

    beforeEach(async () => {
      project = new Project(mockProjectData);
      await project.save();
    });

    describe("isMember", () => {
      it("should return true for project creator", () => {
        expect(project.isMember(userId)).toBe(true);
      });

      it("should return false for non-member", () => {
        const nonMemberId = new Types.ObjectId();
        expect(project.isMember(nonMemberId)).toBe(false);
      });
    });

    describe("getMemberRole", () => {
      it("should return admin role for project creator", () => {
        expect(project.getMemberRole(userId)).toBe("admin");
      });

      it("should return null for non-member", () => {
        const nonMemberId = new Types.ObjectId();
        expect(project.getMemberRole(nonMemberId)).toBeNull();
      });
    });

    describe("hasPermission", () => {
      it("should allow admin to perform all actions", () => {
        expect(project.hasPermission(userId, "admin")).toBe(true);
        expect(project.hasPermission(userId, "member")).toBe(true);
        expect(project.hasPermission(userId, "viewer")).toBe(true);
      });

      it("should add member with correct permissions", () => {
        const memberId = new Types.ObjectId();
        project.members.push({
          userId: memberId,
          email: "member@test.com",
          role: "member",
          joinedAt: new Date(),
          status: "active",
        } as IProjectMember);

        expect(project.hasPermission(memberId, "member")).toBe(true);
        expect(project.hasPermission(memberId, "viewer")).toBe(true);
        expect(project.hasPermission(memberId, "admin")).toBe(false);
      });
    });

    describe("calculateProgress", () => {
      it("should return 0 progress when no tasks", () => {
        project.metadata.totalTasks = 0;
        project.metadata.completedTasks = 0;

        const progress = project.calculateProgress();
        expect(progress).toBe(0);
      });

      it("should calculate correct progress percentage", () => {
        project.metadata.totalTasks = 10;
        project.metadata.completedTasks = 7;

        const progress = project.calculateProgress();
        expect(progress).toBe(70);
      });

      it("should handle 100% completion", () => {
        project.metadata.totalTasks = 5;
        project.metadata.completedTasks = 5;

        const progress = project.calculateProgress();
        expect(progress).toBe(100);
      });
    });
  });

  describe("Project Status", () => {
    it("should set default status to active", async () => {
      const project = new Project(mockProjectData);
      const savedProject = await project.save();

      expect(savedProject.status).toBe("active");
    });

    it("should allow updating status to archived", async () => {
      const project = new Project(mockProjectData);
      const savedProject = await project.save();

      savedProject.status = "archived";
      const updatedProject = await savedProject.save();

      expect(updatedProject.status).toBe("archived");
    });
  });

  describe("Project Settings", () => {
    it("should set default settings correctly", async () => {
      const project = new Project({
        name: "Settings Test",
        createdBy: userId,
      });

      const savedProject = await project.save();

      expect(savedProject.settings.isPublic).toBe(false);
      expect(savedProject.settings.allowMemberInvite).toBe(true);
      expect(savedProject.settings.maxMembers).toBeUndefined();
    });

    it("should validate maxMembers range", async () => {
      const projectWithInvalidMax = new Project({
        ...mockProjectData,
        settings: {
          ...mockProjectData.settings,
          maxMembers: 1001, // Exceeds limit
        },
      });

      await expect(projectWithInvalidMax.save()).rejects.toThrow();
    });
  });
});
