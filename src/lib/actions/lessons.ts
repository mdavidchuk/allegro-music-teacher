"use server";

import { db } from "@/db";
import { lessons, enrollments, users, teachers } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, desc, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function getTeacherId() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
    with: { teacher: true },
  });
  if (!user?.teacher) throw new Error("Teacher profile not found");
  return user.teacher.id;
}

export async function getLessonsForTeacher(limit = 20) {
  const teacherId = await getTeacherId();
  return db.query.lessons.findMany({
    where: eq(lessons.teacherId, teacherId),
    with: { student: true, enrollment: true },
    orderBy: desc(lessons.scheduledAt),
    limit,
  });
}

export async function getUpcomingLessons() {
  const teacherId = await getTeacherId();
  return db.query.lessons.findMany({
    where: and(
      eq(lessons.teacherId, teacherId),
      eq(lessons.status, "scheduled"),
      gte(lessons.scheduledAt, new Date())
    ),
    with: { student: true },
    orderBy: lessons.scheduledAt,
    limit: 10,
  });
}

export type LogLessonInput = {
  studentId: string;
  enrollmentId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: "completed" | "cancelled" | "no_show";
  privateNotes?: string;
  summary?: string;
  isSummaryShared?: boolean;
};

export async function logLesson(input: LogLessonInput) {
  const teacherId = await getTeacherId();

  const [lesson] = await db.insert(lessons).values({
    enrollmentId: input.enrollmentId,
    teacherId,
    studentId: input.studentId,
    scheduledAt: new Date(input.scheduledAt),
    durationMinutes: input.durationMinutes,
    status: input.status,
    privateNotes: input.privateNotes ?? null,
    summary: input.summary ?? null,
    isSummaryShared: input.isSummaryShared ?? false,
  }).returning();

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/students/${input.studentId}`);
  return lesson;
}
