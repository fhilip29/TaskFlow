import QRCode from "qrcode";
import mongoose from "mongoose";

/**
 * Generate QR code for project invitation
 */
export const generateProjectQR = async (
  invitationCode: string,
  projectName: string
): Promise<string | null> => {
  try {
    // Create invitation URL (this would be your frontend URL)
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const invitationUrl = `${baseUrl}/invite/${invitationCode}`;

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(invitationUrl, {
      errorCorrectionLevel: "M" as const,
      type: "image/png",
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      width: 256,
    });

    console.log(`[QR] Generated QR code for project: ${projectName}`);
    return qrCodeDataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    return null;
  }
};

/**
 * Generate unique invitation code
 */
export const generateInvitationCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Format project response data
 */
export const formatProjectResponse = (project: any, userDetails?: any): any => {
  const formatted = {
    _id: project._id.toString(),
    name: project.name,
    description: project.description,
    createdBy: project.createdBy,
    members:
      project.members?.map((member: any) => ({
        userId: member.userId.toString(),
        email: member.email,
        role: member.role,
        joinedAt: member.joinedAt,
        status: member.status,
      })) || [],
    invitationCode: project.invitationCode,
    qrCodeUrl: project.qrCodeUrl,
    status: project.status,
    settings: project.settings,
    metadata: project.metadata,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };

  // Add user details if provided
  if (userDetails) {
    formatted.createdBy = {
      _id: project.createdBy.toString(),
      ...userDetails,
    };
  }

  return formatted;
};

/**
 * Build MongoDB query from filters
 */
export const buildProjectQuery = (filters: any, userId: string): any => {
  // Convert userId to ObjectId for proper matching
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const query: any = {
    "members.userId": userObjectId,
    "members.status": "active",
  };

  console.log("[DEBUG] Building project query for userId:", userId);
  console.log("[DEBUG] UserObjectId:", userObjectId);
  console.log("[DEBUG] Query object:", JSON.stringify(query, null, 2));

  if (filters.status && filters.status !== "all") {
    query.status = filters.status;
  } else {
    query.status = { $ne: "deleted" };
  }

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
    ];
  }

  console.log("[DEBUG] Final query:", JSON.stringify(query, null, 2));
  return query;
};

/**
 * Build sort object for MongoDB
 */
export const buildSortObject = (sort: string = "-updatedAt"): any => {
  const sortObject: any = {};

  if (sort.startsWith("-")) {
    sortObject[sort.substring(1)] = -1;
  } else {
    sortObject[sort] = 1;
  }

  return sortObject;
};

/**
 * Calculate pagination metadata
 */
export const calculatePagination = (
  total: number,
  page: number,
  limit: number
) => {
  const pages = Math.ceil(total / limit);
  return {
    page,
    pages,
    total,
    limit,
    hasNext: page < pages,
    hasPrev: page > 1,
  };
};

/**
 * Validate ObjectId format
 */
export const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Sanitize user input
 */
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, "");
};

/**
 * Generate error response
 */
export const errorResponse = (
  message: string,
  statusCode: number = 400,
  error?: any
) => {
  const response: any = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === "development" && error) {
    response.error = error instanceof Error ? error.message : error;
    response.stack = error instanceof Error ? error.stack : undefined;
  }

  return { response, statusCode };
};

/**
 * Generate success response
 */
export const successResponse = (
  data: any,
  message: string = "Success",
  pagination?: any
) => {
  const response: any = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return response;
};
