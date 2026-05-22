import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, enrollments, lessons, progressNotes, assignments } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Shield } from "lucide-react";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: studentId } = await params;
  const { userId } = await auth();
  if (!userId) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
    with: { teacher: true },
  });
  if (!user?.teacher) return null;

  const enrollment = await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.teacherId, user.teacher.id),
      eq(enrollments.studentId, studentId)
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

  if (!enrollment) notFound();

  const { student } = enrollment;

  const [recentLessons, progressNotesList, assignmentsList] = await Promise.all([
    db.query.lessons.findMany({
      where: and(eq(lessons.teacherId, user.teacher.id), eq(lessons.studentId, studentId)),
      orderBy: desc(lessons.scheduledAt),
      limit: 10,
    }),
    db.query.progressNotes.findMany({
      where: and(eq(progressNotes.teacherId, user.teacher.id), eq(progressNotes.studentId, studentId)),
      orderBy: desc(progressNotes.createdAt),
    }),
    db.query.assignments.findMany({
      where: and(eq(assignments.teacherId, user.teacher.id), eq(assignments.studentId, studentId)),
      orderBy: desc(assignments.createdAt),
    }),
  ]);

  const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/dashboard/students" className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground">
        <ArrowLeft className="w-3 h-3" /> Students
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4">
        <Avatar className="w-14 h-14">
          <AvatarFallback className="text-lg bg-stone-100">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-semibold">
              {student.firstName} {student.lastName}
            </h1>
            {student.isMinor && <Badge variant="outline">Minor</Badge>}
            {student.under13 && <Badge variant="destructive" className="text-xs">Under 13</Badge>}
            <Badge variant="secondary" className="capitalize">{student.skillLevel ?? "Level unknown"}</Badge>
          </div>
          <div className="flex gap-2 flex-wrap mt-1">
            {(student.instruments ?? []).map((inst) => (
              <span key={inst} className="text-sm text-muted-foreground capitalize">{inst}</span>
            ))}
          </div>
          {student.goals && (
            <p className="text-sm text-muted-foreground mt-1">{student.goals}</p>
          )}
        </div>
      </div>

      {/* Guardian info */}
      {student.guardianLinks && student.guardianLinks.length > 0 && (
        <Card className="bg-amber-50 border-amber-100">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-900">Guardian Contact</span>
            </div>
            {(student.guardianLinks as Array<{
              guardian: { id: string; relationship: string | null; user: { firstName: string; lastName: string; email: string; phone: string | null } };
              consentStatus: string | null;
            }>).map(({ guardian, consentStatus }) => (
              <div key={guardian.id} className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {guardian.user.firstName} {guardian.user.lastName}
                    <span className="text-muted-foreground font-normal ml-2 capitalize">
                      ({guardian.relationship})
                    </span>
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    {guardian.user.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {guardian.user.email}
                      </span>
                    )}
                    {guardian.user.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {guardian.user.phone}
                      </span>
                    )}
                  </div>
                </div>
                <Badge
                  variant={consentStatus === "granted" ? "secondary" : "outline"}
                  className="text-xs capitalize"
                >
                  Consent: {consentStatus ?? "pending"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Private notes */}
      {student.accessibilityNotes && (
        <Card className="border-dashed">
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Accessibility / Medical (Private)
            </p>
            <p className="text-sm">{student.accessibilityNotes}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="lessons">
        <TabsList>
          <TabsTrigger value="lessons">Lessons ({recentLessons.length})</TabsTrigger>
          <TabsTrigger value="progress">Progress ({progressNotesList.length})</TabsTrigger>
          <TabsTrigger value="assignments">Assignments ({assignmentsList.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons" className="mt-4 space-y-3">
          {recentLessons.length === 0 ? (
            <p className="text-sm text-muted-foreground">No lessons logged yet.</p>
          ) : (
            recentLessons.map((lesson) => (
              <Card key={lesson.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {format(lesson.scheduledAt, "EEEE, MMMM d, yyyy · h:mm a")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {lesson.durationMinutes} min
                      </p>
                    </div>
                    <Badge
                      variant={lesson.status === "completed" ? "secondary" : "outline"}
                      className="capitalize text-xs"
                    >
                      {lesson.status}
                    </Badge>
                  </div>
                  {lesson.privateNotes && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Private Notes</p>
                      <p className="text-sm whitespace-pre-wrap">{lesson.privateNotes}</p>
                    </div>
                  )}
                  {lesson.summary && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                        Summary
                        {lesson.isSummaryShared && <Badge variant="outline" className="text-xs">Shared with guardian</Badge>}
                      </p>
                      <p className="text-sm">{lesson.summary}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="progress" className="mt-4 space-y-3">
          {progressNotesList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No progress notes yet.</p>
          ) : (
            progressNotesList.map((note) => (
              <Card key={note.id}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {format(new Date(note.periodStart), "MMM d")} – {format(new Date(note.periodEnd), "MMM d, yyyy")}
                    </p>
                    {note.isSharedWithGuardian && (
                      <Badge variant="outline" className="text-xs">Shared</Badge>
                    )}
                  </div>
                  {note.currentRepertoire && note.currentRepertoire.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Current Repertoire</p>
                      <div className="flex gap-1 flex-wrap">
                        {note.currentRepertoire.map((piece) => (
                          <Badge key={piece} variant="secondary" className="text-xs">{piece}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {note.overallAssessment && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Assessment</p>
                      <p className="text-sm">{note.overallAssessment}</p>
                    </div>
                  )}
                  {note.goalsNextPeriod && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Goals Next Period</p>
                      <p className="text-sm">{note.goalsNextPeriod}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="assignments" className="mt-4 space-y-3">
          {assignmentsList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assignments yet.</p>
          ) : (
            assignmentsList.map((assignment) => (
              <Card key={assignment.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{assignment.title}</p>
                      {assignment.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">{assignment.description}</p>
                      )}
                      {assignment.targetDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Due: {format(new Date(assignment.targetDate), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                    <Badge variant={assignment.isCompleted ? "secondary" : "outline"} className="text-xs">
                      {assignment.isCompleted ? "Done" : "Pending"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
