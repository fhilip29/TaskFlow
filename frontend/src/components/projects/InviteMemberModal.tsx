"use client";

import React, { useState, useEffect } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  UserPlus,
  Mail,
  Copy,
  QrCode,
  X,
  Clock,
  Crown,
} from "lucide-react";
import { projectService } from "@/services/projectService";
import { toast } from "sonner";
import { IProjectMember } from "@/types/project";

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
  role: "admin" | "member" | "viewer";
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
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [activeTab, setActiveTab] = useState<"invite" | "share" | "pending">(
    "invite"
  );
  const [pendingMembers, setPendingMembers] = useState<IProjectMember[]>([]);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    role: "member",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Fetch pending invites when modal opens
  useEffect(() => {
    if (open) {
      fetchPendingInvites();
    }
  }, [open, projectId]);

  const fetchPendingInvites = async () => {
    try {
      setLoadingMembers(true);
      const response = await projectService.getProjectMembers(projectId, {
        status: "invited",
      });
      setPendingMembers(response.data || []);
    } catch (error) {
      console.error("Error fetching pending invites:", error);
      setPendingMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

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
            onClick={() => setActiveTab("pending")}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === "pending"
                ? "bg-chalk-panel text-chalk-text shadow-sm"
                : "text-chalk-text-2 hover:text-chalk-text"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              Pending
              {pendingMembers.length > 0 && (
                <Badge variant="secondary" className="h-5 w-5 p-0 text-xs">
                  {pendingMembers.length}
                </Badge>
              )}
            </div>
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
                  <SelectItem value="admin">
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-2">
                        <Crown className="h-3 w-3 text-yellow-500" />
                        <span className="font-medium">Admin</span>
                      </div>
                      <span className="text-xs text-chalk-text-2">
                        Full project access, can manage members
                      </span>
                    </div>
                  </SelectItem>
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
        ) : activeTab === "pending" ? (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-chalk-text">
                Pending Invitations ({pendingMembers.length})
              </h4>
              <Button
                size="sm"
                variant="outline"
                onClick={fetchPendingInvites}
                disabled={loadingMembers}
              >
                {loadingMembers ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>

            {loadingMembers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-chalk-text-2" />
              </div>
            ) : pendingMembers.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 text-chalk-text-2 mx-auto mb-2" />
                <p className="text-chalk-text-2 text-sm">
                  No pending invitations
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingMembers.map((member) => (
                  <div
                    key={`${member.userId}-${member.email}`}
                    className="flex items-center justify-between p-3 bg-chalk-subtle/20 rounded-lg border border-chalk-border"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={member.profileImage || member.user?.profileImage}
                        />
                        <AvatarFallback className="text-xs">
                          {member.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-chalk-text">
                          {member.fullName ||
                            member.user?.fullName ||
                            member.email}
                        </p>
                        <p className="text-xs text-chalk-text-2">
                          {member.email}
                        </p>
                        {member.invitationSentAt && (
                          <p className="text-xs text-chalk-text-3 mt-1">
                            Invited{" "}
                            {new Date(
                              member.invitationSentAt
                            ).toLocaleDateString()}
                            {member.invitedByInfo && (
                              <span> by {member.invitedByInfo.fullName}</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {member.role === "admin" && (
                          <Crown className="h-3 w-3 mr-1 text-yellow-500" />
                        )}
                        {member.role}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-orange-100 text-orange-700"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Separator />

            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </div>
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
