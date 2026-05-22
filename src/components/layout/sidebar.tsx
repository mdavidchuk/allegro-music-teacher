"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  ClipboardList,
  Building2,
  Music,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, requiresProfile: false },
  { href: "/dashboard/students", label: "Students", icon: Users, requiresProfile: true },
  { href: "/dashboard/lessons", label: "Lessons", icon: Calendar, requiresProfile: true },
  { href: "/dashboard/progress", label: "Progress", icon: ClipboardList, requiresProfile: true },
  { href: "/dashboard/assignments", label: "Assignments", icon: BookOpen, requiresProfile: true },
  { href: "/dashboard/organizations", label: "Organizations", icon: Building2, requiresProfile: true },
  { href: "/dashboard/content", label: "Content", icon: Music, requiresProfile: true },
];

export function Sidebar({ profileComplete }: { profileComplete: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r bg-white flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b">
        <span className="font-semibold text-lg tracking-tight">Allegro</span>
        <p className="text-xs text-muted-foreground mt-0.5">Teacher Studio</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon, requiresProfile }) => {
          const locked = requiresProfile && !profileComplete;
          const active = !locked && (pathname === href || (href !== "/dashboard" && pathname.startsWith(href)));

          if (locked) {
            return (
              <span
                key={href}
                title="Complete your profile to unlock"
                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-stone-300 cursor-not-allowed select-none"
              >
                <Icon className="w-4 h-4" />
                {label}
              </span>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-stone-100 text-stone-900 font-medium"
                  : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {!profileComplete && (
        <div className="mx-3 mb-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
          <p className="text-xs text-amber-800 font-medium mb-1">Profile incomplete</p>
          <p className="text-xs text-amber-700 mb-2">Set up your teacher profile to unlock all features.</p>
          <Link
            href="/onboarding"
            className="text-xs font-medium text-amber-900 underline underline-offset-2"
          >
            Set up profile →
          </Link>
        </div>
      )}

      <div className="p-4 border-t flex items-center gap-3">
        <UserButton />
        <span className="text-sm text-muted-foreground">Account</span>
      </div>
    </aside>
  );
}
