"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createStudent } from "@/lib/actions/students";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function NewStudentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isMinorDetected, setIsMinorDetected] = useState<boolean | null>(null);

  function handleDobChange(dob: string) {
    if (!dob) { setIsMinorDetected(null); return; }
    const age = (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    setIsMinorDetected(age < 18);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const form = new FormData(e.currentTarget);

    try {
      await createStudent({
        firstName: form.get("firstName") as string,
        lastName: form.get("lastName") as string,
        dateOfBirth: form.get("dateOfBirth") as string || undefined,
        instruments: [(form.get("instrument") as string)].filter(Boolean),
        skillLevel: form.get("skillLevel") as string || undefined,
        goals: form.get("goals") as string || undefined,
        accessibilityNotes: form.get("accessibilityNotes") as string || undefined,
        guardianFirstName: form.get("guardianFirstName") as string || undefined,
        guardianLastName: form.get("guardianLastName") as string || undefined,
        guardianEmail: form.get("guardianEmail") as string || undefined,
        guardianPhone: form.get("guardianPhone") as string || undefined,
        guardianRelationship: form.get("guardianRelationship") as string || undefined,
        lessonDurationMinutes: parseInt(form.get("lessonDuration") as string) || 30,
      });
      router.push("/dashboard/students");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Add Student</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Student profiles are private to you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <Card>
          <CardHeader><CardTitle className="text-base">Student Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First name *</Label>
                <Input id="firstName" name="firstName" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last name *</Label>
                <Input id="lastName" name="lastName" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dateOfBirth">Date of birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                onChange={(e) => handleDobChange(e.target.value)}
              />
              {isMinorDetected === true && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Minor — guardian contact required for enrollment.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="instrument">Primary instrument</Label>
                <Input id="instrument" name="instrument" placeholder="Piano" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="skillLevel">Skill level</Label>
                <Select name="skillLevel">
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="early_intermediate">Early Intermediate</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced_intermediate">Advanced Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="goals">Goals / notes</Label>
              <Textarea id="goals" name="goals" placeholder="What does the student want to achieve?" rows={3} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="accessibilityNotes">
                Accessibility / medical notes
                <span className="ml-1.5 text-xs text-muted-foreground font-normal">(private, teacher-visible only)</span>
              </Label>
              <Textarea id="accessibilityNotes" name="accessibilityNotes" rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Guardian info — shown if minor or always available */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Guardian / Parent Contact
              {isMinorDetected === true && (
                <Badge variant="destructive" className="text-xs font-normal">Required for minors</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              For students under 18, a guardian email is required. They&apos;ll receive an invite to access lesson summaries and progress updates (when you choose to share them).
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="guardianFirstName">Guardian first name</Label>
                <Input id="guardianFirstName" name="guardianFirstName" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="guardianLastName">Guardian last name</Label>
                <Input id="guardianLastName" name="guardianLastName" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="guardianEmail">Guardian email</Label>
                <Input id="guardianEmail" name="guardianEmail" type="email" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="guardianPhone">Guardian phone</Label>
                <Input id="guardianPhone" name="guardianPhone" type="tel" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="guardianRelationship">Relationship</Label>
              <Select name="guardianRelationship">
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="legal_guardian">Legal Guardian</SelectItem>
                  <SelectItem value="grandparent">Grandparent</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lesson settings */}
        <Card>
          <CardHeader><CardTitle className="text-base">Lesson Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="lessonDuration">Default lesson duration</Label>
              <Select name="lessonDuration" defaultValue="30">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Add Student"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/students">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
