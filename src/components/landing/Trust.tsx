import Link from "next/link";
import { Icon, type IconName } from "./icons";

const trustFeatures: Array<{
  icon: IconName;
  title: string;
  copy: string;
}> = [
  {
    icon: "lock",
    title: "Mutual by design",
    copy: "Messaging opens only after a connection request is accepted.",
  },
  {
    icon: "pause",
    title: "Your visibility, your call",
    copy: "Pause discovery and preview exactly what other gamers can see.",
  },
  {
    icon: "shield",
    title: "Safety stays within reach",
    copy: "Block and report controls remain available throughout the experience.",
  },
  {
    icon: "eye",
    title: "No pay-to-be-seen",
    copy: "SameLobby Plus adds organization tools—not visibility, ranking, or safety features.",
  },
];

export function Trust() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="reveal lg:sticky lg:top-28 lg:self-start">
          <span className="text-xs font-bold tracking-[0.16em] text-[var(--color-lobby-teal)] uppercase">
            Trust and control
          </span>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-tight font-bold tracking-[-0.03em] text-[var(--color-night-navy)] sm:text-4xl">
            Connection without swipe culture.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[var(--color-text-slate)]">
            You decide when you&apos;re discoverable, who can contact you, and
            what you share. Safety tools are part of the product—not an upgrade.
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
          {trustFeatures.map((feature) => (
            <article
              key={feature.title}
              className="reveal group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-cloud)] p-6 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[var(--shadow-md)]"
            >
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-[var(--color-lobby-teal)] to-[#8ce0d0] transition-transform duration-300 group-hover:scale-x-100"
              />
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[var(--color-lobby-teal)] shadow-[var(--shadow-sm)] transition duration-300 group-hover:bg-[var(--color-signal-mint)]">
                <Icon name={feature.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-[family-name:var(--font-display)] text-lg font-bold text-[var(--color-night-navy)]">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-slate)]">
                {feature.copy}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
