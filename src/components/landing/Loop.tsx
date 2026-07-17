import { Icon } from "./icons";

const loopSteps = [
  {
    number: "01",
    title: "Discover",
    copy: "Browse relevant gamers and see why each was shown.",
  },
  {
    number: "02",
    title: "Connect",
    copy: "Send a request. Messaging opens after acceptance.",
  },
  {
    number: "03",
    title: "Talk",
    copy: "Start a private conversation and make a game plan.",
  },
  {
    number: "04",
    title: "Play",
    copy: "Play now or suggest times that work for both of you.",
  },
  {
    number: "05",
    title: "Continue",
    copy: "Play again, become teammates, or create a private group.",
  },
];

export function Loop() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-night-navy)] py-20 text-white sm:py-24">
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 h-px w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute -top-32 -right-24 h-80 w-80 rounded-full bg-[var(--color-lobby-teal)]/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-[#8ce0d0]/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="reveal max-w-2xl">
          <span className="text-xs font-bold tracking-[0.16em] text-[#8ce0d0] uppercase">
            From lobby to crew
          </span>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-tight font-bold tracking-[-0.03em] sm:text-4xl">
            From discovery to people you play with again.
          </h2>
          <p className="mt-4 text-lg leading-8 text-white/70">
            A clear path from finding someone compatible to building a lasting
            gaming friendship.
          </p>
        </div>

        <div className="relative mt-14">
          <div
            aria-hidden="true"
            className="absolute top-[22px] right-8 left-8 hidden h-px bg-gradient-to-r from-[#8ce0d0]/10 via-[#8ce0d0]/50 to-[#8ce0d0]/10 lg:block"
          />
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
            {loopSteps.map((step, index) => (
              <li key={step.title} className="reveal relative">
                <div className="flex items-center gap-3">
                  <span className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#8ce0d0]/40 bg-[var(--color-night-navy)] font-[family-name:var(--font-display)] text-xs font-bold tracking-[0.12em] text-[#8ce0d0] shadow-[0_0_0_6px_rgba(11,22,40,1)]">
                    {step.number}
                  </span>
                  {index < loopSteps.length - 1 && (
                    <Icon
                      name="arrow"
                      className="h-4 w-4 text-white/30 lg:hidden"
                    />
                  )}
                </div>
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
      </div>
    </section>
  );
}
