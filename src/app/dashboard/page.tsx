import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, enrollments, lessons } from "@/db/schema";
import { eq, and, count, gte, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, BookOpen, TrendingUp } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

async function getDashboardStats(teacherId: string) {
  const [activeStudents] = await db
    .select({ count: count() })
    .from(enrollments)
    .where(and(eq(enrollments.teacherId, teacherId), eq(enrollments.status, "active")));

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [recentLessons] = await db
    .select({ count: count() })
    .from(lessons)
    .where(and(eq(lessons.teacherId, teacherId), gte(lessons.scheduledAt, thirtyDaysAgo)));

  const upcomingLessons = await db.query.lessons.findMany({
    where: and(
      eq(lessons.teacherId, teacherId),
      eq(lessons.status, "scheduled"),
      gte(lessons.scheduledAt, new Date())
    ),
    with: { student: true },
    orderBy: lessons.scheduledAt,
    limit: 5,
  });

  const recentActivity = await db.query.lessons.findMany({
    where: and(eq(lessons.teacherId, teacherId), eq(lessons.status, "completed")),
    with: { student: true },
    orderBy: desc(lessons.scheduledAt),
    limit: 5,
  });

  return {
    activeStudentCount: activeStudents?.count ?? 0,
    recentLessonCount: recentLessons?.count ?? 0,
    upcomingLessons,
    recentActivity,
  };
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
    with: { teacher: true },
  });

  if (!user?.teacher) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold mb-2">Welcome to Allegro</h1>
        <p className="text-muted-foreground mb-6">
          Complete your teacher profile to get started.
        </p>
        <Link href="/onboarding" className="underline text-sm">Set up your profile →</Link>
      </div>
    );
  }

  const stats = await getDashboardStats(user.teacher.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Good morning, {user.firstName}</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Here's your studio at a glance.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Active Students"
          value={stats.activeStudentCount}
          icon={<Users className="w-4 h-4" />}
          href="/dashboard/students"
        />
        <StatCard
          label="Lessons (30 days)"
          value={stats.recentLessonCount}
          icon={<Calendar className="w-4 h-4" />}
          href="/dashboard/lessons"
        />
        <StatCard
          label="Upcoming"
          value={stats.upcomingLessons.length}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <StatCard
          label="Due Assignments"
          value={0}
          icon={<BookOpen className="w-4 h-4" />}
          href="/dashboard/assignments"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Upcoming lessons */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Upcoming Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.upcomingLessons.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming lessons scheduled.</p>
            ) : (
              <ul className="space-y-3">
                {stats.upcomingLessons.map((lesson) => (
                  <li key={lesson.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {lesson.student.firstName} {lesson.student.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(lesson.scheduledAt, "EEE, MMM d · h:mm a")}
                      </p>
                    </div>
                    <Badge variant="outline">{lesson.durationMinutes} min</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No lessons logged yet.</p>
            ) : (
              <ul className="space-y-3">
                {stats.recentActivity.map((lesson) => (
                  <li key={lesson.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {lesson.student.firstName} {lesson.student.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(lesson.scheduledAt, "EEE, MMM d · h:mm a")}
                      </p>
                    </div>
                    <Badge variant="secondary">Completed</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  href,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  href?: string;
}) {
  const inner = (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-muted-foreground">{icon}</span>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}
