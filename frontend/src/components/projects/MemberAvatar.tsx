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
  MoreHorizontal, 
  Crown, 
  User, 
  Eye, 
  UserX,
  Mail,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberAvatarProps {
  member: IProjectMember;
  size?: "sm" | "md" | "lg";
  showRole?: boolean;
  showName?: boolean;
  showTooltip?: boolean;
  showActions?: boolean;
  onUpdateRole?: (memberId: string, role: string) => void;
  onRemoveMember?: (memberId: string) => void;
  className?: string;
}

export function MemberAvatar({
  member,
  size = "md",
  showRole = true,
  showName = false,
  showTooltip = true,
  showActions = false,
  onUpdateRole,
  onRemoveMember,
  className,
}: MemberAvatarProps) {
  
  // Helper functions
  const getInitials = (name?: string, email?: string) => {
    if (name && name.trim()) {
      return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getMemberName = () => member.user?.name || member.user?.email || 'Unknown User';
  const getMemberEmail = () => member.user?.email || '';
  const getMemberAvatar = () => member.user?.avatar;

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-12 w-12"
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-3 w-3" />;
      case 'member':
        return <User className="h-3 w-3" />;
      case 'viewer':
        return <Eye className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-chalk-primary-500 text-white';
      case 'member':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const avatarContent = (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage 
            src={getMemberAvatar()}
            alt={getMemberName()} 
          />
          <AvatarFallback className="bg-chalk-subtle text-chalk-text font-medium">
            {getInitials(getMemberName(), getMemberEmail())}
          </AvatarFallback>
        </Avatar>
        
        {/* Role indicator badge */}
        {showRole && (
          <div className={cn(
            "absolute -bottom-1 -right-1 rounded-full px-1.5 py-0.5 text-xs font-medium flex items-center gap-1",
            getRoleColor(member.role)
          )}>
            {getRoleIcon(member.role)}
            {size === "lg" && (
              <span className="capitalize">{member.role}</span>
            )}
          </div>
        )}
      </div>
      
      {showName && (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-chalk-text truncate">
            {getMemberName()}
          </p>
        </div>
      )}
      
      {showActions && (onUpdateRole || onRemoveMember) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-chalk-panel border-chalk-border">
            {onUpdateRole && (
              <>
                <DropdownMenuItem
                  onClick={() => onUpdateRole(member.userId, 'admin')}
                  disabled={member.role === 'admin'}
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Make Admin
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUpdateRole(member.userId, 'member')}
                  disabled={member.role === 'member'}
                >
                  <User className="mr-2 h-4 w-4" />
                  Make Member
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUpdateRole(member.userId, 'viewer')}
                  disabled={member.role === 'viewer'}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Make Viewer
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-chalk-border" />
              </>
            )}
            {onRemoveMember && (
              <DropdownMenuItem
                onClick={() => onRemoveMember(member.userId)}
                className="text-red-500 focus:text-red-600"
              >
                <UserX className="mr-2 h-4 w-4" />
                Remove from Project
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {avatarContent}
          </TooltipTrigger>
          <TooltipContent className="bg-chalk-panel border-chalk-border">
            <div className="text-center">
              <p className="font-medium">{getMemberName()}</p>
              {getMemberName() !== getMemberEmail() && (
                <p className="text-xs text-chalk-text-2 flex items-center gap-1 mt-1">
                  <Mail className="h-3 w-3" />
                  {getMemberEmail()}
                </p>
              )}
              <p className="text-xs text-chalk-text-2 capitalize mt-1">
                {member.role}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return avatarContent;
}