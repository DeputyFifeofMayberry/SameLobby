import Link from "next/link";

export function PublicNav() {
  return (
    <header className="border-b border-[var(--color-border)] bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--color-night-navy)]"
        >
          SameLobby
        </Link>
        <nav aria-label="Public" className="flex items-center gap-3 text-sm">
          <Link href="/how-it-works" className="hidden sm:inline">
            How it works
          </Link>
          <Link href="/safety" className="hidden sm:inline">
            Safety
          </Link>
          <Link
            href="/sign-in"
            className="rounded-[var(--radius-md)] px-3 py-2 font-medium text-[var(--color-lobby-teal)]"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-[var(--radius-md)] bg-[var(--color-lobby-teal)] px-4 py-2 font-medium text-white"
          >
            Create account
          </Link>
        </nav>
      </div>
    </header>
  );
}
