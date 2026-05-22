import { Sidebar } from "@/components/layout/sidebar";
import { auth } from "@clerk/nextjs/server";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { ReactNode } from "react";

// Dashboard pages are fully dynamic — they require auth and live DB data
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
    with: { teacher: true },
  });

  const profileComplete = !!user?.teacher;

  // Block direct URL access to sub-routes until profile is complete
  if (!profileComplete) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") ?? headersList.get("x-invoke-path") ?? "";
    const isSubRoute = pathname.startsWith("/dashboard/");
    if (isSubRoute) redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar profileComplete={profileComplete} />
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
