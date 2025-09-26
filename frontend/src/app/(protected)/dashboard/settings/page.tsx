"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  pageTransition,
  staggerContainer,
  staggerItem,
} from "@/lib/motion/variants";
import {
  User,
  Lock,
  Bell,
  Palette,
  Globe,
  Shield,
  Camera,
  Save,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Home,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import {
  getUserProfile,
  updateUserProfile,
  updateProfileImage,
  changePassword,
  UpdateProfileData,
} from "@/services/userService";

const MotionDiv = motion.div;

export default function SettingsPage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [preferences, setPreferences] = useState({
    theme: "light",
    language: "en",
    notifications: true,
  });

  const [originalData, setOriginalData] = useState<UpdateProfileData>({});

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
      zipCode: "",
      country: "",
    },
  });

  // Load profile data on mount
  useEffect(() => {
    loadProfileData();
  }, [token]);

  // Check for changes whenever formData updates
  useEffect(() => {
    const hasDataChanged =
      JSON.stringify(formData) !== JSON.stringify(originalData) ||
      selectedImage !== null ||
      passwordData.currentPassword !== "" ||
      passwordData.newPassword !== "" ||
      passwordData.confirmPassword !== "";
    setHasChanges(hasDataChanged);
  }, [formData, originalData, selectedImage, passwordData]);

  const loadProfileData = async () => {
    if (!token) return;

    try {
      setLoadingProfile(true);
      const profileData = await getUserProfile(token);

      const profileFormData: UpdateProfileData = {
        fullName: profileData.fullName || "",
        bio: profileData.bio || "",
        phoneNumber: profileData.phoneNumber || "",
        gender: profileData.gender || undefined,
        dateOfBirth: profileData.dateOfBirth
          ? profileData.dateOfBirth.split("T")[0]
          : "",
        address: {
          street: profileData.address?.street || "",
          city: profileData.address?.city || "",
          state: profileData.address?.state || "",
          zipCode: profileData.address?.zipCode || "",
          country: profileData.address?.country || "",
        },
      };

      setFormData(profileFormData);
      setOriginalData(profileFormData);

      if (profileData.profileImage) {
        setProfileImage(`http://localhost:4001/${profileData.profileImage}`);
      }
      setImagePreview(null);
      setSelectedImage(null);
    } catch (error) {
      console.error("Failed to load profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("No authentication token found");
      return;
    }

    if (!hasChanges) {
      toast.info("No changes to save");
      return;
    }

    setLoading(true);

    try {
      // Validate password if attempting to change it
      if (
        passwordData.currentPassword ||
        passwordData.newPassword ||
        passwordData.confirmPassword
      ) {
        if (!passwordData.currentPassword) {
          toast.error("Current password is required");
          return;
        }
        if (!passwordData.newPassword) {
          toast.error("New password is required");
          return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          toast.error("New password and confirmation don't match");
          return;
        }
        if (passwordData.newPassword.length < 6) {
          toast.error("New password must be at least 6 characters long");
          return;
        }
      }

      // Update profile data first
      const updatedProfile = await updateUserProfile(token, formData);

      // Handle password change if provided
      if (passwordData.currentPassword && passwordData.newPassword) {
        await changePassword(token, {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        });
      }

      // Handle image upload if there's a selected image
      if (selectedImage) {
        const imageUpdatedProfile = await updateProfileImage(
          token,
          selectedImage
        );
        setProfileImage(
          `http://localhost:4001/${imageUpdatedProfile.profileImage}`
        );
      }

      // Reset all form states
      setOriginalData(formData);
      setHasChanges(false);
      setSelectedImage(null);
      setImagePreview(null);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Settings saved successfully!");
    } catch (error: any) {
      console.error("Failed to update settings:", error);
      toast.error(
        error.message || "Failed to save settings. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Set selected image for preview
    setSelectedImage(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setProfileImage(null);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePasswordChange = (
    field: keyof typeof passwordData,
    value: string
  ) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loadingProfile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-chalk-bg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-chalk-text2">Loading settings...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-chalk-bg">
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <MotionDiv
            variants={pageTransition}
            initial="initial"
            animate="animate"
            className="space-y-chalk-8"
          >
            {/* Navigation */}
            <div className="flex items-center gap-2 text-sm text-chalk-text-2 mb-6">
              <Link
                href="/dashboard"
                className="flex items-center gap-1 hover:text-chalk-text transition-colors"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-chalk-text font-medium">Settings</span>
            </div>

            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-chalk-h1 font-serif text-chalk-text relative inline-block chalk-underline pb-2">
                Settings
              </h1>
              <p className="text-chalk-body text-chalk-text2">
                Manage your account settings and preferences
              </p>
            </div>

            {/* Notifications - Moved below header */}
            <div className="space-y-4">
              {/* Success Toast */}
              {/* Error Toast */}
              {/* Connection Status */}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="profile"
                  className="flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="flex items-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger
                  value="preferences"
                  className="flex items-center gap-2"
                >
                  <Palette className="w-4 h-4" />
                  Preferences
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit}>
                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                  <MotionDiv
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="space-y-6"
                  >
                    {/* Profile Picture Section */}
                    <MotionDiv variants={staggerItem}>
                      <Card>
                        <CardHeader>
                          <CardTitle
                            asHeading
                            className="flex items-center gap-2"
                          >
                            <Camera className="w-5 h-5 text-chalk-primary600" />
                            Profile Picture
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center gap-6">
                          <div className="w-20 h-20 bg-chalk-primary400/20 rounded-full flex items-center justify-center overflow-hidden relative">
                            {imagePreview || profileImage ? (
                              <img
                                src={imagePreview || profileImage || ""}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-8 h-8 text-chalk-primary600" />
                            )}
                            {selectedImage && !imagePreview && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="border-chalk-border text-chalk-text hover:bg-chalk-hover"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Change Picture
                              </Button>
                              {(profileImage || imagePreview) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleRemoveImage}
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                            <p className="text-chalk-small text-chalk-text2">
                              JPG, PNG or GIF. Max size 5MB.
                              {selectedImage && (
                                <span className="text-blue-600 block">
                                  Changes will be saved when you click "Save
                                  Changes"
                                </span>
                              )}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </MotionDiv>

                    {/* Basic Information */}
                    <MotionDiv variants={staggerItem}>
                      <Card>
                        <CardHeader>
                          <CardTitle asHeading>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="fullName">Full Name</Label>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-chalk-text2" />
                                <Input
                                  id="fullName"
                                  name="fullName"
                                  className="pl-10"
                                  value={formData.fullName || ""}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="phoneNumber">Phone Number</Label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-chalk-text2" />
                                <Input
                                  id="phoneNumber"
                                  name="phoneNumber"
                                  type="tel"
                                  className="pl-10"
                                  value={formData.phoneNumber || ""}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="gender">Gender</Label>
                              <Select
                                value={formData.gender || ""}
                                onValueChange={(value) =>
                                  handleSelectChange("gender", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Male">Male</SelectItem>
                                  <SelectItem value="Female">Female</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="dateOfBirth">Date of Birth</Label>
                              <Input
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth || ""}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                              id="bio"
                              name="bio"
                              placeholder="Tell us about yourself..."
                              className="min-h-[100px]"
                              value={formData.bio || ""}
                              onChange={handleInputChange}
                            />
                            <p className="text-chalk-small text-chalk-text2">
                              {(formData.bio || "").length}/500 characters
                            </p>
                          </div>

                          {/* Address Section */}
                          <div className="space-y-4 border-t pt-4">
                            <h4 className="text-lg font-medium flex items-center gap-2">
                              <MapPin className="w-5 h-5 text-chalk-primary600" />
                              Address Information
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="address.street">
                                  Street Address
                                </Label>
                                <Input
                                  id="address.street"
                                  name="address.street"
                                  value={formData.address?.street || ""}
                                  onChange={handleInputChange}
                                  placeholder="Enter your street address"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="address.city">City</Label>
                                <Input
                                  id="address.city"
                                  name="address.city"
                                  value={formData.address?.city || ""}
                                  onChange={handleInputChange}
                                  placeholder="Enter your city"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="address.state">State</Label>
                                <Input
                                  id="address.state"
                                  name="address.state"
                                  value={formData.address?.state || ""}
                                  onChange={handleInputChange}
                                  placeholder="Enter your state"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="address.country">Country</Label>
                                <Input
                                  id="address.country"
                                  name="address.country"
                                  value={formData.address?.country || ""}
                                  onChange={handleInputChange}
                                  placeholder="Enter your country"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="address.zipCode">
                                  ZIP Code
                                </Label>
                                <Input
                                  id="address.zipCode"
                                  name="address.zipCode"
                                  value={formData.address?.zipCode || ""}
                                  onChange={handleInputChange}
                                  placeholder="Enter your ZIP code"
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </MotionDiv>
                  </MotionDiv>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle asHeading className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-chalk-primary600" />
                        Change Password
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">
                          Current Password
                        </Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            handlePasswordChange(
                              "currentPassword",
                              e.target.value
                            )
                          }
                          placeholder="Enter your current password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            handlePasswordChange("newPassword", e.target.value)
                          }
                          placeholder="Enter your new password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirm Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            handlePasswordChange(
                              "confirmPassword",
                              e.target.value
                            )
                          }
                          placeholder="Confirm your new password"
                        />
                      </div>
                      <p className="text-chalk-small text-chalk-text2">
                        Password changes will be saved when you click "Save
                        Changes" below.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle asHeading className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-chalk-primary600" />
                        Notification Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-chalk-body font-medium">
                              Email Notifications
                            </p>
                            <p className="text-chalk-small text-chalk-text2">
                              Receive notifications via email
                            </p>
                          </div>
                          <Badge variant="outline">Enabled</Badge>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-chalk-body font-medium">
                              Push Notifications
                            </p>
                            <p className="text-chalk-small text-chalk-text2">
                              Receive push notifications
                            </p>
                          </div>
                          <Badge variant="outline">Disabled</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Preferences Tab */}
                <TabsContent value="preferences" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle asHeading className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-chalk-primary600" />
                        Display Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="theme">Theme</Label>
                        <Select
                          value={preferences.theme}
                          onValueChange={(value) =>
                            setPreferences((prev) => ({
                              ...prev,
                              theme: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="auto">Auto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select
                          value={preferences.language}
                          onValueChange={(value) =>
                            setPreferences((prev) => ({
                              ...prev,
                              language: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                            <SelectItem value="ja">Japanese</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setFormData(originalData);
                      setHasChanges(false);
                      setSelectedImage(null);
                      setImagePreview(null);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    disabled={!hasChanges || loading}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </Tabs>
          </MotionDiv>
        </div>
      </div>
    </ProtectedRoute>
  );
}
