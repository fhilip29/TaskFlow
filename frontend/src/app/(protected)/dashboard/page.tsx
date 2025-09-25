"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatCard } from "@/components/ui/data-viz";
import { motion } from "framer-motion";
import {
  staggerContainer,
  staggerItem,
  pageTransition,
} from "@/lib/motion/variants";
import {
  CheckCircle2,
  Clock,
  Users,
  AlertTriangle,
  Plus,
  FolderPlus,
  Calendar,
  BarChart3,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

const MotionDiv = motion.div;
const MotionSection = motion.section;

export default function DashboardPage() {
  const { user } = useAuth();

  // Enhanced stats with more data
  const stats = [
    {
      title: "Active Tasks",
      value: "12",
      change: { value: 15, label: "from last week", type: "positive" as const },
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: "primary" as const,
      progress: 75,
    },
    {
      title: "Projects",
      value: "5",
      change: { value: 2, label: "this month", type: "positive" as const },
      icon: <FolderPlus className="w-5 h-5" />,
      color: "success" as const,
      progress: 60,
    },
    {
      title: "Team Members",
      value: "8",
      change: { value: 0, label: "no change", type: "neutral" as const },
      icon: <Users className="w-5 h-5" />,
      color: "primary" as const,
      progress: 100,
    },
    {
      title: "Overdue Tasks",
      value: "3",
      change: { value: 5, label: "decreased", type: "positive" as const },
      icon: <AlertTriangle className="w-5 h-5" />,
      color: "warning" as const,
      progress: 25,
    },
  ];

  const recentTasks = [
    {
      id: "TSK-001",
      title: "Website Redesign",
      status: "in-progress",
      priority: "high",
    },
    {
      id: "TSK-002",
      title: "Setup Database",
      status: "done",
      priority: "medium",
    },
    {
      id: "TSK-003",
      title: "Team Meeting",
      status: "todo",
      priority: "low",
    },
  ];

  const upcomingDeadlines = [
    { title: "Mobile App Launch", daysLeft: 3, priority: "high" },
    { title: "Client Presentation", daysLeft: 7, priority: "medium" },
    { title: "Server Migration", daysLeft: 14, priority: "low" },
  ];

  return (
    <MotionDiv
      className="space-y-12"
      variants={pageTransition}
      initial="initial"
      animate="animate"
    >
      {/* Welcome Header with Chalk Underline */}
      <MotionDiv variants={staggerItem} className="text-center space-y-4">
        <h1 className="text-4xl font-serif text-foreground relative inline-block chalk-underline pb-2">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          Here&apos;s what&apos;s happening with your projects today. Stay
          organized, stay productive.
        </p>
      </MotionDiv>

      {/* Stats Grid */}
      <MotionSection
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <MotionDiv key={stat.title} variants={staggerItem}>
            <StatCard {...stat} />
          </MotionDiv>
        ))}
      </MotionSection>

      {/* Main Content Grid */}
      <MotionDiv
        variants={staggerItem}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle asHeading className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {recentTasks.map((task, index) => (
                <MotionDiv
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-card border border-border rounded-md hover:shadow-sm transition-all cursor-pointer group"
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      {task.status === "done" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <Badge
                        variant={
                          task.status as
                            | "todo"
                            | "in-progress"
                            | "done"
                            | "blocked"
                        }
                        className="text-xs mb-1"
                      >
                        {task.id}
                      </Badge>
                      <p className="text-sm font-medium text-foreground">
                        {task.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={task.priority as "low" | "medium" | "high"}>
                      {task.priority}
                    </Badge>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </MotionDiv>
              ))}
            </div>
            <Separator />
            <Button variant="outline" className="w-full group">
              View All Tasks
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle asHeading className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {upcomingDeadlines.map((deadline, index) => (
                <MotionDiv
                  key={index}
                  className="flex items-center justify-between p-3 border border-border rounded-md hover:bg-muted transition-colors group cursor-pointer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-1">
                        <Calendar className="w-4 h-4 text-orange-600" />
                      </div>
                      <span className="text-xs font-bold text-orange-600">
                        {deadline.daysLeft}d
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {deadline.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Due in {deadline.daysLeft} day
                        {deadline.daysLeft !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={deadline.priority as "low" | "medium" | "high"}
                    >
                      {deadline.priority}
                    </Badge>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </MotionDiv>
              ))}
            </div>
            <Separator />
            <Button variant="outline" className="w-full group">
              View Calendar
              <Calendar className="w-4 h-4 ml-2 transition-transform group-hover:scale-110" />
            </Button>
          </CardContent>
        </Card>
      </MotionDiv>

      {/* Quick Actions */}
      <MotionDiv variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle asHeading className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="h-auto py-4 flex-col gap-2 group">
                <Plus className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span>New Task</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 group"
              >
                <FolderPlus className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span>New Project</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 group"
              >
                <Users className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span>Team</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 group"
              >
                <BarChart3 className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span>Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </MotionDiv>
    </MotionDiv>
  );
}
