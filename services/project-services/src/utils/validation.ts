import Joi from "joi";
import {
  CreateProjectRequest,
  UpdateProjectRequest,
  InviteMemberRequest,
  UpdateMemberRoleRequest,
} from "../types";

// Validation schemas
export const createProjectSchema = Joi.object<CreateProjectRequest>({
  name: Joi.string().required().trim().min(3).max(100).messages({
    "any.required": "Project name is required",
    "string.empty": "Project name cannot be empty",
    "string.min": "Project name must be at least 3 characters long",
    "string.max": "Project name cannot exceed 100 characters",
  }),
  description: Joi.string().optional().allow("").max(500).messages({
    "string.max": "Description cannot exceed 500 characters",
  }),
  isPublic: Joi.boolean().optional().default(false),
  allowMemberInvite: Joi.boolean().optional().default(true),
  maxMembers: Joi.number().optional().min(1).max(1000).messages({
    "number.min": "Maximum members must be at least 1",
    "number.max": "Maximum members cannot exceed 1000",
  }),
});

export const updateProjectSchema = Joi.object<UpdateProjectRequest>({
  name: Joi.string().optional().trim().min(3).max(100).messages({
    "string.empty": "Project name cannot be empty",
    "string.min": "Project name must be at least 3 characters long",
    "string.max": "Project name cannot exceed 100 characters",
  }),
  description: Joi.string().optional().allow("").max(500).messages({
    "string.max": "Description cannot exceed 500 characters",
  }),
  status: Joi.string().optional().valid("active", "archived").messages({
    "any.only": "Status must be either 'active' or 'archived'",
  }),
  settings: Joi.object({
    isPublic: Joi.boolean().optional(),
    allowMemberInvite: Joi.boolean().optional(),
    maxMembers: Joi.number().optional().min(1).max(1000).messages({
      "number.min": "Maximum members must be at least 1",
      "number.max": "Maximum members cannot exceed 1000",
    }),
  }).optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

export const inviteMemberSchema = Joi.object<InviteMemberRequest>({
  email: Joi.string()
    .email()
    .when("userId", {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.required(),
    })
    .messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Either email or userId is required",
    }),
  userId: Joi.string().optional().hex().length(24).messages({
    "string.hex": "User ID must be a valid MongoDB ObjectId",
    "string.length": "User ID must be 24 characters long",
  }),
  role: Joi.string()
    .optional()
    .valid("member", "viewer")
    .default("member")
    .messages({
      "any.only": "Role must be either 'member' or 'viewer'",
    }),
})
  .xor("email", "userId")
  .messages({
    "object.xor": "Either email or userId must be provided, but not both",
  });

export const updateMemberRoleSchema = Joi.object<UpdateMemberRoleRequest>({
  role: Joi.string().required().valid("admin", "member", "viewer").messages({
    "any.required": "Role is required",
    "any.only": "Role must be one of: admin, member, viewer",
  }),
});

export const paginationSchema = Joi.object({
  page: Joi.number().optional().min(1).default(1),
  limit: Joi.number().optional().min(1).max(100).default(10),
  sort: Joi.string()
    .optional()
    .valid(
      "name",
      "-name",
      "createdAt",
      "-createdAt",
      "updatedAt",
      "-updatedAt"
    ),
  search: Joi.string().optional().trim(),
  status: Joi.string().optional().valid("active", "archived", "deleted"),
  role: Joi.string().optional().valid("admin", "member", "viewer"),
});

// Validation middleware
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errorDetails,
      });
    }

    req.body = value;
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Query validation error",
        errors: errorDetails,
      });
    }

    req.query = value;
    next();
  };
};
