"use server";

import { db } from "@/db";
import { students, enrollments, guardians, guardianStudents, users, teachers } from "@/db/schema";
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

export async function getStudentsForTeacher() {
  const teacherId = await getTeacherId();

  return db.query.enrollments.findMany({
    where: and(
      eq(enrollments.teacherId, teacherId),
      eq(enrollments.status, "active")
    ),
    with: {
      student: {
        with: {
          guardianLinks: {
            with: { guardian: { with: { user: true } } },
          },
        },
      },
    },
    orderBy: desc(enrollments.createdAt),
  });
}

export async function getStudentDetail(studentId: string) {
  const teacherId = await getTeacherId();

  const enrollment = await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.studentId, studentId),
      eq(enrollments.teacherId, teacherId),
      eq(enrollments.status, "active")
    ),
    with: {
      student: {
        with: {
          guardianLinks: {
            with: { guardian: { with: { user: true } } },
          },
        },
      },
    },
  });

  if (!enrollment) return null;
  return enrollment;
}

export type NewStudentInput = {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  instruments?: string[];
  skillLevel?: string;
  goals?: string;
  accessibilityNotes?: string;
  // Guardian info (required if minor)
  guardianFirstName?: string;
  guardianLastName?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  guardianRelationship?: string;
  // Enrollment
  lessonDurationMinutes?: number;
  scheduleNote?: string;
};

export async function createStudent(input: NewStudentInput) {
  const teacherId = await getTeacherId();

  const dob = input.dateOfBirth ? new Date(input.dateOfBirth) : null;
  const now = new Date();
  const ageMs = dob ? now.getTime() - dob.getTime() : null;
  const ageYears = ageMs ? ageMs / (1000 * 60 * 60 * 24 * 365.25) : null;
  const isMinor = ageYears !== null ? ageYears < 18 : false;
  const under13 = ageYears !== null ? ageYears < 13 : false;

  // Create student record
  const [student] = await db.insert(students).values({
    firstName: input.firstName,
    lastName: input.lastName,
    dateOfBirth: input.dateOfBirth ?? null,
    isMinor,
    under13,
    instruments: input.instruments ?? [],
    skillLevel: input.skillLevel ?? null,
    goals: input.goals ?? null,
    accessibilityNotes: input.accessibilityNotes ?? null,
  }).returning();

  // Create enrollment
  await db.insert(enrollments).values({
    studentId: student.id,
    teacherId,
    status: "active",
    startDate: now.toISOString().split("T")[0],
    lessonDurationMinutes: input.lessonDurationMinutes ?? 30,
    notes: input.scheduleNote ?? null,
  });

  // If guardian info provided, create a placeholder guardian record
  // (Full guardian user account created when guardian accepts invite)
  if (input.guardianEmail) {
    const [guardianUser] = await db.insert(users).values({
      clerkId: `pending_${crypto.randomUUID()}`, // placeholder until they sign up
      email: input.guardianEmail,
      firstName: input.guardianFirstName ?? "",
      lastName: input.guardianLastName ?? "",
      phone: input.guardianPhone ?? null,
    }).returning();

    const [guardian] = await db.insert(guardians).values({
      userId: guardianUser.id,
      relationship: input.guardianRelationship ?? "guardian",
      isPrimaryContact: true,
    }).returning();

    await db.insert(guardianStudents).values({
      guardianId: guardian.id,
      studentId: student.id,
      consentStatus: "pending",
    });
  }

  revalidatePath("/dashboard/students");
  return student;
}
