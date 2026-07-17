import Link from "next/link";
import { Icon } from "./icons";

export function FinalCta() {
  return (
    <section className="bg-white px-5 pb-20 sm:px-8 sm:pb-24">
      <div className="reveal relative mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-[var(--color-night-navy)] px-6 py-14 text-center text-white sm:px-10 sm:py-20">
        <div
          aria-hidden="true"
          className="absolute -top-28 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-[var(--color-lobby-teal)]/40 blur-3xl"
        />
        <div className="relative mx-auto max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#8ce0d0]">
            Your next lobby can last longer than one night
          </span>
          <h2 className="mt-5 font-[family-name:var(--font-display)] text-3xl leading-tight font-bold tracking-[-0.03em] sm:text-4xl">
            Find gaming friends who fit your life.
          </h2>
          <p className="mt-4 text-lg leading-8 text-white/70">
            Tell SameLobby what you play, when you&apos;re available, and what
            kind of connection you want now.
          </p>
          <Link
            href="/sign-up"
            className="mt-8 inline-flex min-h-[var(--touch-min)] items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 font-semibold text-[var(--color-night-navy)] transition hover:-translate-y-0.5 hover:bg-[var(--color-signal-mint)]"
          >
            Create your free profile
            <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
