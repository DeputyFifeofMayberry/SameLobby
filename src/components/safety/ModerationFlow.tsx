const flowSteps = [
  {
    number: "01",
    title: "Received",
    copy: "Your report becomes a case with a reference you can follow in your Safety Center. Blocking stays separate from moderation.",
  },
  {
    number: "02",
    title: "Under review",
    copy: "A reviewer claims the case and examines case-scoped evidence. Every evidence view is logged — there is no bulk message export.",
  },
  {
    number: "03",
    title: "Action",
    copy: "Outcomes follow a ladder: warn, restrict messaging, restrict discovery, or suspend. Permanent bans for severe cases always involve human review.",
  },
  {
    number: "04",
    title: "Appeal",
    copy: "Eligible actions can be appealed once within 30 days. If an appeal reverses the action, account status is restored.",
  },
];

const reviewTargets = [
  "Severe harm and scams · within 24 hours",
  "Repeated harassment · within 72 hours",
  "Spam · within 5 business days",
];

export function ModerationFlow() {
  return (
    <section
      id="after-you-report"
      className="relative scroll-mt-20 overflow-hidden bg-[var(--color-night-navy)] py-20 text-white sm:py-24"
    >
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 h-px w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-[var(--color-lobby-teal)]/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-24 -bottom-40 h-80 w-80 rounded-full bg-[#8ce0d0]/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="reveal max-w-2xl">
          <span className="text-xs font-bold tracking-[0.16em] text-[#8ce0d0] uppercase">
            Reviewed by people
          </span>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-tight font-bold tracking-[-0.03em] sm:text-4xl">
            What happens after you report.
          </h2>
          <p className="mt-4 text-lg leading-8 text-white/70">
            Reports don&apos;t vanish into a queue. Each one becomes a case —
            scoped, logged, and decided by a person.
          </p>
        </div>

        <div className="relative mt-14">
          <div
            aria-hidden="true"
            className="absolute top-[22px] right-8 left-8 hidden h-px bg-gradient-to-r from-[#8ce0d0]/10 via-[#8ce0d0]/50 to-[#8ce0d0]/10 lg:block"
          />
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {flowSteps.map((step) => (
              <li key={step.title} className="reveal relative">
                <span className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#8ce0d0]/40 bg-[var(--color-night-navy)] font-[family-name:var(--font-display)] text-xs font-bold tracking-[0.12em] text-[#8ce0d0] shadow-[0_0_0_6px_rgba(11,22,40,1)]">
                  {step.number}
                </span>
                <h3 className="mt-5 font-[family-name:var(--font-display)] text-lg font-bold">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  {step.copy}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div className="reveal mt-14 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-sm">
              <p className="text-xs font-bold tracking-[0.16em] text-[#f0c778] uppercase">
                Our review targets
              </p>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Targets we hold ourselves to — not guarantees. Every notice
                protects reporter privacy.
              </p>
            </div>
            <ul className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              {reviewTargets.map((target) => (
                <li
                  key={target}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--color-warm-amber)]/30 bg-[var(--color-warm-amber)]/10 px-3.5 py-2 text-xs font-semibold text-[#f0c778]"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-warm-amber)]" />
                  {target}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
