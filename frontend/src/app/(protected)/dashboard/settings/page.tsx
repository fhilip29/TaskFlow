"use client";

import { useState } from "react";
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
} from "lucide-react";

const MotionDiv = motion.div;

interface SettingsFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  bio: string;
  dateOfBirth: string;
  gender: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences: {
    notifications: boolean;
    theme: string;
    language: string;
  };
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [formData, setFormData] = useState<SettingsFormData>({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    bio: user?.bio || "",
    dateOfBirth: user?.dateOfBirth
      ? new Date(user.dateOfBirth).toISOString().split("T")[0]
      : "",
    gender: user?.gender || "",
    address: {
      street: user?.address?.street || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      zipCode: user?.address?.zipCode || "",
      country: user?.address?.country || "",
    },
    preferences: {
      notifications: true, // Default value since not in User type yet
      theme: "light", // Default value
      language: "en", // Default value
    },
  });

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
    setLoading(true);

    try {
      // API call would go here
      console.log("Settings updated:", formData);
      // Show success message
    } catch (error) {
      console.error("Failed to update settings:", error);
    } finally {
      setLoading(false);
    }
  };

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
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-chalk-h1 font-serif text-chalk-text relative inline-block chalk-underline pb-2">
                Settings
              </h1>
              <p className="text-chalk-body text-chalk-text2">
                Manage your account settings and preferences
              </p>
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
                          <div className="w-20 h-20 bg-chalk-primary400/20 rounded-full flex items-center justify-center">
                            <User className="w-8 h-8 text-chalk-primary600" />
                          </div>
                          <div className="space-y-2">
                            <Button variant="outline" size="sm">
                              Change Picture
                            </Button>
                            <p className="text-chalk-small text-chalk-text2">
                              JPG, PNG or GIF. Max size 2MB.
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
                                  value={formData.fullName}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="email">Email Address</Label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-chalk-text2" />
                                <Input
                                  id="email"
                                  name="email"
                                  type="email"
                                  className="pl-10"
                                  value={formData.email}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                              id="bio"
                              name="bio"
                              placeholder="Tell us about yourself..."
                              className="min-h-[100px]"
                              value={formData.bio}
                              onChange={handleInputChange}
                            />
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
                        <Input id="currentPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirm Password
                        </Label>
                        <Input id="confirmPassword" type="password" />
                      </div>
                      <Button variant="outline">Update Password</Button>
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
                        <Label htmlFor="preferences.theme">Theme</Label>
                        <Select
                          value={formData.preferences.theme}
                          onValueChange={(value) =>
                            handleSelectChange("preferences.theme", value)
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
                        <Label htmlFor="preferences.language">Language</Label>
                        <Select
                          value={formData.preferences.language}
                          onValueChange={(value) =>
                            handleSelectChange("preferences.language", value)
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
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
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
