---
date: 2026-05-22
topic: music-teacher-platform
---

# Music Teacher Platform

## Problem Frame

A part-time piano teacher starting at a Seattle community center has no infrastructure: no student records, no progress tracking, no communication system, no curriculum support. The immediate need is a private tool for managing 16 students (mostly minors). The longer-term vision is a productized SaaS platform usable by any music teacher or school — with content sharing, payment, and institutional relationships built in from the start of the architecture.

---

## Product Layers

The platform is designed in three evolutionary layers. Each layer builds on the prior without requiring a rewrite.

### Layer 1 — Solo Teacher Dashboard (MVP)
> "Glorified spreadsheet." One teacher, 16 students, private. The teacher is the only user who logs in.

### Layer 2 — Multi-Teacher, Multi-Org Platform
> Multiple teachers, multiple organizations (schools, community centers, municipalities). Parent/guardian portals. Student self-service for adults. Teacher transfers.

### Layer 3 — Content & Commerce Marketplace
> Teachers and organizations share/sell content (sheet music, lesson plans, videos, merch). Subscription and à la carte purchasing.

---

## Core Entities

### Organization
The umbrella concept covering any institutional affiliation a teacher may have. Includes:
- **Community centers** (e.g. Seattle Parks & Recreation)
- **Music schools / studios**
- **Municipalities / contracting bodies** (e.g. City of Seattle contracting the teacher directly)
- **Private studios** (solo teacher as their own org)

Key behaviors:
- A teacher can be affiliated with one or more organizations simultaneously
- An organization can have one or more teachers
- Organizations have their own admin contacts and may have their own policies
- Organizations may have visibility into aggregate (non-PII) data about their enrolled students
- In the SaaS model, organizations are the B2B billing unit (Layer 2+)
- The City of Seattle model: organization type = `municipality`, relationship to teacher = `contractor` — same data model, different type tag

### Teacher
- Has a profile, credentials, bio
- Affiliated with one or more organizations
- Owns a roster of students (via Enrollment)
- Creates lessons, progress notes, assignments, and content

### Student
- May be a minor (under 18) or adult
- Has a profile: contact info, instrument, skill level, goals, medical/accessibility notes (optional, teacher-visible only)
- Linked to one or more Guardians if minor
- Enrolled with a specific Teacher within an Organization context
- Can transfer to a different teacher (with appropriate consent flows)

### Guardian
- Parent or legal guardian of a minor student
- Has their own account (not shared with the student)
- Receives progress summaries, assignments, and communications
- Provides consent for data sharing and participation
- Is the legal contact point for all minors under 13 (COPPA)

### Enrollment
- The relationship record: Student ↔ Teacher ↔ Organization
- Has a status: active, paused, completed, transferred
- Preserves history when a student changes teachers (old enrollment is closed, new one opened)
- Tracks start date, lesson frequency, lesson duration, rate (optional)

### Lesson
- A single session: date, duration, teacher, student
- Status: scheduled, completed, cancelled, makeup
- Teacher notes (private), summary (shareable with guardian/student)
- Attendance recorded

### Progress Note
- Periodic snapshot of student progress
- Linked to a student, teacher, and date range
- Includes: current repertoire, skills being developed, goals for next period
- Can be shared with guardian (opt-in per note or globally)

### Assignment
- Practice task given to student after a lesson
- Includes: description, materials, target completion date
- Student/guardian can mark complete (Layer 2+)

### Content (Layer 3)
- Assets: sheet music (PDF), lesson plans (structured doc), video, audio, merch
- Owned by teacher or organization
- Visibility: private, org-only, public-free, public-paid
- Licensing and attribution metadata

---

## Requirements

### Layer 1 — MVP

- **R1.** Teacher can create and manage student profiles including: name, age, contact info, guardian info (if minor), instrument, skill level, lesson day/time, and free-form notes.
- **R2.** Teacher can log a completed lesson with date, duration, attendance, and private notes.
- **R3.** Teacher can write progress notes for any student, recording current repertoire and goals.
- **R4.** Teacher can create practice assignments for students.
- **R5.** Teacher dashboard shows all active students with last-lesson date, next-lesson date, and a quick-view of current assignments.
- **R6.** Teacher authenticates via Google SSO or magic-link OTP (no password required).
- **R7.** All data is private to the teacher in Layer 1 — no student/guardian login exists yet.
- **R8.** Teacher can record their organization affiliation(s) — even if the org has no account yet.

### Layer 2 — Multi-Actor Platform

- **R9.** Organizations can create accounts and invite teachers as affiliates.
- **R10.** Multiple teachers can operate under one organization, each with their own private student roster.
- **R11.** Guardian accounts allow parents to view: lesson summaries, progress notes (if shared by teacher), and practice assignments for their child.
- **R12.** Minor students (under 18) can only be added if a guardian record exists with contact info and consent acknowledgment.
- **R13.** Students under 13: all communication routes through guardian — no direct student account.
- **R14.** Students 13–17: optional limited student account (view-only: assignments, shared notes) with guardian consent.
- **R15.** Adult students (18+): full student account with direct login and communication.
- **R16.** Students can be transferred between teachers. Transfer preserves lesson history. New teacher sees history only if prior teacher and student/guardian consent.
- **R17.** Organization admins have aggregate visibility (counts, lesson hours) but not individual student PII without explicit opt-in from teacher and guardian.
- **R18.** All data-sharing is opt-in; defaults are private.
- **R19.** In-app messaging between teacher ↔ guardian (minor students) or teacher ↔ adult student.
- **R20.** Scheduling: teacher sets availability, guardian/student can book within available slots.

