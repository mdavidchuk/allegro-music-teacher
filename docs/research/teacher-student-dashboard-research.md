# Teacher-Student Dashboard Research
_Conducted 2026-05-22. Focus: solo music teacher managing ~16 students (mostly minors). Excludes schools, content marketplaces, billing, scheduling integrations._

---

## Tools Researched

- **My Music Staff** — mymusicstaff.com — most widely used studio management tool; strong attendance + lesson notes; parent email-out
- **Tonara** — tonara.com — shut down; was best for multimedia assignments + AI-graded practice recording comparison
- **Better Practice** — betterpracticeapp.com — best for spaced repetition assignment prioritization; 23,000+ pre-entered assignments from method books
- **Music Teacher's Helper** — musicteachershelper.com — older tool; billing + scheduling focus
- **MusicTeacherNotes** — musicteachernotes.com — practice tracking + parent visibility; Music Bucks gamification
- **TutorBird** — tutorbird.com — general tutoring; student portal + lesson notes
- **Opus1** — opus1.io — family engagement analytics; learning management
- **Duet** — duetpartner.com — general studio management

## Primary Sources (Teacher Community)

- Color In My Piano — colorinmypiano.com (Joy Morin — also uses Notion for studio management)
- Piano Pantry — pianopantry.com (master spreadsheet approach)
- Colourful Keys — colourfulkeys.ie (tool reviews + 30-day challenge)
- Ashley Danyew — ashleydanyew.com (lesson planning process)
- Leila Viss — leilaviss.com (Tonara review)
- TopMusic.co — topmusic.co (Tonara workflow)
- ComposeCreate — composecreate.com (progress tracking)
- Listen & Learn Music — listenlearnmusic.com (parent communication)
- Jennifer Melton Piano — blog.jennifermeltonpiano.com (lesson notes email template)
- The Playful Piano — theplayfulpiano.com (student notes printables)

## Review Sources

- Capterra My Music Staff reviews — capterra.com/p/148451/My-Music-Staff/reviews/

---

## Universal Features (Every Good Tool Has These)

- Student profiles with contact info and lesson schedule
- Attendance tracking integrated into calendar
- Lesson notes (basic text) attached to lesson records
- Parent portal or email-out of lesson notes
- Repertoire tracking (pieces currently studying)
- Practice time logging (student-facing, manual)

---

## What Teachers Actually Track Per Student

### Universal fields
- Full name, age, guardian contact info
- Lesson day/time slot
- Start date / tenure (teachers value seeing "3 years, 2 months")
- Current level / proficiency
- Current method books and page progress
- Upcoming / planned repertoire
- Active technique focus areas (scales, arpeggios, specific keys)

### Commonly tracked but poorly supported by tools
- Student's stated goals (from intake)
- Learning style / personality notes (teachers keep these mentally — no tool formalizes them)
- Previous teachers or musical background
- Instrument details (type, quality, rental vs. owned, instrument problems)
- Exam / recital history
- Accomplishments log (completed pieces, milestones, certificates)
- Behavioral / motivational observations (private)
- Number of lessons completed (semester count)

---

## Lesson Logging

### Fields teachers actually log per lesson
- Date + attendance (present / absent / makeup)
- Technique / warm-up covered
- Repertoire worked (piece, book, pages) + notes per piece
- Sight-reading activity
- Theory / ear training work
- Specific instruction given
- Goals for next lesson
- Private teacher observation (not parent-visible)
- Parent-visible summary

### Realistic capture workflow
- Brief notes during lesson
- 5–10 min write-up after each student, before the next one
- Weekly assignment sheet sent to parent

### Views that matter
- Per-student chronological lesson history
- "Previous lesson" visible while writing the current entry — critical, often missing
- Studio-wide attendance grid

---

## Progress Tracking

