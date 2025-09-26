import { Router } from "express";
import {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/project.controller";
import {
  inviteMember,
  joinProjectByCode,
  getProjectMembers,
  updateMemberRole,
  removeMember,
  leaveProject,
} from "../controllers/member.controller";
import {
  protect,
  requireProjectAdmin,
  requireProjectMember,
} from "../middleware/auth.middleware";
import { validateRequest, validateQuery } from "../utils/validation";
import {
  createProjectSchema,
  updateProjectSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  paginationSchema,
} from "../utils/validation";

const router = Router();

// ✅ Project CRUD Routes
/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               isPublic:
 *                 type: boolean
 *                 default: false
 *               allowMemberInvite:
 *                 type: boolean
 *                 default: true
 *               maxMembers:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 1000
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/", protect, validateRequest(createProjectSchema), createProject);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get user's projects with pagination
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name, -name, createdAt, -createdAt, updatedAt, -updatedAt]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, archived, deleted]
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, member, viewer]
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", protect, getUserProjects);

/**
 * @swagger
 * /api/projects/{projectId}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *       404:
 *         description: Project not found
 *       403:
 *         description: Access denied
 */
router.get("/:projectId", protect, getProjectById);

/**
 * @swagger
 * /api/projects/{projectId}:
 *   put:
 *     summary: Update project (Admin only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               status:
 *                 type: string
 *                 enum: [active, archived]
 *               settings:
 *                 type: object
 *                 properties:
 *                   isPublic:
 *                     type: boolean
 *                   allowMemberInvite:
 *                     type: boolean
 *                   maxMembers:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 1000
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Access denied
 *       404:
 *         description: Project not found
 */
router.put(
  "/:projectId",
  protect,
  validateRequest(updateProjectSchema),
  updateProject
);

/**
 * @swagger
 * /api/projects/{projectId}:
 *   delete:
 *     summary: Delete project (Creator only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Project not found
 */
router.delete("/:projectId", protect, deleteProject);

// ✅ Member Management Routes
/**
 * @swagger
 * /api/projects/{projectId}/invite:
 *   post:
 *     summary: Invite member to project
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             oneOf:
 *               - required: [email]
 *               - required: [userId]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               userId:
 *                 type: string
 *                 pattern: ^[0-9a-fA-F]{24}$
 *               role:
 *                 type: string
 *                 enum: [member, viewer]
 *                 default: member
 *     responses:
 *       201:
 *         description: Member invited successfully
 *       400:
 *         description: Validation error or user already member
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Project or user not found
 */
router.post(
  "/:projectId/invite",
  protect,
  validateRequest(inviteMemberSchema),
  inviteMember
);

/**
 * @swagger
 * /api/projects/join/{invitationCode}:
 *   post:
 *     summary: Join project using invitation code
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully joined project
 *       400:
 *         description: Already a member or invalid code
 *       404:
 *         description: Invalid invitation code
 */
router.post("/join/:invitationCode", protect, joinProjectByCode);

/**
 * @swagger
 * /api/projects/{projectId}/members:
 *   get:
 *     summary: Get project members
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Members retrieved successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Project not found
 */
router.get("/:projectId/members", protect, getProjectMembers);

/**
 * @swagger
 * /api/projects/{projectId}/members/{memberId}/role:
 *   put:
 *     summary: Update member role (Admin only)
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, member, viewer]
 *     responses:
 *       200:
 *         description: Member role updated successfully
 *       400:
 *         description: Cannot change creator role
 *       403:
 *         description: Access denied
 *       404:
 *         description: Project or member not found
 */
router.put(
  "/:projectId/members/:memberId/role",
  protect,
  validateRequest(updateMemberRoleSchema),
  updateMemberRole
);

/**
 * @swagger
 * /api/projects/{projectId}/members/{memberId}:
 *   delete:
 *     summary: Remove member from project (Admin only or self-removal)
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       400:
 *         description: Cannot remove project creator
 *       403:
 *         description: Access denied
 *       404:
 *         description: Project or member not found
 */
router.delete("/:projectId/members/:memberId", protect, removeMember);

/**
 * @swagger
 * /api/projects/{projectId}/leave:
 *   post:
 *     summary: Leave project
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully left project
 *       400:
 *         description: Project creator cannot leave
 *       404:
 *         description: Project not found or not a member
 */
router.post("/:projectId/leave", protect, leaveProject);

export default router;
