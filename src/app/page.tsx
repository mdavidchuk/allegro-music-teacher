import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Music, Users, Calendar, BookOpen } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <header className="border-b bg-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-stone-700" />
          <span className="font-semibold text-lg tracking-tight">Allegro</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Get started</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center py-24">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-stone-100 text-stone-600 text-sm px-3 py-1 rounded-full">
            <Music className="w-3.5 h-3.5" />
            Built for independent music teachers
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-stone-900">
            Your studio.<br />
            <span className="text-stone-400">Organized.</span>
          </h1>

          <p className="text-lg text-stone-500 max-w-lg mx-auto">
            Track students, log lessons, record progress, and stay connected with
            families — without the spreadsheets.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="/sign-up">Start for free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 max-w-3xl w-full">
          <FeatureCard
            icon={<Users className="w-5 h-5" />}
            title="Student profiles"
            description="Track instrument, skill level, goals, and guardian contacts in one place."
          />
          <FeatureCard
            icon={<Calendar className="w-5 h-5" />}
            title="Lesson logs"
            description="Record every session with private notes and shareable summaries for families."
          />
          <FeatureCard
            icon={<BookOpen className="w-5 h-5" />}
            title="Progress tracking"
            description="Document repertoire, skills, and goals with period-by-period progress notes."
          />
        </div>
      </main>

      <footer className="border-t bg-white px-8 py-4 text-center text-xs text-muted-foreground">
        Allegro · Built for music teachers · Privacy-first design
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white border rounded-xl p-5 text-left">
      <div className="text-stone-500 mb-3">{icon}</div>
      <h3 className="font-medium text-stone-900 mb-1">{title}</h3>
      <p className="text-sm text-stone-500">{description}</p>
    </div>
  );
}
