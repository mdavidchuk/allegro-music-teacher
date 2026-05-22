import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, enrollments, students } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Music } from "lucide-react";

export default async function StudentsPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
    with: { teacher: true },
  });
  if (!user?.teacher) return null;

  const activeEnrollments = await db.query.enrollments.findMany({
    where: and(
      eq(enrollments.teacherId, user.teacher.id),
      eq(enrollments.status, "active")
    ),
    with: {
      student: {
        with: {
          guardianLinks: {
            with: { guardian: { with: { user: true } } },
            limit: 1,
          },
        },
      },
    },
    orderBy: desc(enrollments.createdAt),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Students</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeEnrollments.length} active student{activeEnrollments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/students/new">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Student
          </Link>
        </Button>
      </div>

      {activeEnrollments.length === 0 ? (
        <EmptyState />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Instruments</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Guardian</TableHead>
                <TableHead>Lesson</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeEnrollments.map(({ id: enrollmentId, student, lessonDurationMinutes }) => {
                type GuardianLink = { guardian: { user: { firstName: string; lastName: string } } };
                const primaryGuardian = (student.guardianLinks as GuardianLink[] | undefined)?.[0]?.guardian;
                const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();

                return (
                  <TableRow key={enrollmentId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs bg-stone-100">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {student.firstName} {student.lastName}
                          </p>
                          {student.isMinor && (
                            <Badge variant="outline" className="text-xs mt-0.5">Minor</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {(student.instruments ?? []).map((inst) => (
                          <Badge key={inst} variant="secondary" className="text-xs capitalize">{inst}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm capitalize text-muted-foreground">
                        {student.skillLevel ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {primaryGuardian ? (
                        <span className="text-sm">
                          {primaryGuardian.user.firstName} {primaryGuardian.user.lastName}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{lessonDurationMinutes} min</span>
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/students/${student.id}`}>View →</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-white">
      <Music className="w-10 h-10 text-stone-300 mb-4" />
      <h3 className="font-medium text-stone-700">No students yet</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4">
        Add your first student to get started.
      </p>
      <Button asChild>
        <Link href="/dashboard/students/new">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Student
        </Link>
      </Button>
    </div>
  );
}
