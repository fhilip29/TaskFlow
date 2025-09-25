import { ReactNode } from "react";
import { AppShell } from "@/components/app-shell/AppShell";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