### Six dimensions teachers track (poorly visualized in all tools)
1. **Repertoire progression** — in progress / completed / queued with piece-level notes
2. **Technical skills** — which scales, keys, arpeggios introduced and mastered
3. **Theory / ear training milestones** — concepts introduced vs. mastered
4. **Sight-reading ability** — rarely tracked systematically in any tool
5. **Practice consistency** — days / minutes (tracked in practice apps, not lesson tools)
6. **Exam / performance history** — stored but never visualized

---

## Dashboard / Overview

### What teachers want at a glance (weekly)
- Today's lesson schedule in order
- Outstanding makeup lessons / absences
- Students with a flag from the previous lesson
- Upcoming milestones (recital, exams)

### What's missing from all tools
- Studio health view (students at risk: low practice, stagnating, inactive)
- Genuine pre-lesson brief (last notes + current repertoire + flags in < 30 seconds)
- Progress trajectory across students at similar levels

---

## Parent Communication

### What works
- Structured post-lesson email with piece-level notes (not generic)
- Sent immediately after each session
- Parents who engage produce students who practice more

### What's missing
- Threaded message history per family
- Parent engagement signal (did they read the note?)
- Quick-reply that feels like messaging, not formal email

### Safety pattern for minors
- All communication routes through the guardian/parent account
- Student has separate limited login (13–17) or no account (under 13)
- No direct teacher ↔ minor messaging in unmonitored channel

---

## Practice Assignments

### Three models
1. **Time-based** — total minutes per day (simple, doesn't capture what was practiced)
2. **Completion-based** — student marks done (easy, no quality signal)
3. **Activity-based** — per-piece practice with quality rating (most useful, highest friction)

### What teachers actually want
- To know the student practiced the *specific things* assigned, not just total time
- Low-friction mobile for students (two taps max — minors won't use complex UX)
- Parent visibility for accountability
- Practice patterns by student across the studio

---

## UX Patterns That Work

- **Student list in lesson-time order** (Mon 3pm, Mon 3:30pm...) — matches teacher mental model
- **Tenure displayed** ("Sarah — 2.5 yrs") — consistently valued, small detail
- **Structured lesson note sections** (Technique / Repertoire / Theory / Private / Summary) — not blank textarea
- **Previous lesson panel** visible while writing current entry
- **Private vs. parent-visible notes** clearly separated but on the same screen
- **One-click send to parent** from within the lesson view
- **Repertoire as first-class** — composer, difficulty, status, not just text

---

## Gaps Across All Existing Tools

1. **No pre-lesson brief** — teachers still manually flip to previous notes before each student
2. **Progress trajectory not visualized** — years of notes but no skill curve or piece history timeline
3. **Practice quality not captured** — time or completion, not whether the hard passage was drilled
4. **No learning style / student persona field** — teachers maintain these mentally, no tool structures them
5. **No parent engagement signal** — no feedback loop on whether parent read/engaged with notes
6. **5-minute gap between students not optimized** — ideal flow (attendance → quick notes → send to parent → see next student context) should take 3–4 minutes; no tool achieves this
7. **No long-term student narrative** — a log is not a story; teachers who track students for 5+ years want a readable arc, not just entries

---

## ⏸ Deferred Items (Out of Scope Now — Revisit Later)

_Reminder: bring these up periodically so they aren't forgotten._

- **Practice tracking** (student-facing app, timer, completion logging) — Layer 2
- **Parent / guardian portal** (login, view lesson notes) — Layer 2
- **In-app messaging** (teacher ↔ parent) — Layer 2
- **Gamification** (streaks, stickers, Music Bucks, leaderboards) — Layer 2/3
- **Pre-built assignment libraries** from method books (Better Practice model) — Layer 2
- **AI-graded practice recording comparison** (Tonara model) — Layer 3
- **Multimedia assignments** (teacher video/audio attached to assignments) — Layer 2/3
- **Progress trajectory visualization** (skill curves, piece history timeline) — Layer 2
- **Studio health view** (at-risk student signals across the studio) — Layer 2
- **Parent engagement signals** (did they read the note?) — Layer 2
- **Exam / recital history and performance tracking** — Layer 2
- **Sibling / family grouping** — Layer 2
- **Student login** (13–17 limited view) — Layer 2
