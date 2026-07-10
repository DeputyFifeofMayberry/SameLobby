import Link from "next/link";

export function PublicNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-white/90 backdrop-blur-xl">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg"
      >
        Skip to main content
      </a>
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 font-[family-name:var(--font-display)] text-xl font-bold tracking-[-0.03em] text-[var(--color-night-navy)]"
          aria-label="SameLobby home"
        >
          <span className="relative grid h-8 w-8 place-items-center rounded-xl bg-[var(--color-night-navy)] text-white shadow-[var(--shadow-sm)]">
            <span className="absolute top-2 left-2 h-2.5 w-3.5 rounded-sm border border-white/80" />
            <span className="absolute right-2 bottom-2 h-2.5 w-3.5 rounded-sm border border-[#74dbc7] bg-[var(--color-night-navy)]" />
          </span>
          SameLobby
        </Link>
        <nav aria-label="Public" className="flex items-center gap-1 text-sm">
          <div className="mr-2 hidden items-center gap-1 lg:flex">
            <Link
              href="/how-it-works"
              className="rounded-lg px-3 py-2 font-medium text-[var(--color-text-slate)] transition hover:bg-[var(--color-cloud)] hover:text-[var(--color-night-navy)]"
            >
              How it works
            </Link>
            <Link
              href="/safety"
              className="rounded-lg px-3 py-2 font-medium text-[var(--color-text-slate)] transition hover:bg-[var(--color-cloud)] hover:text-[var(--color-night-navy)]"
            >
              Safety
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg px-3 py-2 font-medium text-[var(--color-text-slate)] transition hover:bg-[var(--color-cloud)] hover:text-[var(--color-night-navy)]"
            >
              Pricing
            </Link>
          </div>
          <Link
            href="/sign-in"
            className="rounded-lg px-3 py-2 font-semibold text-[var(--color-lobby-teal)] transition hover:bg-[var(--color-cloud)]"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="hidden min-h-[var(--touch-min)] items-center rounded-xl bg-[var(--color-lobby-teal)] px-4 py-2 font-semibold text-white transition hover:bg-[#085d56] sm:inline-flex"
          >
            Create account
          </Link>
        </nav>
      </div>
    </header>
  );
}
