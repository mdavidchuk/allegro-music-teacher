import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  uuid,
  jsonb,
  date,
  decimal,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const orgTypeEnum = pgEnum("org_type", [
  "music_school",
  "community_center",
  "municipality",
  "private_studio",
  "university",
  "other",
]);

export const teacherOrgRoleEnum = pgEnum("teacher_org_role", [
  "employee",
  "contractor",
  "volunteer",
  "owner",
]);

export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "active",
  "paused",
  "completed",
  "transferred",
  "waitlist",
]);

export const lessonStatusEnum = pgEnum("lesson_status", [
  "scheduled",
  "completed",
  "cancelled",
  "makeup",
  "no_show",
]);

export const userRoleEnum = pgEnum("user_role", [
  "platform_admin",
  "org_admin",
  "teacher",
  "guardian",
  "student",
]);

export const consentStatusEnum = pgEnum("consent_status", [
  "pending",
  "granted",
  "revoked",
]);

export const contentTypeEnum = pgEnum("content_type", [
  "sheet_music",
  "lesson_plan",
  "video",
  "audio",
  "document",
  "merch",
]);

export const contentVisibilityEnum = pgEnum("content_visibility", [
  "private",
  "org_only",
  "public_free",
  "public_paid",
]);

// ─── Users ───────────────────────────────────────────────────────────────────

