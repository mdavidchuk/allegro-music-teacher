import { submitPassword } from "./actions";
import { Music } from "lucide-react";

export default function AccessPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-stone-900 rounded-xl">
          <Music className="w-6 h-6 text-white" />
        </div>

        <div>
          <h1 className="text-xl font-semibold text-stone-900">Allegro</h1>
          <p className="text-sm text-stone-500 mt-1">Private beta — enter the access password</p>
        </div>

        <form action={submitPassword} className="space-y-3">
          <input
            type="password"
            name="password"
            placeholder="Password"
            autoFocus
            required
            className="w-full px-4 py-2.5 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 placeholder:text-stone-400"
          />
          <AccessError searchParams={searchParams} />
          <button
            type="submit"
            className="w-full bg-stone-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-stone-800 transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}

async function AccessError({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  if (!error) return null;
  return (
    <p className="text-sm text-red-600">Incorrect password — try again.</p>
  );
}
