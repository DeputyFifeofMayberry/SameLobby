import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Find gaming friends who fit your life",
  description:
    "Meet compatible gamers, connect by mutual choice, plan a session, and keep playing beyond one lobby. SameLobby is for gamers 18+.",
};

type IconName =
  | "arrow"
  | "calendar"
  | "check"
  | "chat"
  | "game"
  | "lock"
  | "pause"
  | "people"
  | "search"
  | "shield"
  | "spark";

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chat: (
      <>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
        <path d="M8 9h8M8 13h5" />
      </>
    ),
    game: (
      <>
        <path d="M6 11h4M8 9v4M15 10h.01M18 12h.01" />
        <path d="M7 6h10a5 5 0 0 1 4.8 6.4l-1.2 4A2.2 2.2 0 0 1 17 17.5l-2-2.5H9l-2 2.5a2.2 2.2 0 0 1-3.6-1.1l-1.2-4A5 5 0 0 1 7 6Z" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
      </>
    ),
    pause: (
      <>
        <rect x="5" y="4" width="5" height="16" rx="1" />
        <rect x="14" y="4" width="5" height="16" rx="1" />
      </>
    ),
    people: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    shield: (
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Zm-3-10 2 2 4-4" />
    ),
    spark: (
      <path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Zm6 12 .75 2.25L21 18l-2.25.75L18 21l-.75-2.25L15 18l2.25-.75L18 15Z" />
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function ProductPreview() {
  return (
    <figure className="relative mx-auto w-full max-w-[550px] lg:mx-0 lg:ml-auto">
      <figcaption className="sr-only">
        SameLobby product preview showing a recommended gamer, an accepted
        connection, a private conversation, and a play invitation.
      </figcaption>
      <div className="absolute -top-12 -right-12 h-52 w-52 rounded-full bg-[var(--color-signal-mint)] opacity-70 blur-3xl" />
      <div className="absolute -bottom-16 -left-8 h-48 w-48 rounded-full bg-[#dbeafe] opacity-70 blur-3xl" />

      <div
        aria-hidden="true"
        className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[var(--color-night-navy)] p-3 shadow-[0_30px_80px_rgba(11,22,40,0.22)] sm:p-4"
      >
        <div className="flex items-center justify-between px-2 pt-1 pb-3 text-white">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-[var(--color-signal-mint)]">
              <Icon name="game" className="h-4 w-4" />
            </span>
            <div>
              <p className="font-[family-name:var(--font-display)] text-sm font-bold">
                Your next lobby
              </p>
              <p className="text-[11px] text-white/55">Product preview</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-[#61d6bf]" />
            Looking now
          </span>
        </div>

        <div className="rounded-[20px] bg-[#eef4f3] p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-[#d7e5e2] bg-white/80 px-3 py-2.5">
            <div>
              <p className="text-[10px] font-bold tracking-[0.14em] text-[var(--color-lobby-teal)] uppercase">
                Current intent
              </p>
              <p className="mt-0.5 text-xs font-semibold text-[var(--color-night-navy)] sm:text-sm">
                Co-op · PC · Tonight
              </p>
            </div>
            <span className="rounded-full bg-[var(--color-signal-mint)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-night-navy)]">
              Duo
            </span>
          </div>

          <article className="relative rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-md)] sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--color-night-navy)] font-[family-name:var(--font-display)] text-sm font-bold text-white">
                  PP
                </div>
                <div>
                  <p className="font-[family-name:var(--font-display)] text-base font-bold text-[var(--color-night-navy)]">
                    PixelPilot
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--color-text-slate)]">
                    Looking for regular teammates
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-[var(--color-signal-mint)] px-2 py-1 text-[10px] font-bold text-[var(--color-lobby-teal)]">
                Recommended
              </span>
            </div>

            <p className="mt-4 text-[10px] font-bold tracking-[0.14em] text-[var(--color-text-slate)] uppercase">
              Why shown
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["Shared game", "Playable together", "Schedule overlap"].map(
                (reason) => (
                  <span
                    key={reason}
                    className="inline-flex items-center gap-1 rounded-full bg-[var(--color-cloud)] px-2 py-1 text-[10px] font-medium text-[var(--color-text-slate)]"
                  >
                    <Icon
                      name="check"
                      className="h-3 w-3 text-[var(--color-lobby-teal)]"
                    />
                    {reason}
                  </span>
                ),
              )}
            </div>
          </article>

          <div className="relative z-10 mt-3 ml-5 rounded-2xl border border-[#dce3ea] bg-white p-3.5 shadow-[var(--shadow-sm)] sm:ml-10">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-night-navy)]">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-[var(--color-signal-mint)] text-[var(--color-lobby-teal)]">
                <Icon name="chat" className="h-3.5 w-3.5" />
              </span>
              Connection accepted · Conversation unlocked
            </div>
            <div className="mt-3 flex flex-col gap-1.5 text-[11px]">
              <span className="mr-9 self-start rounded-xl rounded-bl-sm bg-[var(--color-cloud)] px-3 py-2 text-[var(--color-text-slate)]">
                Want to run co-op Saturday?
              </span>
              <span className="ml-9 self-end rounded-xl rounded-br-sm bg-[var(--color-lobby-teal)] px-3 py-2 text-white">
                Yep — 8 PM works.
              </span>
            </div>
          </div>

          <div className="relative z-20 -mt-1 mr-4 ml-10 rounded-2xl border border-[#d5e4e1] bg-[#fafffe] p-3.5 shadow-[var(--shadow-md)] sm:mr-8 sm:ml-20">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[var(--color-signal-mint)] text-[var(--color-lobby-teal)]">
                  <Icon name="calendar" className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-bold text-[var(--color-night-navy)]">
                    Play invitation
                  </p>
                  <p className="mt-0.5 text-[10px] text-[var(--color-text-slate)]">
                    Saturday · 8:00 PM
                  </p>
                </div>
              </div>
              <span className="rounded-lg border border-[var(--color-border)] bg-white px-2 py-1 text-[9px] font-semibold text-[var(--color-lobby-teal)]">
                Suggest a time
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute -right-3 -bottom-5 hidden items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-4 py-2.5 text-xs font-semibold text-[var(--color-night-navy)] shadow-[var(--shadow-md)] sm:flex"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--color-signal-mint)] text-[var(--color-lobby-teal)]">
          <Icon name="people" className="h-3.5 w-3.5" />
        </span>
        Built for playing again
      </div>
    </figure>
  );
}

