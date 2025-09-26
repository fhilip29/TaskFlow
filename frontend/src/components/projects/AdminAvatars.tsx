import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminInfo {
  _id: string;
  fullName: string;
  email: string;
  profileImage?: string;
}

interface AdminAvatarsProps {
  admins: AdminInfo[];
  maxDisplay?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AdminAvatars({
  admins,
  maxDisplay = 3,
  size = "md",
  className,
}: AdminAvatarsProps) {
  const displayAdmins = admins.slice(0, maxDisplay);
  const remainingCount = Math.max(0, admins.length - maxDisplay);

  const avatarSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  if (admins.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Crown icon to indicate admins */}
      <Crown
        className={cn("text-yellow-500", {
          "h-3 w-3": size === "sm",
          "h-4 w-4": size === "md",
          "h-5 w-5": size === "lg",
        })}
      />

      {/* Admin label */}
      <span className={cn("text-chalk-text-2 font-medium", textSizes[size])}>
        Admin{admins.length > 1 ? "s" : ""}:
      </span>

      {/* Avatar stack */}
      <div className="flex -space-x-1">
        {displayAdmins.map((admin, index) => (
          <div
            key={admin._id}
            className="relative group"
            style={{ zIndex: displayAdmins.length - index }}
          >
            <Avatar
              className={cn(
                avatarSizes[size],
                "ring-2 ring-chalk-panel border border-chalk-border transition-transform hover:scale-110"
              )}
            >
              <AvatarImage src={admin.profileImage} alt={admin.fullName} />
              <AvatarFallback
                className={cn(
                  "bg-chalk-primary-100 text-chalk-primary-700",
                  textSizes[size]
                )}
              >
                {admin.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-chalk-text text-chalk-panel text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
              {admin.fullName}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-chalk-text"></div>
            </div>
          </div>
        ))}

        {/* Show remaining count if there are more admins */}
        {remainingCount > 0 && (
          <div
            className={cn(
              "flex items-center justify-center rounded-full bg-chalk-subtle text-chalk-text-2 ring-2 ring-chalk-panel border border-chalk-border",
              avatarSizes[size],
              textSizes[size]
            )}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAvatars;
