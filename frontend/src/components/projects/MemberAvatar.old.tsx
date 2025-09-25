"use client";

import React from "react";
import { IProjectMember } from "@/types/project";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  MoreVertical, 
  Shield, 
  User, 
  Eye, 
  UserMinus,
  Crown 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberAvatarProps {
  member: IProjectMember;
  currentUserRole?: "admin" | "member" | "viewer";
  currentUserId?: string;
  onRoleChange?: (member: IProjectMember, newRole: "admin" | "member" | "viewer") => void;
  onRemove?: (member: IProjectMember) => void;
  size?: "sm" | "md" | "lg";
  showRole?: boolean;
  showActions?: boolean;
  className?: string;
}

export function MemberAvatar({
  member,
  currentUserRole,
  currentUserId,
  onRoleChange,
  onRemove,
  size = "md",
  showRole = true,
  showActions = false,
  className,
}: MemberAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const roleColors = {
    admin: "bg-primary text-primary-foreground",
    member: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    viewer: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };

  const roleIcons = {
    admin: <Crown className="w-3 h-3" />,
    member: <User className="w-3 h-3" />,
    viewer: <Eye className="w-3 h-3" />,
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const canManageUser = 
    currentUserRole === "admin" && 
    currentUserId !== member.userId &&
    member.role !== "admin";

  const memberContent = (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative">
        <Avatar className={cn(sizeClasses[size])}>
          <AvatarImage 
            src={member.profileImage} 
            alt={member.fullName || member.email} 
          />
          <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
            {getInitials(member.fullName, member.email)}
          </AvatarFallback>
        </Avatar>
        {member.status === "invited" && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-background" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {member.fullName || member.email}
          </p>
          {showRole && (
            <Badge className={cn("text-xs", roleColors[member.role])}>
              <span className="flex items-center gap-1">
                {roleIcons[member.role]}
                {member.role}
              </span>
            </Badge>
          )}
        </div>
        {member.fullName && (
          <p className="text-xs text-muted-foreground truncate">
            {member.email}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Joined {new Date(member.joinedAt).toLocaleDateString()}
        </p>
      </div>

      {showActions && canManageUser && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onRoleChange?.(member, member.role === "member" ? "viewer" : "member")}
            >
              {member.role === "member" ? (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Make Viewer
                </>
              ) : (
                <>
                  <User className="mr-2 h-4 w-4" />
                  Make Member
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onRoleChange?.(member, "admin")}
              disabled={member.role === "admin"}
            >
              <Shield className="mr-2 h-4 w-4" />
              Make Admin
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onRemove?.(member)}
              className="text-red-600 focus:text-red-600"
            >
              <UserMinus className="mr-2 h-4 w-4" />
              Remove Member
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );

  if (showActions || size === "sm") {
    return memberContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {memberContent}
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-medium">{member.fullName || member.email}</p>
            <p className="text-xs text-muted-foreground">{member.role}</p>
            {member.status === "invited" && (
              <p className="text-xs text-orange-600">Pending invitation</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default MemberAvatar;