const fitFeatures: Array<{
  icon: IconName;
  title: string;
  copy: string;
}> = [
  {
    icon: "game",
    title: "Games and platforms",
    copy: "See gamers you can actually play with, including cross-play compatibility.",
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
    icon: "spark",
    title: "No pay-to-be-seen",
    copy: "SameLobby Plus adds organization tools—not visibility, ranking, or safety features.",
  },
];

const faqs = [
  {
    question: "Is SameLobby a dating app?",
    answer:
      "No. SameLobby is for platonic gaming friends and teammates. Dating and sexual solicitation are not allowed.",
  },
  {
    question: "How are gamers recommended?",
    answer:
      "Recommendations use practical compatibility signals such as shared games, playable platforms, availability, current goals, and the interaction preferences you choose to share.",
  },
  {
    question: "Does SameLobby Plus improve my visibility?",
    answer:
      "No. Plus adds organization and continuity tools. It does not change ranking, visibility, or access to safety features.",
  },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <section className="relative isolate border-b border-[var(--color-border)] bg-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-80"
          style={{
            backgroundImage:
              "radial-gradient(circle at 8% 18%, rgba(217,241,236,.9), transparent 27%), radial-gradient(circle at 90% 82%, rgba(219,234,254,.7), transparent 28%)",
          }}
        />
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#badbd4] bg-[var(--color-signal-mint)]/70 px-3 py-1.5 text-xs font-semibold text-[var(--color-lobby-teal)]">
              <Icon name="people" className="h-3.5 w-3.5" />
              Platonic gaming friends and teammates · For gamers 18+
            </span>
            <h1 className="mt-6 max-w-2xl font-[family-name:var(--font-display)] text-4xl leading-[1.04] font-bold tracking-[-0.04em] text-[var(--color-night-navy)] sm:text-5xl lg:text-[3.65rem]">
              Meet gamers you&apos;ll actually want to play with again.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--color-text-slate)]">
              Find gamers who share your games, can play on a compatible
              platform, and are available when you are. Connect by mutual
              choice, plan a session, and keep playing beyond one lobby.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex min-h-[var(--touch-min)] items-center justify-center gap-2 rounded-xl bg-[var(--color-lobby-teal)] px-5 py-3.5 font-semibold text-white shadow-[0_10px_30px_rgba(11,107,99,0.18)] transition hover:-translate-y-0.5 hover:bg-[#085d56] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
              >
                Create your free profile
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex min-h-[var(--touch-min)] items-center justify-center rounded-xl border border-[#b7c1ce] bg-white px-5 py-3.5 font-semibold text-[var(--color-night-navy)] transition hover:-translate-y-0.5 hover:border-[var(--color-lobby-teal)] hover:text-[var(--color-lobby-teal)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
              >
                See how SameLobby works
              </Link>
            </div>
            <ul
              className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--color-text-slate)]"
              aria-label="SameLobby trust commitments"
            >
              {[
                "Adults 18+",
                "Private connections",
                "No swiping",
                "No paid boosts",
              ].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--color-signal-mint)] text-[var(--color-lobby-teal)]">
                    <Icon name="check" className="h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section className="bg-[var(--color-cloud)] py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
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
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {fitFeatures.map((feature) => (
              <article
                key={feature.title}
                className="group rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-sm)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--color-signal-mint)] text-[var(--color-lobby-teal)]">
                  <Icon name={feature.icon} />
                </span>
                <h3 className="mt-5 font-[family-name:var(--font-display)] text-lg font-bold text-[var(--color-night-navy)]">
                  {feature.title}
                </h3>
                <p className="mt-2 leading-7 text-[var(--color-text-slate)]">
                  {feature.copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[var(--color-night-navy)] py-20 text-white sm:py-24">
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/2 h-px w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent"
        />
        <div
          aria-hidden="true"
          className="absolute -top-32 -right-24 h-80 w-80 rounded-full bg-[var(--color-lobby-teal)]/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold tracking-[0.16em] text-[#74dbc7] uppercase">
              The SameLobby loop
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-tight font-bold tracking-[-0.03em] sm:text-4xl">
              From discovery to people you play with again.
            </h2>
            <p className="mt-4 text-lg leading-8 text-white/65">
              A clear path from finding someone compatible to building a lasting
              gaming friendship.
            </p>
          </div>
          <ol className="relative mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {loopSteps.map((step, index) => (
              <li
                key={step.title}
                className="relative rounded-2xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-[family-name:var(--font-display)] text-xs font-bold tracking-[0.12em] text-[#74dbc7]">
                    {step.number}
                  </span>
                  {index < loopSteps.length - 1 && (
                    <Icon
                      name="arrow"
                      className="hidden h-4 w-4 text-white/30 lg:block"
                    />
                  )}
                </div>
                <h3 className="mt-8 font-[family-name:var(--font-display)] text-lg font-bold">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  {step.copy}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <span className="text-xs font-bold tracking-[0.16em] text-[var(--color-lobby-teal)] uppercase">
              Trust and control
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-tight font-bold tracking-[-0.03em] text-[var(--color-night-navy)] sm:text-4xl">
              Connection without swipe culture.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[var(--color-text-slate)]">
              You decide when you&apos;re discoverable, who can contact you, and
              what you share. Safety tools are part of the product—not an
              upgrade.
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
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-cloud)] p-6"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[var(--color-lobby-teal)] shadow-[var(--shadow-sm)]">
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

      <section className="border-y border-[var(--color-border)] bg-[#eef7f5] py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_0.9fr]">
          <div>
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
                className="inline-flex min-h-[var(--touch-min)] items-center justify-center gap-2 rounded-xl bg-[var(--color-lobby-teal)] px-5 py-3.5 font-semibold text-white transition hover:bg-[#085d56]"
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
          <div className="rounded-3xl border border-[#c8dfda] bg-white p-6 shadow-[0_24px_60px_rgba(11,22,40,0.08)] sm:p-8">
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
              {[
                "Relevant gamer discovery",
                "Connections and private messaging",
                "Play invitations and session planning",
                "Teammates and one private group",
                "All privacy and safety controls",
              ].map((item) => (
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
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="text-center">
            <span className="text-xs font-bold tracking-[0.16em] text-[var(--color-lobby-teal)] uppercase">
              Questions, answered
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.03em] text-[var(--color-night-navy)] sm:text-4xl">
              A different kind of gaming platform.
            </h2>
          </div>
          <div className="mt-10 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex min-h-[var(--touch-min)] cursor-pointer list-none items-center justify-between gap-4 font-[family-name:var(--font-display)] text-base font-bold text-[var(--color-night-navy)] marker:content-none">
                  {faq.question}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--color-cloud)] text-xl font-normal text-[var(--color-lobby-teal)] transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="max-w-2xl pr-12 pb-1 leading-7 text-[var(--color-text-slate)]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 pb-20 sm:px-8 sm:pb-24">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-[var(--color-night-navy)] px-6 py-12 text-center text-white sm:px-10 sm:py-16">
          <div
            aria-hidden="true"
            className="absolute -top-28 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-[var(--color-lobby-teal)]/35 blur-3xl"
          />
          <div className="relative mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#8ce0d0]">
              <Icon name="spark" className="h-3.5 w-3.5" />
              Your next lobby can last longer than one night
            </span>
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-3xl leading-tight font-bold tracking-[-0.03em] sm:text-4xl">
              Find gaming friends who fit your life.
            </h2>
            <p className="mt-4 text-lg leading-8 text-white/65">
              Tell SameLobby what you play, when you&apos;re available, and what
              kind of connection you want now.
            </p>
            <Link
              href="/sign-up"
              className="mt-8 inline-flex min-h-[var(--touch-min)] items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 font-semibold text-[var(--color-night-navy)] transition hover:-translate-y-0.5 hover:bg-[var(--color-signal-mint)]"
            >
              Create your free profile
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
