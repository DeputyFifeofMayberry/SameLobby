import {
  ConnectVignette,
  CrewVignette,
  PlanVignette,
  RecommendVignette,
  SetupVignette,
} from "./StepVignettes";

const steps: Array<{
  number: string;
  title: string;
  copy: string;
  youDo: string;
  youGet: string;
  visual: React.ReactNode;
}> = [
  {
    number: "01",
    title: "Tell us what you play",
    copy: "Pick your games, platforms, and when you\u2019re usually free. Set your current intent — like \u201cHelldivers 2 tonight\u201d — and the kind of connection you want right now.",
    youDo: "About five minutes of setup, once.",
    youGet: "A profile that filters for fit before you ever say hello.",
    visual: <SetupVignette />,
  },
  {
    number: "02",
    title: "Meet gamers who fit",
    copy: "Browse recommended gamers and see exactly why each one was shown. No mystery scores — just shared games, playable platforms, and real schedule overlap.",
    youDo: "Scroll a short, relevant list — no endless swiping.",
    youGet: "Clear compatibility reasons on every recommendation.",
    visual: <RecommendVignette />,
  },
  {
    number: "03",
    title: "Connect by mutual choice",
    copy: "Send a connection request. Private messaging opens only if they accept — so every conversation starts with two people who both want to be there.",
    youDo: "One tap to send a request.",
    youGet: "No cold messages. No pressure. Mutual or nothing.",
    visual: <ConnectVignette />,
  },
  {
    number: "04",
    title: "Make a game plan",
    copy: "Chat privately, send a play invitation, or suggest a time that works for both of you. Reminders keep everyone on track until you\u2019re in the lobby.",
    youDo: "Pick a game and a time — or accept theirs.",
    youGet: "A session that actually happens.",
    visual: <PlanVignette />,
  },
  {
    number: "05",
    title: "Keep your crew together",
    copy: "Play again, become teammates, and open a private group. Your people stay with you across games and schedule changes — no starting over.",
    youDo: "Show up and play.",
    youGet: "A regular crew that survives busy weeks.",
    visual: <CrewVignette />,
  },
];

export function StepsDeepDive() {
  return (
    <section className="bg-[var(--color-cloud)] py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="reveal max-w-2xl">
          <span className="text-xs font-bold tracking-[0.16em] text-[var(--color-lobby-teal)] uppercase">
            Step by step
          </span>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-tight font-bold tracking-[-0.03em] text-[var(--color-night-navy)] sm:text-4xl">
            Five steps. No guesswork.
          </h2>
          <p className="mt-4 text-lg leading-8 text-[var(--color-text-slate)]">
            Exactly what you&apos;ll do at each stage — and what SameLobby does
            for you along the way.
          </p>
        </div>

        <ol className="relative mt-14 lg:mt-20">
          <div
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-[22px] w-px -translate-x-1/2 bg-[#dce3ea] lg:left-1/2"
          />
          <div
            aria-hidden="true"
            className="spine-fill absolute top-0 bottom-0 left-[22px] w-px origin-top -translate-x-1/2 bg-gradient-to-b from-[var(--color-lobby-teal)] to-[#8ce0d0] lg:left-1/2"
          />

          {steps.map((step, index) => {
            const copyFirst = index % 2 === 0;
            return (
              <li
                key={step.number}
                className="relative py-10 first:pt-2 last:pb-0 lg:py-16 lg:first:pt-4"
              >
                <span
                  aria-hidden="true"
                  className="absolute top-10 left-0 z-10 grid h-11 w-11 place-items-center rounded-full border border-[var(--color-lobby-teal)]/30 bg-white font-[family-name:var(--font-display)] text-xs font-bold tracking-[0.12em] text-[var(--color-lobby-teal)] shadow-[0_0_0_6px_var(--color-cloud)] lg:top-16 lg:left-1/2 lg:-translate-x-1/2"
                >
                  {step.number}
                </span>

                <div className="grid items-center gap-8 pl-16 sm:pl-20 lg:grid-cols-2 lg:gap-20 lg:pl-0">
                  <div className={`reveal ${copyFirst ? "" : "lg:order-2"}`}>
                    <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-[-0.02em] text-[var(--color-night-navy)]">
                      {step.title}
                    </h3>
                    <p className="mt-3 leading-7 text-[var(--color-text-slate)]">
                      {step.copy}
                    </p>
                    <div className="mt-5 space-y-2.5">
                      <p className="flex items-start gap-2.5 text-sm leading-6 text-[var(--color-text-slate)]">
                        <span className="mt-0.5 shrink-0 rounded-full bg-[var(--color-signal-mint)] px-2 py-0.5 text-[10px] font-bold tracking-[0.1em] text-[var(--color-lobby-teal)] uppercase">
                          You do
                        </span>
                        <span>{step.youDo}</span>
                      </p>
                      <p className="flex items-start gap-2.5 text-sm leading-6 text-[var(--color-text-slate)]">
                        <span className="mt-0.5 shrink-0 rounded-full bg-[var(--color-lobby-teal)] px-2 py-0.5 text-[10px] font-bold tracking-[0.1em] text-white uppercase">
                          You get
                        </span>
                        <span>{step.youGet}</span>
                      </p>
                    </div>
                  </div>
                  <div className={`reveal ${copyFirst ? "" : "lg:order-1"}`}>
                    {step.visual}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
