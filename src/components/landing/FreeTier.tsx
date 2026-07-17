import Link from "next/link";
import { Icon } from "./icons";

const freeIncludes = [
  "Relevant gamer discovery",
  "Connections and private messaging",
  "Play invitations and session planning",
  "Teammates and one private group",
  "All privacy and safety controls",
];

export function FreeTier() {
  return (
    <section className="border-y border-[var(--color-border)] bg-[#eef7f5] py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="reveal">
          <span className="text-xs font-bold tracking-[0.16em] text-[var(--color-lobby-teal)] uppercase">
            Start free
          </span>
          <h2 className="mt-3 max-w-xl font-[family-name:var(--font-display)] text-3xl leading-tight font-bold tracking-[-0.03em] text-[var(--color-night-navy)] sm:text-4xl">
            Everything you need to find your next regular teammate.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--color-text-slate)]">
            Discovery, private messaging, play invitations, and one private
            group are included with SameLobby Free.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex min-h-[var(--touch-min)] items-center justify-center gap-2 rounded-xl bg-[var(--color-lobby-teal)] px-5 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#085d56]"
            >
              Create your free profile
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex min-h-[var(--touch-min)] items-center justify-center rounded-xl px-5 py-3.5 font-semibold text-[var(--color-lobby-teal)] hover:bg-white/70"
            >
              Compare Free and Plus
            </Link>
          </div>
        </div>

        <div className="reveal rounded-3xl bg-gradient-to-br from-[var(--color-lobby-teal)] via-[#8ce0d0] to-[var(--color-signal-mint)] p-[1.5px] shadow-[0_24px_60px_rgba(11,22,40,0.10)]">
          <div className="rounded-[calc(1.5rem-1.5px)] bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--color-night-navy)]">
                  SameLobby Free
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-slate)]">
                  A complete way to get started.
                </p>
              </div>
              <span className="rounded-full bg-[var(--color-signal-mint)] px-3 py-1 text-xs font-bold text-[var(--color-lobby-teal)]">
                $0
              </span>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-[var(--color-text-slate)]">
              {freeIncludes.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--color-signal-mint)] text-[var(--color-lobby-teal)]">
                    <Icon name="check" className="h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
