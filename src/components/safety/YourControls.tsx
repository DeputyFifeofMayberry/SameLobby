import { Icon, type IconName } from "@/components/landing/icons";

const controls: Array<{
  icon: IconName;
  title: string;
  copy: string;
}> = [
  {
    icon: "ban",
    title: "Block",
    copy: "Immediate and silent. A blocked player can't contact you or appear in your discovery results — and blocking is not a moderation finding. Unblock anytime from Settings.",
  },
  {
    icon: "flag",
    title: "Report",
    copy: "Report from a profile, conversation, group, or play invitation. Pick a category, describe what happened, and optionally include up to 5 recent messages as context.",
  },
  {
    icon: "pause",
    title: "Pause discovery",
    copy: "Stop appearing in recommendations anytime. Your connections, teammates, and groups stay exactly where you left them.",
  },
  {
    icon: "eye",
    title: "Preview your profile",
    copy: "The discoverable preview shows exactly what eligible members see, so you can check how you appear before and after you go live.",
  },
  {
    icon: "download",
    title: "Export your data",
    copy: "Download a copy of your own account data as JSON whenever you want. Other players' details are never included.",
  },
  {
    icon: "lock",
    title: "Delete your account",
    copy: "Password-confirmed. Your profile leaves discovery immediately, and personal data is purged on a 30-day schedule. Block records are retained.",
  },
];

export function YourControls() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="reveal max-w-2xl">
          <span className="text-xs font-bold tracking-[0.16em] text-[var(--color-lobby-teal)] uppercase">
            In your hands
          </span>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-tight font-bold tracking-[-0.03em] text-[var(--color-night-navy)] sm:text-4xl">
            Safety controls that stay within reach.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[var(--color-text-slate)]">
            You decide when you&apos;re discoverable, who can contact you, and
            what you share. Every control below is built into the free product.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {controls.map((control) => (
            <article
              key={control.title}
              className="reveal group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-cloud)] p-6 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[var(--shadow-md)]"
            >
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-[var(--color-lobby-teal)] to-[#8ce0d0] transition-transform duration-300 group-hover:scale-x-100"
              />
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[var(--color-lobby-teal)] shadow-[var(--shadow-sm)] transition duration-300 group-hover:bg-[var(--color-signal-mint)]">
                <Icon name={control.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-[family-name:var(--font-display)] text-lg font-bold text-[var(--color-night-navy)]">
                {control.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-slate)]">
                {control.copy}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
