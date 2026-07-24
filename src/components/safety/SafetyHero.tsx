import Link from "next/link";
import { Icon } from "@/components/landing/icons";

const reportCategories = [
  "Harassment",
  "Spam",
  "Inappropriate content",
  "Scam",
  "Other",
];

const caseStatuses = ["Received", "Under review", "Closed"];

function CasePreview() {
  return (
    <figure className="animate-float relative mx-auto w-full max-w-[550px] lg:mx-0 lg:ml-auto">
      <figcaption className="sr-only">
        Preview of a SameLobby report: a category is selected, the report is
        received with a case reference, and the case moves from Received to
        Under review to Closed.
      </figcaption>
      <svg
        aria-hidden="true"
        className="absolute -top-14 -left-14 h-64 w-64 text-[#8ce0d0]/15"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="100" cy="100" r="96" />
        <circle cx="100" cy="100" r="70" />
        <circle cx="100" cy="100" r="44" />
      </svg>
      <div
        aria-hidden="true"
        className="absolute -right-12 -bottom-12 h-52 w-52 rounded-full bg-[var(--color-lobby-teal)] opacity-40 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="relative overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.07] p-3 shadow-[0_40px_90px_rgba(2,8,20,0.55)] backdrop-blur-xl sm:p-4"
      >
        <div className="flex items-center justify-between px-2 pt-1 pb-3 text-white">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-[#8ce0d0]">
              <Icon name="shield" className="h-4 w-4" />
            </span>
            <div>
              <p className="font-[family-name:var(--font-display)] text-sm font-bold">
                Report status
              </p>
              <p className="text-[11px] text-white/60">Safety preview</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-warm-amber)]/20 px-2.5 py-1 text-[11px] font-medium text-[#f0c778]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-warm-amber)]" />
            Under review
          </span>
        </div>

        <div className="rounded-[20px] bg-[#eef4f3] p-3 sm:p-4">
          <div className="rounded-xl border border-[#d7e5e2] bg-white/80 px-3 py-2.5">
            <p className="text-[10px] font-bold tracking-[0.14em] text-[var(--color-lobby-teal)] uppercase">
              Category
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {reportCategories.map((category, index) => (
                <span
                  key={category}
                  className={
                    index === 0
                      ? "rounded-full border border-[var(--color-lobby-teal)] bg-[var(--color-signal-mint)] px-2 py-1 text-[10px] font-semibold text-[var(--color-lobby-teal)]"
                      : "rounded-full bg-[var(--color-cloud)] px-2 py-1 text-[10px] font-medium text-[var(--color-text-slate)]"
                  }
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-md)]">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[var(--color-signal-mint)] text-[var(--color-lobby-teal)]">
                <Icon name="check" className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-[var(--color-night-navy)]">
                  Report received
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-[var(--color-text-slate)]">
                  Case reference 9F2K-7QXA
                </p>
              </div>
            </div>
            <p className="mt-3 border-t border-[var(--color-border)] pt-3 text-[11px] leading-5 text-[var(--color-text-slate)]">
              Blocking is separate from moderation. You can block this player at
              any time — it is immediate and silent.
            </p>
          </div>

          <div className="relative mt-3 rounded-xl border border-[#d7e5e2] bg-white/80 px-4 py-3.5">
            <div
              aria-hidden="true"
              className="absolute top-[17px] right-12 left-12 h-px bg-[#d7e5e2]"
            />
            <ol className="relative grid grid-cols-3 gap-2">
              {caseStatuses.map((status, index) => (
                <li
                  key={status}
                  className="flex flex-col items-center gap-1.5 text-center"
                >
                  <span
                    className={
                      index === 0
                        ? "grid h-2.5 w-2.5 rounded-full bg-[var(--color-lobby-teal)] shadow-[0_0_0_3px_#d9f1ec]"
                        : index === 1
                          ? "grid h-2.5 w-2.5 rounded-full bg-[var(--color-warm-amber)] shadow-[0_0_0_3px_#f6e8cf]"
                          : "grid h-2.5 w-2.5 rounded-full border border-[#c3d2cf] bg-white"
                    }
                  />
                  <span
                    className={
                      index === 1
                        ? "text-[10px] font-bold text-[var(--color-night-navy)]"
                        : "text-[10px] font-medium text-[var(--color-text-slate)]"
                    }
                  >
                    {status}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute -right-3 -bottom-5 hidden items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white shadow-[0_16px_40px_rgba(2,8,20,0.45)] backdrop-blur-md sm:flex"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--color-signal-mint)] text-[var(--color-lobby-teal)]">
          <Icon name="flag" className="h-3.5 w-3.5" />
        </span>
        Human review before permanent bans
      </div>
    </figure>
  );
}

export function SafetyHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[var(--color-night-navy)] text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 88%, rgba(11,107,99,.5), transparent 40%)",
        }}
      />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pt-16 pb-20 sm:px-8 sm:pt-20 sm:pb-24 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:pt-24 lg:pb-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#8ce0d0]">
            <Icon name="shield" className="h-3.5 w-3.5" />
            Safety Center
          </span>
          <h1 className="mt-6 max-w-2xl font-[family-name:var(--font-display)] text-4xl leading-[1.04] font-bold tracking-[-0.04em] sm:text-5xl lg:text-[3.65rem]">
            Clear rules. Real controls.{" "}
            <span className="text-[#8ce0d0]">Human review</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/70">
            SameLobby is for gamers 18+ looking for platonic gaming friends and
            teammates — no dating, no sexual solicitation. Block and report
            controls stay within reach, and every report is read by a human
            reviewer.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex min-h-[var(--touch-min)] items-center justify-center gap-2 rounded-xl bg-[var(--color-signal-mint)] px-5 py-3.5 font-semibold text-[var(--color-night-navy)] shadow-[0_12px_36px_rgba(140,224,208,0.28)] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-signal-mint)]"
            >
              Create your free profile
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
            <a
              href="#after-you-report"
              className="inline-flex min-h-[var(--touch-min)] items-center justify-center rounded-xl border border-white/20 bg-white/5 px-5 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:border-[#8ce0d0] hover:text-[#8ce0d0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-signal-mint)]"
            >
              See how reporting works
            </a>
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
        <CasePreview />
      </div>
    </section>
  );
}
