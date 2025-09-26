"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile } from "@/services/userService";
import { User } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Home,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  Edit,
  Camera,
  Settings,
  Activity,
  Clock,
} from "lucide-react";

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
      <div className="min-h-screen bg-chalk-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-chalk-primary500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-chalk-text-2">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-chalk-bg flex items-center justify-center">
        <div className="text-center bg-chalk-panel rounded-2xl p-8 shadow-xl border border-chalk-border">
          <div className="w-16 h-16 text-chalk-danger mx-auto mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-chalk-text mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-chalk-danger mb-6">{error}</p>
          <Button
            onClick={loadProfile}
            variant="primary"
            className="bg-chalk-primary600 text-white hover:bg-chalk-primary700"
          >
            <svg
              className="w-4 h-4 mr-2"
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
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chalk-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-chalk-text-2 mb-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 hover:text-chalk-text transition-colors"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-chalk-text font-medium">Profile</span>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-chalk-text chalk-underline inline-block pb-2">
              My Profile
            </h1>
            <p className="text-chalk-text-2 mt-2">
              View and manage your personal information
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              asChild
              className="bg-chalk-primary600 text-white hover:bg-chalk-primary700"
            >
              <Link href="/dashboard/settings">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-chalk-panel border-chalk-border">
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  {profile?.profileImage ? (
                    <img
                      src={`http://localhost:4001/${profile.profileImage}`}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-chalk-border shadow-lg mx-auto"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-chalk-primary500 to-chalk-primary600 flex items-center justify-center border-4 border-chalk-border shadow-lg mx-auto">
                      <span className="text-4xl font-bold text-white">
                        {profile?.fullName?.[0]?.toUpperCase() ||
                          profile?.username?.[0]?.toUpperCase() ||
                          "U"}
                      </span>
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-chalk-success rounded-full border-4 border-chalk-panel flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <h2 className="text-xl font-serif font-bold text-chalk-text">
                    {profile?.fullName || profile?.username || "User"}
                  </h2>
                  {profile?.username && profile?.fullName && (
                    <p className="text-chalk-text-2">@{profile.username}</p>
                  )}
                  <div className="flex items-center justify-center gap-2">
                    <Badge
                      variant={
                        profile?.role === "admin" ? "destructive" : "default"
                      }
                      className={
                        profile?.role === "admin"
                          ? "bg-chalk-danger text-white"
                          : "bg-chalk-primary100 text-chalk-primary700"
                      }
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      {profile?.role
                        ? profile.role.charAt(0).toUpperCase() +
                          profile.role.slice(1)
                        : "User"}
                    </Badge>
                    {profile?.isVerified && (
                      <Badge
                        variant="outline"
                        className="bg-chalk-success/10 text-chalk-success border-chalk-success/20"
                      >
                        ✓ Verified
                      </Badge>
                    )}
                  </div>
                </div>

                {profile?.bio && (
                  <div className="text-center">
                    <p className="text-chalk-text-2 italic leading-relaxed">
                      "{profile.bio}"
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-chalk-panel border-chalk-border mt-6">
              <CardHeader>
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <Activity className="w-5 h-5 text-chalk-primary600" />
                  Account Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-chalk-text-2">Member since</span>
                  <span className="font-medium text-chalk-text">2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-chalk-text-2">Account Status</span>
                  <Badge
                    variant="outline"
                    className="bg-chalk-success/10 text-chalk-success"
                  >
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-chalk-text-2">Last Login</span>
                  <span className="font-medium text-chalk-text flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Today
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card className="bg-chalk-panel border-chalk-border">
              <CardHeader>
                <CardTitle className="text-xl font-serif flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-chalk-primary600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-chalk-subtle/50 rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-chalk-text-2 uppercase tracking-wide">
                          Email
                        </p>
                        <p className="font-medium text-chalk-text">
                          {profile?.email || "Not provided"}
                        </p>
                      </div>
                    </div>

                    {profile?.phoneNumber && (
                      <div className="flex items-center gap-3 p-3 bg-chalk-subtle/50 rounded-lg">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Phone className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-chalk-text-2 uppercase tracking-wide">
                            Phone
                          </p>
                          <p className="font-medium text-chalk-text">
                            {profile.phoneNumber}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {profile?.dateOfBirth && (
                      <div className="flex items-center gap-3 p-3 bg-chalk-subtle/50 rounded-lg">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Calendar className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-chalk-text-2 uppercase tracking-wide">
                            Birthday
                          </p>
                          <p className="font-medium text-chalk-text">
                            {new Date(profile.dateOfBirth).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {profile?.gender && (
                      <div className="flex items-center gap-3 p-3 bg-chalk-subtle/50 rounded-lg">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <UserIcon className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs text-chalk-text-2 uppercase tracking-wide">
                            Gender
                          </p>
                          <p className="font-medium text-chalk-text capitalize">
                            {profile.gender}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            {profile?.address && (
              <Card className="bg-chalk-panel border-chalk-border">
                <CardHeader>
                  <CardTitle className="text-xl font-serif flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-chalk-primary600" />
                    Address Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-chalk-subtle/50 rounded-lg">
                    <div className="space-y-2">
                      {profile.address.street && (
                        <p className="font-medium text-chalk-text">
                          {profile.address.street}
                        </p>
                      )}
                      <p className="text-chalk-text-2">
                        {[
                          profile.address.city,
                          profile.address.state,
                          profile.address.zipCode,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      {profile.address.country && (
                        <p className="text-chalk-text-2">
                          {profile.address.country}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security & Privacy */}
            <Card className="bg-chalk-panel border-chalk-border">
              <CardHeader>
                <CardTitle className="text-xl font-serif flex items-center gap-2">
                  <Shield className="w-5 h-5 text-chalk-primary600" />
                  Security & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-chalk-subtle/50 rounded-lg text-center">
                    <div
                      className={`text-2xl font-bold mb-1 ${
                        profile?.isVerified
                          ? "text-chalk-success"
                          : "text-chalk-warning"
                      }`}
                    >
                      {profile?.isVerified ? "✓" : "⚠"}
                    </div>
                    <p className="text-sm text-chalk-text-2">
                      Email Verification
                    </p>
                    <p className="font-medium text-chalk-text">
                      {profile?.isVerified ? "Verified" : "Unverified"}
                    </p>
                  </div>

                  <div className="p-4 bg-chalk-subtle/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-chalk-success mb-1">
                      🔒
                    </div>
                    <p className="text-sm text-chalk-text-2">
                      Account Security
                    </p>
                    <p className="font-medium text-chalk-text">Protected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
