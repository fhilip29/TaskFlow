"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  updateUserPreferences,
  deactivateAccount,
  type UserPreferences,
} from "@/services/userService";

export default function UserPreferences() {
  const { token, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: theme,
    notifications: true,
    language: "en",
    emailNotifications: true,
    timezone: "UTC",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    setPreferences((prev) => ({
      ...prev,
      theme: theme,
    }));
  }, [theme]);

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Auto-apply theme changes
    if (key === "theme") {
      setTheme(value);
    }
  };

  const handleSavePreferences = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      await updateUserPreferences(token, preferences);
      setSuccess("Preferences updated successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to update preferences");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!token) return;

    try {
      setDeactivating(true);
      setError(null);

      await deactivateAccount(token);

      // Logout user after deactivation
      logout();

      // Redirect to login page or show success message
      window.location.href = "/login";
    } catch (err) {
      setError("Failed to deactivate account");
      console.error(err);
      setDeactivating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Preferences & Settings
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-600 dark:text-green-400">{success}</p>
          </div>
        )}

        {/* Appearance Settings */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Appearance
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <select
                value={preferences.theme}
                onChange={(e) =>
                  handlePreferenceChange("theme", e.target.value)
                }
                className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language
              </label>
              <select
                value={preferences.language}
                onChange={(e) =>
                  handlePreferenceChange("language", e.target.value)
                }
                className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timezone
              </label>
              <select
                value={preferences.timezone}
                onChange={(e) =>
                  handlePreferenceChange("timezone", e.target.value)
                }
                className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
                <option value="Asia/Shanghai">Shanghai</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Notifications
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Push Notifications
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive notifications in your browser
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.notifications}
                  onChange={(e) =>
                    handlePreferenceChange("notifications", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Notifications
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive updates via email
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "emailNotifications",
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Save Preferences */}
        <div className="flex justify-end mb-8">
          <button
            onClick={handleSavePreferences}
            disabled={loading}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{loading ? "Saving..." : "Save Preferences"}</span>
          </button>
        </div>

        {/* Danger Zone */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
            Danger Zone
          </h3>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-300">
                  Deactivate Account
                </h4>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  Once you deactivate your account, you will lose access to all
                  your data.
                </p>
              </div>

              <button
                onClick={() => setShowDeactivateConfirm(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Deactivate Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Deactivate Confirmation Modal */}
      {showDeactivateConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Account Deactivation
            </h3>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to deactivate your account? This action
              cannot be undone and you will lose access to all your data.
            </p>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeactivateConfirm(false)}
                disabled={deactivating}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleDeactivateAccount}
                disabled={deactivating}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {deactivating && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{deactivating ? "Deactivating..." : "Deactivate"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
