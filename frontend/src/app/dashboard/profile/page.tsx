"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile } from "@/services/userService";
import { User } from "@/services/authService";
import Link from "next/link";

export default function ProfileView() {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const profileData = await getUserProfile(token);
      setProfile(profileData);
    } catch (err) {
      setError("Failed to load profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
          <button
            onClick={loadProfile}
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors space-x-2 font-medium"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              My Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View and manage your personal information
            </p>
          </div>
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl hover:from-primary-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl space-x-2 font-medium"
          >
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span>Edit Profile</span>
          </Link>
        </div>

        {/* Enhanced Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Gradient Cover */}
          <div className="h-40 bg-gradient-to-br from-primary-500 via-purple-600 to-pink-500 relative">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="absolute bottom-4 left-6">
              <div className="flex items-center space-x-2 text-white">
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
                    d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium">TaskFlow Profile</span>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="relative px-8 pb-8">
            {/* Enhanced Profile Image */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-6 -mt-20 mb-8">
              <div className="relative">
                {profile?.profileImage ? (
                  <img
                    src={`http://localhost:4001/${profile.profileImage}`}
                    alt="Profile"
                    className="w-40 h-40 rounded-full object-cover border-6 border-white dark:border-gray-800 shadow-2xl"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center border-6 border-white dark:border-gray-800 shadow-2xl">
                    <span className="text-5xl font-bold text-white">
                      {profile?.fullName?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-3 border-white dark:border-gray-800"></div>
              </div>

              <div className="text-center sm:text-left flex-1">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {profile?.fullName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-1 flex items-center justify-center sm:justify-start space-x-1">
                  <span>@{profile?.username}</span>
                  {profile?.isVerified && (
                    <svg
                      className="w-5 h-5 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </p>
                <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center sm:justify-start space-x-1">
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
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{profile?.email}</span>
                </p>
                <div className="flex items-center justify-center sm:justify-start space-x-2 mt-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      profile?.role === "admin"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        : profile?.role === "manager"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    }`}
                  >
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                      <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                    </svg>
                    {profile?.role
                      ? profile.role.charAt(0).toUpperCase() +
                        profile.role.slice(1)
                      : "User"}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      profile?.isVerified
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                    }`}
                  >
                    {profile?.isVerified ? "Verified" : "Unverified"}
                  </span>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            {profile?.bio && (
              <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-primary-600"
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
                  <span>About</span>
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Enhanced Profile Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <svg
                      className="w-5 h-5 text-white"
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
                  </div>
                  <span>Personal Information</span>
                </h3>
                <div className="space-y-4">
                  {profile?.phoneNumber && (
                    <div className="flex items-center space-x-4 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <svg
                          className="w-4 h-4 text-green-600 dark:text-green-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Phone Number
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {profile.phoneNumber}
                        </p>
                      </div>
                    </div>
                  )}

                  {profile?.gender && (
                    <div className="flex items-center space-x-4 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <svg
                          className="w-4 h-4 text-purple-600 dark:text-purple-400"
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
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Gender
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                          {profile.gender}
                        </p>
                      </div>
                    </div>
                  )}

                  {profile?.dateOfBirth && (
                    <div className="flex items-center space-x-4 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <svg
                          className="w-4 h-4 text-orange-600 dark:text-orange-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Date of Birth
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(profile.dateOfBirth).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <svg
                        className="w-4 h-4 text-blue-600 dark:text-blue-400"
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
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Account Status
                      </p>
                      <p
                        className={`font-medium ${
                          profile?.isVerified
                            ? "text-green-600 dark:text-green-400"
                            : "text-yellow-600 dark:text-yellow-400"
                        }`}
                      >
                        {profile?.isVerified
                          ? "Verified Account"
                          : "Unverified Account"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information Card */}
              {profile?.address && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <svg
                        className="w-5 h-5 text-white"
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
                    </div>
                    <span>Address Information</span>
                  </h3>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                    <div className="space-y-2">
                      {profile.address.street && (
                        <p className="text-gray-900 dark:text-white font-medium">
                          {profile.address.street}
                        </p>
                      )}
                      <div className="text-gray-600 dark:text-gray-400">
                        {[
                          profile.address.city,
                          profile.address.state,
                          profile.address.zipCode,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                      {profile.address.country && (
                        <p className="text-gray-600 dark:text-gray-400">
                          {profile.address.country}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Account Stats Card */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800 lg:col-span-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <span>Account Information</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-center">
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1">
                      {profile?.role
                        ? profile.role.charAt(0).toUpperCase() +
                          profile.role.slice(1)
                        : "User"}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Role
                    </p>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                      Active
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Status
                    </p>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-center">
                    <div
                      className={`text-2xl font-bold mb-1 ${
                        profile?.isVerified
                          ? "text-green-600 dark:text-green-400"
                          : "text-yellow-600 dark:text-yellow-400"
                      }`}
                    >
                      {profile?.isVerified ? "✓" : "○"}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Verification
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
