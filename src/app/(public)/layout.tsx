import Link from "next/link";
import { PublicNav } from "@/components/layout/PublicNav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicNav />
      <div id="main-content" tabIndex={-1}>
        {children}
      </div>
      <footer className="border-t border-[var(--color-border)] bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.35fr_0.65fr_0.65fr]">
          <div className="max-w-sm">
            <Link
              href="/"
              className="font-[family-name:var(--font-display)] text-xl font-bold tracking-[-0.03em] text-[var(--color-night-navy)]"
            >
              SameLobby
            </Link>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-slate)]">
              Find platonic gaming friends and teammates who fit your games,
              schedule, and way of playing.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-[var(--color-night-navy)] uppercase">
              Explore
            </p>
            <nav
              aria-label="Explore"
              className="mt-4 flex flex-col gap-3 text-sm text-[var(--color-text-slate)]"
            >
              <Link
                href="/how-it-works"
                className="hover:text-[var(--color-lobby-teal)]"
              >
                How it works
              </Link>
              <Link
                href="/pricing"
                className="hover:text-[var(--color-lobby-teal)]"
              >
                Pricing
              </Link>
              <Link
                href="/help"
                className="hover:text-[var(--color-lobby-teal)]"
              >
                Help and FAQ
              </Link>
            </nav>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-[var(--color-night-navy)] uppercase">
              Trust
            </p>
            <nav
              aria-label="Trust"
              className="mt-4 flex flex-col gap-3 text-sm text-[var(--color-text-slate)]"
            >
              <Link
                href="/safety"
                className="hover:text-[var(--color-lobby-teal)]"
              >
                Safety Center
              </Link>
              <Link
                href="/sign-in"
                className="hover:text-[var(--color-lobby-teal)]"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="hover:text-[var(--color-lobby-teal)]"
              >
                Create account
              </Link>
            </nav>
          </div>
        </div>
        <div className="border-t border-[var(--color-border)]">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-[var(--color-text-slate)] sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <span>© {new Date().getFullYear()} SameLobby</span>
            <span>
              For gamers 18+ · Private connections · No swiping · No paid boosts
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
