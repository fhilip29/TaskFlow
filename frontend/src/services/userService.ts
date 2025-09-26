const USERS_API_URL = "http://localhost:4001/api/users";

export interface UserPreferences {
  theme?: string;
  notifications?: boolean;
  language?: string;
  emailNotifications?: boolean;
  timezone?: string;
}

export interface UpdateProfileData {
  fullName?: string;
  bio?: string;
  phoneNumber?: string;
  gender?: "Male" | "Female" | "Other";
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
}

// Get user profile from users-services
export const getUserProfile = async (token: string) => {
  const response = await fetch(`${USERS_API_URL}/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }

  const data = await response.json();
  return data.data;
};

// Update user profile
export const updateUserProfile = async (
  token: string,
  profileData: UpdateProfileData
) => {
  try {
    console.log("Making API request to:", `${USERS_API_URL}/profile`);
    console.log("Profile data:", profileData);
    console.log("Token:", token ? "Present" : "Missing");

    const response = await fetch(`${USERS_API_URL}/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    const data = await response.json();
    console.log("Response data:", data);

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data.data;
  } catch (error: any) {
    console.error("Update profile error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error(
        "Unable to connect to server. Please check if the backend service is running."
      );
    }

    throw new Error(error.message || "Failed to update profile");
  }
};

// Update profile image
export const updateProfileImage = async (token: string, imageFile: File) => {
  try {
    console.log(
      "Uploading image:",
      imageFile.name,
      imageFile.size,
      imageFile.type
    );

    const formData = new FormData();
    formData.append("file", imageFile);

    console.log(
      "Making image upload request to:",
      `${USERS_API_URL}/profile/image`
    );

    const response = await fetch(`${USERS_API_URL}/profile/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    console.log("Image upload response status:", response.status);

    const data = await response.json();
    console.log("Image upload response data:", data);

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    // Return the full user profile data (not just the image URL)
    return data.data;
  } catch (error: any) {
    console.error("Image upload error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error(
        "Unable to connect to server. Please check if the backend service is running."
      );
    }

    throw new Error(error.message || "Failed to upload image");
  }
};

// Delete profile image
export const deleteProfileImage = async (token: string) => {
  const response = await fetch(`${USERS_API_URL}/profile/image`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete profile image");
  }

  const data = await response.json();
  return data.message;
};

// Update user preferences
export const updateUserPreferences = async (
  token: string,
  preferences: UserPreferences
) => {
  const response = await fetch(`${USERS_API_URL}/preferences`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ preferences }),
  });

  if (!response.ok) {
    throw new Error("Failed to update preferences");
  }

  const data = await response.json();
  return data.data;
};

// Deactivate account
export const deactivateAccount = async (token: string) => {
  const response = await fetch(`${USERS_API_URL}/deactivate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to deactivate account");
  }

  const data = await response.json();
  return data.message;
};

// Change password
export const changePassword = async (
  token: string,
  passwordData: {
    currentPassword: string;
    newPassword: string;
  }
) => {
  const response = await fetch(`${USERS_API_URL}/change-password`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(passwordData),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to change password");
  }

  const data = await response.json();
  return data.message;
};
