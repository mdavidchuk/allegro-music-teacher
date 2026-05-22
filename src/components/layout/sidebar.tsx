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
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/students", label: "Students", icon: Users },
  { href: "/dashboard/lessons", label: "Lessons", icon: Calendar },
  { href: "/dashboard/progress", label: "Progress", icon: ClipboardList },
  { href: "/dashboard/assignments", label: "Assignments", icon: BookOpen },
  { href: "/dashboard/organizations", label: "Organizations", icon: Building2 },
  { href: "/dashboard/content", label: "Content", icon: Music },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r bg-white flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b">
        <span className="font-semibold text-lg tracking-tight">Allegro</span>
        <p className="text-xs text-muted-foreground mt-0.5">Teacher Studio</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
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

      <div className="p-4 border-t flex items-center gap-3">
        <UserButton />
        <span className="text-sm text-muted-foreground">Account</span>
      </div>
    </aside>
  );
}
