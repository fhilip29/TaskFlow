const API_URL = "http://localhost:4000/api/auth";

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  role: "user" | "admin" | "manager";
  isVerified: boolean;
  profileImage?: string;
  phoneNumber?: string;
  bio?: string;
  gender?: "Male" | "Female" | "Other";
  dateOfBirth?: string;
  address?: Address;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return {
    token: data.token,
    user: data.user,
  } as LoginResponse;
};

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  bio?: string;
  gender?: "Male" | "Female" | "Other";
  dateOfBirth?: string;
  address?: Address;
}

export const register = async (data: RegisterData): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const data = await response.json();

    if (!response.ok) {
      // If the server returns a validation error or other error message
      const errorMessage =
        data.message ||
        (data.errors ? JSON.stringify(data.errors) : "Registration failed");
      throw new Error(errorMessage);
    }

    return {
      token: data.token,
      user: data.user,
    } as LoginResponse;
  } catch (error) {
    console.error("Registration error:", error);
    if (error instanceof Error) {
      throw error; // Re-throw the error to be caught by the AuthContext
    }
    throw new Error("Failed to connect to the server. Please try again later.");
  }
};

export const getCurrentUser = async (token?: string) => {
  const response = await fetch(`${API_URL}/me`, {
    credentials: "include",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  const data = await response.json();
  return data.data;
};
