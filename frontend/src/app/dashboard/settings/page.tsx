"use client";

import React, { useState } from "react";
import ProfileSettings from "@/components/ProfileSettings";
import UserPreferences from "@/components/UserPreferences";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "preferences">(
    "profile"
  );

  const tabs = [
    {
      id: "profile" as const,
      name: "Profile",
      icon: (
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      id: "preferences" as const,
      name: "Preferences",
      icon: (
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
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Account Settings
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Customize your profile, preferences, and account settings to make
            TaskFlow work perfectly for you
          </p>
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
            <nav
              className="flex justify-center space-x-1 p-2"
              aria-label="Tabs"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? "bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-lg scale-105"
                      : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50"
                  } flex items-center space-x-3 px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 transform hover:scale-105`}
                >
                  <div
                    className={`${
                      activeTab === tab.id
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-gray-500"
                    }`}
                  >
                    {tab.icon}
                  </div>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Enhanced Tab Content */}
          <div className="p-8">
            {activeTab === "profile" && <ProfileSettings />}
            {activeTab === "preferences" && <UserPreferences />}
          </div>
        </div>
      </div>
    </div>
  );
}
