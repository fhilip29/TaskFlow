"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserProfile,
  updateUserProfile,
  updateProfileImage,
  deleteProfileImage,
  UpdateProfileData,
} from "@/services/userService";
import { User } from "@/services/authService";

interface ProfileSettingsProps {
  onProfileUpdate?: (user: User) => void;
}

export default function ProfileSettings({
  onProfileUpdate,
}: ProfileSettingsProps) {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");

  // Track original data for change detection
  const [originalData, setOriginalData] = useState<UpdateProfileData>({});
  const [hasChanges, setHasChanges] = useState(false);

  const [formData, setFormData] = useState<UpdateProfileData>({
    fullName: "",
    bio: "",
    phoneNumber: "",
    gender: undefined,
    dateOfBirth: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
  });

  useEffect(() => {
    loadProfile();
    checkBackendConnection();
  }, []);

  // Check for changes whenever formData updates
  useEffect(() => {
    const hasDataChanged =
      JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasChanges(hasDataChanged);
  }, [formData, originalData]);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch("http://localhost:4001/health", {
        method: "GET",
      });
      setConnectionStatus(response.ok ? "connected" : "disconnected");
    } catch (error) {
      console.error("Backend connection check failed:", error);
      setConnectionStatus("disconnected");
    }
  };

  const loadProfile = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const profileData = await getUserProfile(token);
      setProfile(profileData);

      // Update form data with current profile
      setFormData({
        fullName: profileData.fullName || "",
        bio: profileData.bio || "",
        phoneNumber: profileData.phoneNumber || "",
        gender: profileData.gender,
        dateOfBirth: profileData.dateOfBirth
          ? profileData.dateOfBirth.split("T")[0]
          : "",
        address: {
          street: profileData.address?.street || "",
          city: profileData.address?.city || "",
          state: profileData.address?.state || "",
          country: profileData.address?.country || "",
          zipCode: profileData.address?.zipCode || "",
        },
      });

      // Set original data for change tracking
      const profileFormData = {
        fullName: profileData.fullName || "",
        bio: profileData.bio || "",
        phoneNumber: profileData.phoneNumber || "",
        gender: profileData.gender,
        dateOfBirth: profileData.dateOfBirth
          ? profileData.dateOfBirth.split("T")[0]
          : "",
        address: {
          street: profileData.address?.street || "",
          city: profileData.address?.city || "",
          state: profileData.address?.state || "",
          country: profileData.address?.country || "",
          zipCode: profileData.address?.zipCode || "",
        },
      };

      setOriginalData(profileFormData);

      if (profileData.profileImage) {
        setImagePreview(`http://localhost:4001/${profileData.profileImage}`);
      }
    } catch (err) {
      setError("Failed to load profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("address.")) {
      const addressField = field.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file || !token) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please select a valid image file (JPG, PNG, or GIF)");
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setError("File size must be less than 5MB");
      return;
    }

    try {
      setImageUploading(true);
      setError(null);
      setSuccess(null);

      console.log("Uploading image:", file.name, file.size, file.type);

      const updatedProfile = await updateProfileImage(token, file);
      console.log("Image upload response:", updatedProfile);

      setProfile(updatedProfile);
      setImagePreview(`http://localhost:4001/${updatedProfile.profileImage}`);
      setSuccess("Profile image updated successfully!");

      if (onProfileUpdate) {
        onProfileUpdate(updatedProfile);
      }

      // Success message timeout
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Image upload error:", err);
      setError(err.message || "Failed to upload image");
      setTimeout(() => setError(null), 5000);
    } finally {
      setImageUploading(false);
    }
  };

  const handleFileInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleImageUpload(file);
      event.target.value = "";
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = Array.from(event.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      await handleImageUpload(imageFile);
    } else {
      setError("Please drop a valid image file");
    }
  };

  const handleDeleteImage = async () => {
    if (!token) return;

    try {
      setImageUploading(true);
      setError(null);
      setSuccess(null);

      await deleteProfileImage(token);
      const updatedProfile = await getUserProfile(token);
      setProfile(updatedProfile);
      setImagePreview(null);
      setSuccess("Profile image deleted successfully!");

      if (onProfileUpdate) {
        onProfileUpdate(updatedProfile);
      }

      // Success message timeout
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to delete image");
      console.error(err);
      setTimeout(() => setError(null), 5000);
    } finally {
      setImageUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!token) {
      setError("No authentication token found");
      return;
    }

    // Only proceed if there are changes
    if (!hasChanges) {
      setError("No changes to save");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setError(null);
    setSuccess(null);

    if (!formData.fullName?.trim()) {
      setError("Full name is required");
      return;
    }

    try {
      setSaving(true);

      console.log("Saving profile with data:", formData);
      console.log("Token present:", !!token);

      const updatedProfile = await updateUserProfile(token, formData);
      console.log("Profile update successful:", updatedProfile);

      setProfile(updatedProfile);
      setOriginalData(formData); // Update original data to reflect saved state
      setHasChanges(false); // Reset changes flag
      setSuccess("Profile updated successfully!");

      if (onProfileUpdate) {
        onProfileUpdate(updatedProfile);
      }

      // Don't set timeout for success message - let it persist
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Profile update error:", err);
      const errorMessage = err.message || "Failed to update profile";
      setError(errorMessage);

      setTimeout(() => setError(null), 10000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Profile Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your personal information and profile details
        </p>
      </div>

      {/* Connection Status */}
      {connectionStatus === "disconnected" && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl flex items-start space-x-3">
          <svg
            className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <div>
            <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
              Backend Connection Issue
            </p>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">
              Unable to connect to the backend service. Please ensure the users
              service is running on port 4001.
            </p>
            <button
              onClick={checkBackendConnection}
              className="mt-2 text-yellow-700 dark:text-yellow-300 text-sm underline hover:no-underline"
            >
              Try reconnecting
            </button>
            <button
              onClick={async () => {
                console.log("=== DEBUGGING BACKEND CONNECTION ===");
                try {
                  // Test health endpoint
                  const healthResponse = await fetch(
                    "http://localhost:4001/health"
                  );
                  console.log(
                    "Health check:",
                    healthResponse.status,
                    healthResponse.statusText
                  );

                  // Test profile endpoint if we have a token
                  if (token) {
                    const profileResponse = await fetch(
                      "http://localhost:4001/api/users/profile",
                      {
                        method: "GET",
                        headers: {
                          Authorization: `Bearer ${token}`,
                          "Content-Type": "application/json",
                        },
                      }
                    );
                    console.log(
                      "Profile endpoint:",
                      profileResponse.status,
                      profileResponse.statusText
                    );
                  }
                } catch (error) {
                  console.error("Debug test failed:", error);
                }
              }}
              className="mt-2 ml-4 text-yellow-700 dark:text-yellow-300 text-sm underline hover:no-underline"
            >
              Run Debug Test (Check Console)
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start space-x-3">
          <svg
            className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start space-x-3">
          <svg
            className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-green-600 dark:text-green-400 text-sm">
            {success}
          </p>
        </div>
      )}

      {/* Profile Image Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <svg
              className="w-6 h-6 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>Profile Image</span>
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8">
          <div className="relative group">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-xl group-hover:shadow-2xl transition-shadow"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-xl group-hover:shadow-2xl transition-shadow">
                <span className="text-3xl font-bold text-white">
                  {profile?.fullName?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
            )}

            {imageUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            {/* Drag and Drop Upload Area */}
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                isDragOver
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="space-y-3">
                <div className="mx-auto w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary-600 dark:text-primary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Drag and drop your image here, or click to browse
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={imageUploading}
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span>Choose File</span>
              </button>

              {imagePreview && (
                <button
                  onClick={handleDeleteImage}
                  disabled={imageUploading}
                  className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors space-x-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span>Remove</span>
                </button>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              disabled={imageUploading}
              className="sr-only"
            />
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <svg
              className="w-6 h-6 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>Personal Information</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all hover:border-primary-300"
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all hover:border-primary-300"
              placeholder="Enter your phone number"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Gender
            </label>
            <select
              value={formData.gender || ""}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all hover:border-primary-300"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all hover:border-primary-300"
            />
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <svg
              className="w-6 h-6 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Bio</span>
          </h3>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            About yourself
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            rows={4}
            maxLength={500}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all hover:border-primary-300 resize-none"
            placeholder="Tell us about yourself..."
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formData.bio?.length || 0}/500 characters
          </p>
        </div>
      </div>

      {/* Address Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <svg
              className="w-6 h-6 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>Address Information</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Street Address
            </label>
            <input
              type="text"
              value={formData.address?.street || ""}
              onChange={(e) =>
                handleInputChange("address.street", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all hover:border-primary-300"
              placeholder="Enter your street address"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              City
            </label>
            <input
              type="text"
              value={formData.address?.city || ""}
              onChange={(e) =>
                handleInputChange("address.city", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all hover:border-primary-300"
              placeholder="Enter your city"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              State
            </label>
            <input
              type="text"
              value={formData.address?.state || ""}
              onChange={(e) =>
                handleInputChange("address.state", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all hover:border-primary-300"
              placeholder="Enter your state"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Country
            </label>
            <input
              type="text"
              value={formData.address?.country || ""}
              onChange={(e) =>
                handleInputChange("address.country", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all hover:border-primary-300"
              placeholder="Enter your country"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              ZIP Code
            </label>
            <input
              type="text"
              value={formData.address?.zipCode || ""}
              onChange={(e) =>
                handleInputChange("address.zipCode", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all hover:border-primary-300"
              placeholder="Enter your ZIP code"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSaveProfile}
          disabled={saving || !hasChanges}
          className="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 space-x-3 min-w-[200px] justify-center"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>{hasChanges ? "Save Changes" : "No Changes"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