// All human actors share one users table. Role determines capabilities.
// clerk_id links to Clerk's identity system (auth provider).
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  timezone: text("timezone").default("America/Los_Angeles"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// A user can have multiple roles (e.g. teacher who is also a guardian)
export const userRoles = pgTable("user_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: userRoleEnum("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Organizations ───────────────────────────────────────────────────────────

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  type: orgTypeEnum("type").notNull(),
  // For municipalities, this stores the contracting entity name
  legalName: text("legal_name"),
  website: text("website"),
  phone: text("phone"),
  email: text("email"),
  addressLine1: text("address_line_1"),
  addressLine2: text("address_line_2"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  country: text("country").default("US"),
  // Aggregate-only reporting allowed for org admins without PII access
  allowsAggregateReporting: boolean("allows_aggregate_reporting").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Teacher ↔ Organization affiliation
export const teacherOrganizations = pgTable("teacher_organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  teacherId: uuid("teacher_id").notNull().references(() => teachers.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  role: teacherOrgRoleEnum("role").notNull().default("employee"),
  title: text("title"), // e.g. "Piano Instructor"
  startDate: date("start_date"),
  endDate: date("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Teachers ────────────────────────────────────────────────────────────────

export const teachers = pgTable("teachers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  bio: text("bio"),
  instruments: text("instruments").array(), // ["piano", "voice"]
  yearsExperience: integer("years_experience"),
  certifications: text("certifications").array(),
  // Default lesson settings (can be overridden per enrollment)
  defaultLessonDurationMinutes: integer("default_lesson_duration_minutes").default(30),
  defaultLessonRateCents: integer("default_lesson_rate_cents"), // stored in cents
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Students ────────────────────────────────────────────────────────────────

export const students = pgTable("students", {
  id: uuid("id").defaultRandom().primaryKey(),
  // userId is null for minors under 13 who have no direct account
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: date("date_of_birth"),
  // isMinor computed at query time from DOB; stored for quick filtering
  isMinor: boolean("is_minor").notNull().default(false),
  // under13: no direct account, all comms via guardian
  under13: boolean("under_13").notNull().default(false),
  instruments: text("instruments").array(),
  skillLevel: text("skill_level"), // beginner, intermediate, advanced
  goals: text("goals"),
  // Sensitive: teacher-visible only, never shared with org
  accessibilityNotes: text("accessibility_notes"),
  medicalNotes: text("medical_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Guardians ───────────────────────────────────────────────────────────────

export const guardians = pgTable("guardians", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  relationship: text("relationship"), // "parent", "legal guardian", "grandparent", etc.
  isPrimaryContact: boolean("is_primary_contact").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Guardian ↔ Student link (a guardian can have multiple children; a student can have multiple guardians)
export const guardianStudents = pgTable("guardian_students", {
  id: uuid("id").defaultRandom().primaryKey(),
  guardianId: uuid("guardian_id").notNull().references(() => guardians.id, { onDelete: "cascade" }),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  // Whether this guardian has consented to the platform terms for this student
  consentStatus: consentStatusEnum("consent_status").default("pending"),
  consentGrantedAt: timestamp("consent_granted_at"),
  consentGrantedIp: text("consent_granted_ip"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Enrollments ─────────────────────────────────────────────────────────────

// The core relationship: Student ↔ Teacher ↔ Organization
export const enrollments = pgTable("enrollments", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull().references(() => students.id),
  teacherId: uuid("teacher_id").notNull().references(() => teachers.id),
  // Optional: which org context this enrollment is under
  organizationId: uuid("organization_id").references(() => organizations.id),
  status: enrollmentStatusEnum("status").notNull().default("active"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  lessonDurationMinutes: integer("lesson_duration_minutes").default(30),
  lessonRateCents: integer("lesson_rate_cents"),
  // Recurring schedule: e.g. "weekly on Tuesday at 4pm"
  scheduleJson: jsonb("schedule_json"), // { dayOfWeek, hour, minute, tz }
  // When a student transfers, transferredFromEnrollmentId links the history
  transferredFromEnrollmentId: uuid("transferred_from_enrollment_id"),
  // Whether the new teacher can see prior lesson history
  historyAccessGranted: boolean("history_access_granted").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("enrollments_student_idx").on(t.studentId),
  index("enrollments_teacher_idx").on(t.teacherId),
]);

// ─── Lessons ─────────────────────────────────────────────────────────────────

export const lessons = pgTable("lessons", {
  id: uuid("id").defaultRandom().primaryKey(),
  enrollmentId: uuid("enrollment_id").notNull().references(() => enrollments.id),
  teacherId: uuid("teacher_id").notNull().references(() => teachers.id),
  studentId: uuid("student_id").notNull().references(() => students.id),
  scheduledAt: timestamp("scheduled_at").notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(30),
  status: lessonStatusEnum("status").notNull().default("scheduled"),
  // Private notes: teacher-only
  privateNotes: text("private_notes"),
  // Summary: shareable with guardian/student (teacher controls)
  summary: text("summary"),
  isSummaryShared: boolean("is_summary_shared").default(false),
  cancelReason: text("cancel_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("lessons_teacher_idx").on(t.teacherId),
  index("lessons_student_idx").on(t.studentId),
  index("lessons_scheduled_idx").on(t.scheduledAt),
]);

// ─── Progress Notes ───────────────────────────────────────────────────────────

export const progressNotes = pgTable("progress_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull().references(() => students.id),
  teacherId: uuid("teacher_id").notNull().references(() => teachers.id),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  // Current pieces being worked on
  currentRepertoire: text("current_repertoire").array(),
  // Skills being developed
  skillsInProgress: text("skills_in_progress").array(),
  overallAssessment: text("overall_assessment"),
  goalsNextPeriod: text("goals_next_period"),
  isSharedWithGuardian: boolean("is_shared_with_guardian").default(false),
  isSharedWithStudent: boolean("is_shared_with_student").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Assignments ──────────────────────────────────────────────────────────────

export const assignments = pgTable("assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  lessonId: uuid("lesson_id").references(() => lessons.id),
  studentId: uuid("student_id").notNull().references(() => students.id),
  teacherId: uuid("teacher_id").notNull().references(() => teachers.id),
  title: text("title").notNull(),
  description: text("description"),
  targetDate: date("target_date"),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Content (Layer 3 foundation) ────────────────────────────────────────────

export const content = pgTable("content", {
  id: uuid("id").defaultRandom().primaryKey(),
  teacherId: uuid("teacher_id").references(() => teachers.id),
  organizationId: uuid("organization_id").references(() => organizations.id),
  title: text("title").notNull(),
  description: text("description"),
  type: contentTypeEnum("type").notNull(),
  visibility: contentVisibilityEnum("visibility").notNull().default("private"),
  // Vercel Blob URL for the asset
  assetUrl: text("asset_url"),
  thumbnailUrl: text("thumbnail_url"),
  // Pricing in cents (null = free)
  priceCents: integer("price_cents"),
  // Attribution and licensing
  licenseType: text("license_type"),
  allowsRemix: boolean("allows_remix").default(false),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Consent Log ─────────────────────────────────────────────────────────────

// Immutable audit trail for all consent events (COPPA compliance)
export const consentLog = pgTable("consent_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  consentType: text("consent_type").notNull(), // "terms_of_service", "data_sharing", "minor_enrollment", etc.
  status: consentStatusEnum("status").notNull(),
  details: jsonb("details"), // what was consented to (version, scope)
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  teacher: one(teachers, { fields: [users.id], references: [teachers.userId] }),
  guardian: one(guardians, { fields: [users.id], references: [guardians.userId] }),
  roles: many(userRoles),
}));

export const teachersRelations = relations(teachers, ({ one, many }) => ({
  user: one(users, { fields: [teachers.userId], references: [users.id] }),
  organizationAffiliations: many(teacherOrganizations),
  enrollments: many(enrollments),
  lessons: many(lessons),
  progressNotes: many(progressNotes),
  assignments: many(assignments),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, { fields: [students.userId], references: [users.id] }),
  guardianLinks: many(guardianStudents),
  enrollments: many(enrollments),
  lessons: many(lessons),
  progressNotes: many(progressNotes),
  assignments: many(assignments),
}));

export const guardiansRelations = relations(guardians, ({ one, many }) => ({
  user: one(users, { fields: [guardians.userId], references: [users.id] }),
  studentLinks: many(guardianStudents),
}));

export const guardianStudentsRelations = relations(guardianStudents, ({ one }) => ({
  guardian: one(guardians, { fields: [guardianStudents.guardianId], references: [guardians.id] }),
  student: one(students, { fields: [guardianStudents.studentId], references: [students.id] }),
}));

export const enrollmentsRelations = relations(enrollments, ({ one, many }) => ({
  student: one(students, { fields: [enrollments.studentId], references: [students.id] }),
  teacher: one(teachers, { fields: [enrollments.teacherId], references: [teachers.id] }),
  organization: one(organizations, { fields: [enrollments.organizationId], references: [organizations.id] }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  enrollment: one(enrollments, { fields: [lessons.enrollmentId], references: [enrollments.id] }),
  teacher: one(teachers, { fields: [lessons.teacherId], references: [teachers.id] }),
  student: one(students, { fields: [lessons.studentId], references: [students.id] }),
  assignments: many(assignments),
}));