### Layer 3 — Content & Commerce

- **R21.** Teachers and organizations can upload content: sheet music, lesson plans, video, audio.
- **R22.** Content can be priced: free, pay-once, or subscription-gated.
- **R23.** Teachers receive a revenue share on paid content sales (platform takes a cut).
- **R24.** Organizations can have a branded content store.
- **R25.** Content licensing: teachers can specify whether content can be re-shared or remixed by other teachers.

---

## Legal & Compliance Requirements

- **LC1.** COPPA compliance: no personal data collected from children under 13 without verifiable parental consent. Guardian is the account holder; child has no direct account.
- **LC2.** Washington State privacy law compliance (My Health MY Data Act context: treat health/wellness data with care; music lesson notes are not health data but accessibility/medical notes field must be treated as sensitive).
- **LC3.** FERPA awareness: if an organization is a public school or school-affiliated, student education records are subject to FERPA. Platform must support data export and deletion on request.
- **LC4.** Terms of Service and Privacy Policy must be presented and accepted at account creation, with minor-specific addendum for guardian accounts.
- **LC5.** All opt-in consent (data sharing, communications) is recorded with timestamp and user identity.
- **LC6.** Right to deletion: any user can request their data be deleted. For minors, guardian makes the request. Teacher-created notes about a student are owned by the teacher; student/guardian can request removal from their view.
- **LC7.** No student photos or identifying media without explicit guardian consent (Layer 2+).
- **LC8.** Communications to/about minors route through guardian accounts only, not directly to the minor.

---

## Auth & Identity

- Social login: Google (primary), Apple (secondary consideration)
- Magic link / OTP via email as fallback (no passwords)
- Role-based access: `platform_admin`, `org_admin`, `teacher`, `guardian`, `student`
- Multi-role: a user can be both a teacher and a guardian (e.g. a music teacher whose child takes lessons from a colleague)
- Session management: standard JWT with refresh, short-lived sessions for guardian/student views

---

## Organization Model (contracting detail)

The City of Seattle scenario works as follows:
- Organization: `{ name: "Seattle Parks & Recreation", type: "municipality", subtype: "community_center" }`
- Teacher affiliation: `{ teacher_id, org_id, role: "contractor", start_date, status: "active" }`
- The org has no visibility into student data by default
- If the org requires aggregate reporting (e.g. "how many students enrolled this quarter"), that is a separate org-level report with no PII
- Future: orgs can pay for the platform tier that gives them teacher management tools (Layer 2 B2B)

---

## Success Criteria

- **Layer 1:** Teacher can onboard all 16 students, log lessons, and write progress notes within one day of setup. No spreadsheet needed.
- **Layer 2:** A second teacher can independently manage their own roster under the same org without seeing the first teacher's data.
- **Layer 3:** A teacher can list a piece of sheet music for $2.99 and a student (or any visitor) can purchase and download it within a single session.

---

## Scope Boundaries

- **Out of scope (Layer 1):** payment tracking, guardian login, scheduling automation, content library
- **Out of scope (all layers):** video conferencing (integrate with Zoom/Google Meet via link, don't build)
- **Out of scope (all layers):** building a social network — this is a professional tool with bounded communication
- **Out of scope (all layers):** AI-generated lesson plans (future consideration, not designed for now)

---

## Key Decisions

- **"Organization" unifies all institutional types:** School, community center, municipality, private studio are all `Organization` records with a `type` field. No separate entity needed.
- **Contracting body = Organization:** City of Seattle is an org with `type: municipality`. Teacher's relationship is `contractor`. Same data model as any other affiliation.
- **Guardian-first for minors:** No direct student account for under-13. Guardian is the user; student is a data record. Ages 13-17 get limited student view with guardian consent.
- **Layer 1 is teacher-only:** No guardian or student login in Layer 1. All data is private to the teacher. This ships fast.
- **History preservation on teacher transfer:** Enrollment records are closed, not deleted. New teacher gets access to history only with dual consent (prior teacher + guardian).
- **No passwords:** Magic link or social SSO only. Reduces support burden and security risk.

---

## Outstanding Questions

### Resolve Before Planning
- (none — requirements are sufficient to begin planning Layer 1)

### Deferred to Planning
- [Affects R6][Needs research] Auth provider selection: Clerk vs. NextAuth vs. Supabase Auth — evaluate based on minor-age gating support and OTP/magic-link maturity.
- [Affects R1][Technical] Database: Postgres (Neon) vs. PlanetScale MySQL — Postgres strongly preferred for JSONB flexibility on notes/metadata fields.
- [Affects R16][Technical] Teacher transfer consent flow: determine whether consent is async (email approval) or synchronous (in-app).
- [Affects LC1][Needs research] COPPA verifiable parental consent: evaluate whether email-based consent is sufficient or if additional verification is needed.
- [Affects R21][Technical] Content storage: Vercel Blob vs. S3-compatible storage for sheet music PDFs and videos.

---

## Next Steps

→ `/ce:plan` for Layer 1 implementation planning
