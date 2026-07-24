import { Icon, type IconName } from "@/components/landing/icons";

const layers: Array<{
  icon: IconName;
  scope: string;
  title: string;
  copy: string;
}> = [
  {
    icon: "eye",
    scope: "Members",
    title: "Shown in discovery",
    copy: "Display name, avatar, broad region and time zone, games and platforms, current goal, and your intro.",
  },
  {
    icon: "search",
    scope: "Match-only",
    title: "Used for matching",
    copy: "Availability and preferences. Shown only as overlap you have in common — never as a searchable profile.",
  },
  {
    icon: "people",
    scope: "Connections",
    title: "Accepted connections only",
    copy: "External handles and conversation detail. Visible to people you connect with — never in discovery.",
  },
  {
    icon: "lock",
    scope: "Only you",
    title: "Private and admin",
    copy: "Email, billing, blocks, and reports. Admin access is least-privilege, and every evidence view is audit-logged.",
  },
];

export function VisibilityModel() {
  return (
    <section className="bg-[var(--color-cloud)] py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="reveal lg:sticky lg:top-28 lg:self-start">
          <span className="text-xs font-bold tracking-[0.16em] text-[var(--color-lobby-teal)] uppercase">
            Who sees what
          </span>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-tight font-bold tracking-[-0.03em] text-[var(--color-night-navy)] sm:text-4xl">
            Your information lives in layers.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[var(--color-text-slate)]">
            Every profile field carries a visibility setting, and changing that
            setting asks for explicit confirmation. This is the whole model.
          </p>
          <p className="mt-5 text-sm leading-6 text-[var(--color-text-slate)]">
            Sensitive identity is never searchable. Free text never becomes a
            filter. Message bodies never leave for analytics.
          </p>
        </div>

        <div className="reveal overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)]">
          <ol className="divide-y divide-[var(--color-border)]">
            {layers.map((layer, index) => (
              <li key={layer.title} className="flex items-start gap-4 p-5 sm:p-6">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--color-signal-mint)] text-[var(--color-lobby-teal)]">
                  <Icon name={layer.icon} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-[var(--color-night-navy)]">
                      {layer.title}
                    </h3>
                    <span className="rounded-full bg-[var(--color-cloud)] px-2.5 py-0.5 text-[10px] font-bold tracking-[0.12em] text-[var(--color-lobby-teal)] uppercase">
                      Layer {index + 1} · {layer.scope}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-6 text-[var(--color-text-slate)]">
                    {layer.copy}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
