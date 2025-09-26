"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UserPlus, Mail, Copy, QrCode } from "lucide-react";
import { projectService } from "@/services/projectService";
import { toast } from "sonner";

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  invitationCode: string;
  canInvite?: boolean;
  onMemberInvited?: () => void;
}

interface FormData {
  email: string;
  role: "member" | "viewer";
}

interface FormErrors {
  email?: string;
}

export function InviteMemberModal({
  open,
  onOpenChange,
  projectId,
  projectName,
  invitationCode,
  canInvite = true,
  onMemberInvited,
}: InviteMemberModalProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"invite" | "share">("invite");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    role: "member",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      await projectService.inviteMember(projectId, {
        email: formData.email.trim(),
        role: formData.role,
      });

      toast.success(`Invitation sent to ${formData.email}`);
      onMemberInvited?.();
      onOpenChange(false);

      // Reset form
      setFormData({
        email: "",
        role: "member",
      });
    } catch (error) {
      console.error("Error inviting member:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send invitation"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const copyInvitationCode = async () => {
    try {
      await navigator.clipboard.writeText(invitationCode);
      toast.success("Invitation code copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy invitation code");
    }
  };

  const copyInviteLink = async () => {
    const inviteLink = `${window.location.origin}/projects/join/${invitationCode}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Invitation link copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy invitation link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-chalk-panel border-chalk-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-chalk-text">
            <UserPlus className="h-5 w-5 text-chalk-primary-500" />
            Invite Team Members
          </DialogTitle>
          <DialogDescription className="text-chalk-text-2">
            Invite members to collaborate on "{projectName}"
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-chalk-subtle/30 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("invite")}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === "invite"
                ? "bg-chalk-panel text-chalk-text shadow-sm"
                : "text-chalk-text-2 hover:text-chalk-text"
            }`}
          >
            Send Invitation
          </button>
          <button
            onClick={() => setActiveTab("share")}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === "share"
                ? "bg-chalk-panel text-chalk-text shadow-sm"
                : "text-chalk-text-2 hover:text-chalk-text"
            }`}
          >
            Share Link
          </button>
        </div>

        {activeTab === "invite" && canInvite ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-chalk-text font-medium">
                Email Address
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-chalk-text-2" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter team member's email..."
                  className={`pl-10 bg-chalk-bg border-chalk-border focus:border-chalk-primary-400 ${
                    errors.email ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="role" className="text-chalk-text font-medium">
                Role
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange("role", value)}
              >
                <SelectTrigger className="mt-1 bg-chalk-bg border-chalk-border focus:border-chalk-primary-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-chalk-panel border-chalk-border">
                  <SelectItem value="member">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Member</span>
                      <span className="text-xs text-chalk-text-2">
                        Can view, create, and edit content
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Viewer</span>
                      <span className="text-xs text-chalk-text-2">
                        Can only view project content
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : activeTab === "invite" && !canInvite ? (
          <div className="text-center py-8">
            <p className="text-chalk-text-2">
              You don't have permission to invite members to this project.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label className="text-chalk-text font-medium">
                Invitation Code
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={invitationCode}
                  readOnly
                  className="bg-chalk-bg border-chalk-border font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyInvitationCode}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-chalk-text-2 mt-1">
                Share this code with team members to join the project
              </p>
            </div>

            <div>
              <Label className="text-chalk-text font-medium">
                Invitation Link
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={`${
                    typeof window !== "undefined" ? window.location.origin : ""
                  }/projects/join/${invitationCode}`}
                  readOnly
                  className="bg-chalk-bg border-chalk-border text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyInviteLink}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-chalk-text-2 mt-1">
                Direct link for team members to join the project
              </p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-chalk-border">
              <p className="text-sm text-chalk-text-2">
                Anyone with this link can join the project
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
