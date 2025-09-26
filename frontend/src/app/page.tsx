"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Users,
  Calendar,
  BarChart,
} from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-chalk-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-chalk-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-chalk-bg">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-chalk-bg sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-serif text-chalk-text sm:text-5xl md:text-6xl">
                  <span className="block">Organize your work</span>
                  <span className="block text-chalk-primary-600 chalk-underline pb-2">
                    the smart way
                  </span>
                </h1>
                <p className="mt-3 text-base text-chalk-text-2 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  TaskFlow helps you manage projects, track tasks, and
                  collaborate with your team efficiently. Stay organized, meet
                  deadlines, and achieve your goals.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="bg-chalk-primary-600 text-white hover:bg-chalk-primary-700"
                  >
                    <Link href="/login">
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-chalk-border text-chalk-text hover:bg-chalk-hover"
                  >
                    <Link href="/about">Learn More</Link>
                  </Button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-chalk-panel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-chalk-primary-600 font-semibold tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-serif font-bold tracking-tight text-chalk-text sm:text-4xl">
              Everything you need to stay productive
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-chalk-primary-500 text-white">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-chalk-text">
                  Task Management
                </p>
                <p className="mt-2 ml-16 text-base text-chalk-text-2">
                  Create, organize, and track tasks with deadlines, priorities,
                  and status updates.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-chalk-primary-500 text-white">
                  <Users className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-chalk-text">
                  Team Collaboration
                </p>
                <p className="mt-2 ml-16 text-base text-chalk-text-2">
                  Work together with your team members, assign tasks, and share
                  project updates.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-chalk-primary-500 text-white">
                  <Calendar className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-chalk-text">
                  Project Planning
                </p>
                <p className="mt-2 ml-16 text-base text-chalk-text-2">
                  Plan your projects with timelines, milestones, and resource
                  allocation.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-chalk-primary-500 text-white">
                  <BarChart className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-chalk-text">
                  Progress Tracking
                </p>
                <p className="mt-2 ml-16 text-base text-chalk-text-2">
                  Monitor progress with visual dashboards, reports, and
                  analytics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-chalk-bg">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-chalk-text sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-chalk-primary-600">
              Join TaskFlow today.
            </span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-chalk-text-2">
            Start organizing your work and boost your productivity with
            TaskFlow.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-chalk-primary-600 text-white hover:bg-chalk-primary-700"
          >
            <Link href="/login">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
