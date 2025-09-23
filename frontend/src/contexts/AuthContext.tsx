"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  login as authLogin,
  register as authRegister,
  getCurrentUser,
} from "@/services/authService";

import { User, RegisterData } from "@/services/authService";

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearStorage: () => void;
  loading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
    // Always try to fetch user with cookies; header token is optional
    fetchUser(storedToken || undefined);
  }, []);

  const fetchUser = async (token?: string) => {
    try {
      console.log("🔍 Fetching user data...");
      const userData = await getCurrentUser(token);
      console.log("✅ User data fetched successfully:", userData);
      console.log("📊 User exists in database:", !!userData);
      setUser(userData);
    } catch (err) {
      console.error("❌ Failed to fetch user:", err);
      console.error("🗑️ Clearing invalid token from localStorage");
      // Clear invalid token
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authLogin(email, password);
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Attempting to register with:", {
        email: data.email,
        username: data.username,
      });
      const response = await authRegister(data);
      console.log("Registration successful:", response);
      localStorage.setItem("token", response.token);
      setToken(response.token);
      setUser(response.user);
    } catch (err) {
      console.error("Registration error in AuthContext:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Registration failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:4000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (_err) {
      // ignore network errors on logout
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      setError(null);
      console.log("👋 User logged out");
    }
  };

  const clearStorage = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setError("Token cleared - please log in again");
    console.log("🗑️ Token cleared from localStorage");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        clearStorage,
        loading,
        error,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
