import Link from "next/link";
import { Icon } from "@/components/landing/icons";
import { JourneyMap } from "./JourneyMap";

export function HowHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[var(--color-night-navy)] text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 10%, rgba(11,107,99,.5), transparent 40%)",
        }}
      />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pt-16 pb-20 sm:px-8 sm:pt-20 sm:pb-24 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:pt-24 lg:pb-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#8ce0d0]">
            <Icon name="people" className="h-3.5 w-3.5" />
            How SameLobby works · For gamers 18+
          </span>
          <h1 className="mt-6 max-w-2xl font-[family-name:var(--font-display)] text-4xl leading-[1.04] font-bold tracking-[-0.04em] sm:text-5xl lg:text-[3.65rem]">
            From solo queue to your{" "}
            <span className="text-[#8ce0d0]">regular crew</span> — in five
            simple steps.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/70">
            Set up once, meet gamers who fit your games and schedule, and turn
            one good session into people you play with again. Here is exactly
            what to expect, step by step.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex min-h-[var(--touch-min)] items-center justify-center gap-2 rounded-xl bg-[var(--color-signal-mint)] px-5 py-3.5 font-semibold text-[var(--color-night-navy)] shadow-[0_12px_36px_rgba(140,224,208,0.28)] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-signal-mint)]"
            >
              Create your free profile
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex min-h-[var(--touch-min)] items-center justify-center rounded-xl border border-white/20 bg-white/5 px-5 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:border-[#8ce0d0] hover:text-[#8ce0d0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-signal-mint)]"
            >
              Compare Free and Plus
            </Link>
          </div>
          <ul
            className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/70"
            aria-label="SameLobby trust commitments"
          >
            {[
              "Adults 18+",
              "Private connections",
              "No swiping",
              "No paid boosts",
            ].map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-white/10 text-[#8ce0d0]">
                  <Icon name="check" className="h-3 w-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <JourneyMap />
      </div>
    </section>
  );
}
