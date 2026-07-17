import { Icon, type IconName } from "./icons";

const fitFeatures: Array<{
  icon: IconName;
  title: string;
  copy: string;
  wide?: boolean;
}> = [
  {
    icon: "game",
    title: "Games and platforms",
    copy: "See gamers you can actually play with, including cross-play compatibility.",
    wide: true,
  },
  {
    icon: "calendar",
    title: "Timing that works",
    copy: "Use availability, current intent, and session length to find likely workable overlap.",
  },
  {
    icon: "chat",
    title: "Clear expectations",
    copy: "Align on communication, group size, play style, and interaction environment first.",
  },
];

export function FitFeatures() {
  return (
    <section className="bg-[var(--color-cloud)] py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="reveal grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <span className="text-xs font-bold tracking-[0.16em] text-[var(--color-lobby-teal)] uppercase">
              Compatibility that matters
            </span>
            <h2 className="mt-3 max-w-xl font-[family-name:var(--font-display)] text-3xl leading-tight font-bold tracking-[-0.03em] text-[var(--color-night-navy)] sm:text-4xl">
              Find people who fit how you actually play.
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-[var(--color-text-slate)] lg:justify-self-end">
            Stop starting over every time you log on. SameLobby focuses on the
            practical things that turn a random queue into someone you&apos;d
            invite back.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {fitFeatures.map((feature) => (
            <article
              key={feature.title}
              className={`reveal group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-sm)] transition duration-300 hover:-translate-y-1 hover:border-[var(--color-lobby-teal)]/40 hover:shadow-[var(--shadow-md)] sm:p-7 ${
                feature.wide ? "md:col-span-2" : ""
              }`}
            >
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-[var(--color-lobby-teal)] to-[#8ce0d0] transition-transform duration-300 group-hover:scale-x-100"
              />
              <div
                className={
                  feature.wide ? "sm:flex sm:items-start sm:gap-6" : undefined
                }
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--color-signal-mint)] text-[var(--color-lobby-teal)] transition duration-300 group-hover:bg-[var(--color-lobby-teal)] group-hover:text-white">
                  <Icon name={feature.icon} />
                </span>
                <div className="mt-5 sm:mt-0">
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--color-night-navy)]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 max-w-2xl leading-7 text-[var(--color-text-slate)]">
                    {feature.copy}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
