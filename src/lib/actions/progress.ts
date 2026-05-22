"use server";

import { db } from "@/db";
import { progressNotes, assignments, users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, desc } from "drizzle-orm";
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

export async function getProgressNotes(studentId: string) {
  const teacherId = await getTeacherId();
  return db.query.progressNotes.findMany({
    where: and(
      eq(progressNotes.studentId, studentId),
      eq(progressNotes.teacherId, teacherId)
    ),
    orderBy: desc(progressNotes.createdAt),
  });
}

export type NewProgressNoteInput = {
  studentId: string;
  periodStart: string;
  periodEnd: string;
  currentRepertoire?: string[];
  skillsInProgress?: string[];
  overallAssessment?: string;
  goalsNextPeriod?: string;
  isSharedWithGuardian?: boolean;
};

export async function createProgressNote(input: NewProgressNoteInput) {
  const teacherId = await getTeacherId();

  const [note] = await db.insert(progressNotes).values({
    studentId: input.studentId,
    teacherId,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    currentRepertoire: input.currentRepertoire ?? [],
    skillsInProgress: input.skillsInProgress ?? [],
    overallAssessment: input.overallAssessment ?? null,
    goalsNextPeriod: input.goalsNextPeriod ?? null,
    isSharedWithGuardian: input.isSharedWithGuardian ?? false,
  }).returning();

  revalidatePath(`/dashboard/students/${input.studentId}`);
  return note;
}

export async function getAssignments(studentId: string) {
  const teacherId = await getTeacherId();
  return db.query.assignments.findMany({
    where: and(
      eq(assignments.studentId, studentId),
      eq(assignments.teacherId, teacherId)
    ),
    orderBy: desc(assignments.createdAt),
  });
}

export async function createAssignment(input: {
  studentId: string;
  lessonId?: string;
  title: string;
  description?: string;
  targetDate?: string;
}) {
  const teacherId = await getTeacherId();

  const [assignment] = await db.insert(assignments).values({
    studentId: input.studentId,
    teacherId,
    lessonId: input.lessonId ?? null,
    title: input.title,
    description: input.description ?? null,
    targetDate: input.targetDate ?? null,
  }).returning();

  revalidatePath(`/dashboard/students/${input.studentId}`);
  return assignment;
}
