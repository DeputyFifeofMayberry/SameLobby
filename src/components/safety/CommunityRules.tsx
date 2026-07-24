import { Icon, type IconName } from "@/components/landing/icons";

const rules: Array<{
  icon: IconName;
  title: string;
  copy: string;
}> = [
  {
    icon: "user-plus",
    title: "Adults 18+ only",
    copy: "Every member attests they are 18 or older and accepts the Terms, Privacy Notice, and Community Standards before their account becomes active. Public age disclosure is never required.",
  },
  {
    icon: "people",
    title: "Platonic, period",
    copy: "SameLobby is for platonic gaming friends and teammates. Dating and sexual solicitation are not allowed — and they are always reportable.",
  },
  {
    icon: "chat",
    title: "Mutual by design",
    copy: "Messaging opens only after a connection request is accepted, and requests never appear in Messages until they are. Unanswered requests expire after 14 days.",
  },
  {
    icon: "shield",
    title: "Never a paid feature",
    copy: "SameLobby Plus adds organization tools — not visibility, ranking, or safety features. Safety tools are part of the product, not an upgrade.",
  },
];

export function CommunityRules() {
  return (
    <section className="bg-[var(--color-cloud)] py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="reveal max-w-2xl">
          <span className="text-xs font-bold tracking-[0.16em] text-[var(--color-lobby-teal)] uppercase">
            Community Standards
          </span>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-tight font-bold tracking-[-0.03em] text-[var(--color-night-navy)] sm:text-4xl">
            The rules every lobby plays by.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[var(--color-text-slate)]">
            Four commitments shape everything on SameLobby — who can join, what
            the platform is for, and how contact begins.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {rules.map((rule) => (
            <article
              key={rule.title}
              className="reveal group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
            >
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-[var(--color-lobby-teal)] to-[#8ce0d0] transition-transform duration-300 group-hover:scale-x-100"
              />
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-signal-mint)] text-[var(--color-lobby-teal)] shadow-[var(--shadow-sm)]">
                <Icon name={rule.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-[family-name:var(--font-display)] text-lg font-bold text-[var(--color-night-navy)]">
                {rule.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-slate)]">
                {rule.copy}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
