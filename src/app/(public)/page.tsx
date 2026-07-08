import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold text-[var(--color-night-navy)] md:text-5xl">
        Meet gamers you&apos;ll actually want to play with again.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-[var(--color-text-slate)]">
        Discover compatible adults across games and platforms, talk without the
        chaos, and build friendships that last beyond one lobby.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/sign-up"
          className="inline-flex min-h-[var(--touch-min)] items-center rounded-[var(--radius-md)] bg-[var(--color-lobby-teal)] px-6 py-3 font-medium text-white"
        >
          Create your free profile
        </Link>
        <Link
          href="/how-it-works"
          className="inline-flex min-h-[var(--touch-min)] items-center rounded-[var(--radius-md)] border border-[var(--color-lobby-teal)] px-6 py-3 font-medium text-[var(--color-lobby-teal)]"
        >
          See how SameLobby works
        </Link>
      </div>
      <p className="mt-4 text-sm text-[var(--color-text-slate)]">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="text-[var(--color-lobby-teal)] underline"
        >
          Sign in
        </Link>
      </p>
      <p className="mt-4 text-sm text-[var(--color-text-slate)]">
        Adults 18+ · Private connections · No swiping · No paid boosts
      </p>
    </main>
  );
}
