import { Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import {
  AuthenticatedRequest,
  UpdateProfileRequest,
  ApiResponse,
  UserProfileResponse,
} from "../types";

// Get user profile
export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<UserProfileResponse>>
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const user = await User.findById(userId).select("-__v");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: user.toObject(),
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update user profile
export const updateUserProfile = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<UserProfileResponse>>
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const updateData: UpdateProfileRequest = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    // Validate date of birth format if provided
    if (updateData.dateOfBirth) {
      const date = new Date(updateData.dateOfBirth);
      if (isNaN(date.getTime())) {
        res.status(400).json({
          success: false,
          message: "Invalid date format for dateOfBirth",
        });
        return;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: updateData,
        updatedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-__v");

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser.toObject(),
    });
  } catch (error) {
    console.error("Error updating user profile:", error);

    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update profile image
export const updateProfileImage = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<UserProfileResponse>>
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const file = req.file;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    if (!file) {
      res.status(400).json({
        success: false,
        message: "No image file provided",
      });
      return;
    }

    console.log("Uploaded file details:", {
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
    });

    // Store the relative path to the uploaded image
    const imageUrl = `uploads/${file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profileImage: imageUrl,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    console.log("Profile image updated successfully:", {
      userId,
      profileImage: imageUrl,
      updatedUser: updatedUser.toObject(),
    });

    res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      data: updatedUser.toObject(),
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Delete profile image
export const deleteProfileImage = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<null>>
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $unset: { profileImage: 1 },
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profile image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting profile image:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update user preferences
export const updateUserPreferences = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<{ preferences: any }>>
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { preferences } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    if (!preferences) {
      res.status(400).json({
        success: false,
        message: "Preferences data is required",
      });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: { preferences },
        updatedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      data: { preferences: updatedUser.preferences },
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Deactivate user account
export const deactivateAccount = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<null>>
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        isActive: false,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Account deactivated successfully",
    });
  } catch (error) {
    console.error("Error deactivating account:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Change password
export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<null>>
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
      return;
    }

    // Get user with password
    const user = await User.findById(userId).select("+password");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
      return;
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await User.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
      updatedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
