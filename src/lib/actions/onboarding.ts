"use server";

import { db } from "@/db";
import { users, teachers, userRoles } from "@/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function completeTeacherOnboarding(input: {
  instruments: string[];
  bio?: string;
  yearsExperience?: number;
  defaultLessonDurationMinutes?: number;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("User not found");

  // Upsert the user record
  const existing = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  let dbUser;
  if (!existing) {
    const [created] = await db.insert(users).values({
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      firstName: clerkUser.firstName ?? "",
      lastName: clerkUser.lastName ?? "",
      avatarUrl: clerkUser.imageUrl ?? null,
    }).returning();
    dbUser = created;

    await db.insert(userRoles).values({ userId: created.id, role: "teacher" });
  } else {
    dbUser = existing;
  }

  // Create teacher profile if not exists
  const existingTeacher = await db.query.teachers.findFirst({
    where: eq(teachers.userId, dbUser.id),
  });

  if (!existingTeacher) {
    await db.insert(teachers).values({
      userId: dbUser.id,
      instruments: input.instruments,
      bio: input.bio ?? null,
      yearsExperience: input.yearsExperience ?? null,
      defaultLessonDurationMinutes: input.defaultLessonDurationMinutes ?? 30,
    });
  }

  redirect("/dashboard");
}

// Called from middleware/webhook to sync Clerk user → DB on first sign-in
export async function syncClerkUser() {
  const { userId } = await auth();
  if (!userId) return;

  const existing = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
    with: { teacher: true },
  });

  // If user exists and has teacher profile, go to dashboard
  if (existing?.teacher) redirect("/dashboard");

  // If user exists but no teacher profile, go to onboarding
  if (existing) redirect("/onboarding");

  // Net new user — go to onboarding
  redirect("/onboarding");
}
