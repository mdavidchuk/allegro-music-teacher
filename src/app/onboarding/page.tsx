"use client";

import { useState } from "react";
import { completeTeacherOnboarding } from "@/lib/actions/onboarding";
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
import { Badge } from "@/components/ui/badge";
import { Music, X } from "lucide-react";

const COMMON_INSTRUMENTS = [
  "Piano", "Guitar", "Violin", "Voice", "Cello", "Flute",
  "Clarinet", "Trumpet", "Drums", "Bass Guitar", "Viola", "Saxophone",
];

export default function OnboardingPage() {
  const [instruments, setInstruments] = useState<string[]>([]);
  const [customInstrument, setCustomInstrument] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function addInstrument(inst: string) {
    if (inst && !instruments.includes(inst)) {
      setInstruments((prev) => [...prev, inst]);
    }
  }

  function removeInstrument(inst: string) {
    setInstruments((prev) => prev.filter((i) => i !== inst));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const form = new FormData(e.currentTarget);

    await completeTeacherOnboarding({
      instruments,
      bio: form.get("bio") as string || undefined,
      yearsExperience: parseInt(form.get("yearsExperience") as string) || undefined,
      defaultLessonDurationMinutes: parseInt(form.get("lessonDuration") as string) || 30,
    });
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-stone-900 rounded-xl mb-4">
            <Music className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold">Set up your studio</h1>
          <p className="text-muted-foreground text-sm mt-1">
            This takes about 2 minutes. You can update everything later.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 space-y-5">
          <div className="space-y-2">
            <Label>What do you teach? *</Label>
            <div className="flex gap-2 flex-wrap">
              {COMMON_INSTRUMENTS.map((inst) => (
                <button
                  key={inst}
                  type="button"
                  onClick={() =>
                    instruments.includes(inst) ? removeInstrument(inst) : addInstrument(inst)
                  }
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    instruments.includes(inst)
                      ? "bg-stone-900 text-white border-stone-900"
                      : "border-stone-200 hover:border-stone-400"
                  }`}
                >
                  {inst}
                </button>
              ))}
            </div>

            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Other instrument..."
                value={customInstrument}
                onChange={(e) => setCustomInstrument(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addInstrument(customInstrument);
                    setCustomInstrument("");
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => { addInstrument(customInstrument); setCustomInstrument(""); }}
              >
                Add
              </Button>
            </div>

            {instruments.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mt-2">
                {instruments.map((inst) => (
                  <Badge key={inst} variant="secondary" className="gap-1">
                    {inst}
                    <button type="button" onClick={() => removeInstrument(inst)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="yearsExperience">Years of teaching experience</Label>
            <Input id="yearsExperience" name="yearsExperience" type="number" min="0" max="60" placeholder="e.g. 5" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lessonDuration">Default lesson length</Label>
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

          <div className="space-y-1.5">
            <Label htmlFor="bio">Short bio <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea
              id="bio"
              name="bio"
              rows={3}
              placeholder="Tell students and parents a bit about your background..."
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || instruments.length === 0}
          >
            {isSubmitting ? "Setting up your studio..." : "Go to my dashboard →"}
          </Button>
        </form>
      </div>
    </div>
  );
}
