import Link from "next/link";
import { Icon, type IconName } from "@/components/landing/icons";

const benefits: Array<{
  icon: IconName;
  title: string;
  copy: string;
}> = [
  {
    icon: "eye",
    title: "Compatibility you can see",
    copy: "Every recommendation shows its reasons — shared games, playable platforms, schedule overlap. No mystery scores.",
  },
  {
    icon: "lock",
    title: "Mutual by design",
    copy: "Messaging unlocks only after a connection request is accepted. Your inbox stays yours.",
  },
  {
    icon: "ban",
    title: "No swiping, no boosts",
    copy: "Relevance decides who you see. Money never buys visibility, ranking, or attention.",
  },
  {
    icon: "shield",
    title: "Safety, always included",
    copy: "Block, report, and restrict controls are free on every plan — never an upgrade.",
  },
  {
    icon: "pause",
    title: "Your visibility, your call",
    copy: "Pause discovery anytime and preview exactly what other gamers can see about you.",
  },
  {
    icon: "repeat",
    title: "Built for playing again",
    copy: "Teammates and private groups turn one good session into a regular crew.",
  },
];

export function Benefits() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="reveal lg:sticky lg:top-28 lg:self-start">
          <span className="text-xs font-bold tracking-[0.16em] text-[var(--color-lobby-teal)] uppercase">
            Why gamers stay
          </span>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-tight font-bold tracking-[-0.03em] text-[var(--color-night-navy)] sm:text-4xl">
            The benefits are the design.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[var(--color-text-slate)]">
            Every step you just saw is shaped by the same promises: relevance
            you can verify, contact you control, and safety that never costs
            extra.
          </p>
          <Link
            href="/safety"
            className="mt-7 inline-flex items-center gap-2 font-semibold text-[var(--color-lobby-teal)] underline decoration-[#9bcfc5] underline-offset-4 hover:decoration-[var(--color-lobby-teal)]"
          >
            Visit the Safety Center
            <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="reveal group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-cloud)] p-6 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[var(--shadow-md)]"
            >
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-[var(--color-lobby-teal)] to-[#8ce0d0] transition-transform duration-300 group-hover:scale-x-100"
              />
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[var(--color-lobby-teal)] shadow-[var(--shadow-sm)] transition duration-300 group-hover:bg-[var(--color-signal-mint)]">
                <Icon name={benefit.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-[family-name:var(--font-display)] text-lg font-bold text-[var(--color-night-navy)]">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-slate)]">
                {benefit.copy}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
