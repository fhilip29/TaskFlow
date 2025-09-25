"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  User,
  Settings,
  CheckSquare,
  FolderOpen,
  Calendar,
  BarChart3,
  Clock,
  Users,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    description: "Overview & stats",
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: <User className="w-5 h-5" />,
    description: "Personal info",
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="w-5 h-5" />,
    description: "App preferences",
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: <CheckSquare className="w-5 h-5" />,
    description: "Task management",
  },
  {
    name: "Projects",
    href: "/projects",
    icon: <FolderOpen className="w-5 h-5" />,
    description: "Project tracking",
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: <Calendar className="w-5 h-5" />,
    description: "Schedule & deadlines",
  },
];

const quickActions = [
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: <BarChart3 className="w-4 h-4" />,
  },
  {
    name: "Recent",
    href: "/dashboard/recent",
    icon: <Clock className="w-4 h-4" />,
  },
  {
    name: "Team",
    href: "/dashboard/team",
    icon: <Users className="w-4 h-4" />,
  },
];

export default function Navigation() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <nav className="p-6 space-y-8">
      {/* User Info */}
      <div className="pb-4 border-b border-chalk-border">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-chalk-primary400/20 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-chalk-primary600" />
          </div>
          <div>
            <p className="text-chalk-body font-medium text-chalk-text">
              {user.fullName || user.username}
            </p>
            <p className="text-chalk-small text-chalk-text2">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div>
        <h3 className="text-chalk-label font-medium text-chalk-text2 uppercase tracking-wide mb-4 px-3">
          Navigation
        </h3>
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <motion.li
                key={item.name}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-chalk-md text-chalk-body font-medium chalk-transition group",
                    isActive
                      ? "bg-chalk-primary600 text-white shadow-chalk-md"
                      : "text-chalk-text2 hover:text-chalk-text hover:bg-chalk-subtle"
                  )}
                >
                  <span
                    className={cn(
                      "chalk-transition",
                      isActive
                        ? "text-white"
                        : "text-chalk-primary600 group-hover:scale-110"
                    )}
                  >
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={cn("truncate", isActive ? "text-white" : "")}>
                      {item.name}
                    </p>
                    <p
                      className={cn(
                        "text-chalk-small truncate",
                        isActive ? "text-white/80" : "text-chalk-text2"
                      )}
                    >
                      {item.description}
                    </p>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavItem"
                      className="w-2 h-2 bg-white rounded-full"
                      initial={false}
                      transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
                    />
                  )}
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-chalk-label font-medium text-chalk-text2 uppercase tracking-wide mb-4 px-3">
          Quick Access
        </h3>
        <ul className="space-y-1">
          {quickActions.map((item) => (
            <motion.li
              key={item.name}
              whileHover={{ x: 2 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-chalk-md text-chalk-small font-medium text-chalk-text2 hover:text-chalk-text hover:bg-chalk-subtle chalk-transition group"
              >
                <span className="text-chalk-text3 group-hover:text-chalk-primary600 group-hover:scale-110 chalk-transition">
                  {item.icon}
                </span>
                {item.name}
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-chalk-border">
        <p className="text-chalk-small text-chalk-text3 px-3">TaskFlow v2.0</p>
      </div>
    </nav>
  );
}
