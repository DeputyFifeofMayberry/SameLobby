import Link from "next/link";
import { Icon } from "./icons";

function ProductPreview() {
  return (
    <figure className="animate-float relative mx-auto w-full max-w-[550px] lg:mx-0 lg:ml-auto">
      <figcaption className="sr-only">
        SameLobby product preview showing a recommended gamer, an accepted
        connection, a private conversation, and a play invitation.
      </figcaption>
      <div
        aria-hidden="true"
        className="absolute -top-12 -right-12 h-52 w-52 rounded-full bg-[var(--color-lobby-teal)] opacity-40 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="relative overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.07] p-3 shadow-[0_40px_90px_rgba(2,8,20,0.55)] backdrop-blur-xl sm:p-4"
      >
        <div className="flex items-center justify-between px-2 pt-1 pb-3 text-white">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-[#8ce0d0]">
              <Icon name="game" className="h-4 w-4" />
            </span>
            <div>
              <p className="font-[family-name:var(--font-display)] text-sm font-bold">
                Your next lobby
              </p>
              <p className="text-[11px] text-white/60">Product preview</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/85">
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
                Helldivers 2 · PC · Tonight
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
                  MV
                </div>
                <div>
                  <p className="font-[family-name:var(--font-display)] text-base font-bold text-[var(--color-night-navy)]">
                    Mara_V
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
              {[
                "Plays Helldivers 2",
                "PC cross-play",
                "Weeknights after 7",
              ].map((reason) => (
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
              ))}
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
                Still need a fourth for Saturday?
              </span>
              <span className="ml-9 self-end rounded-xl rounded-br-sm bg-[var(--color-lobby-teal)] px-3 py-2 text-white">
                Yep — 8 PM works. Same squad as last week?
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
                    Helldivers 2 · Saturday · 8:00 PM
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
        className="absolute -right-3 -bottom-5 hidden items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white shadow-[0_16px_40px_rgba(2,8,20,0.45)] backdrop-blur-md sm:flex"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--color-signal-mint)] text-[var(--color-lobby-teal)]">
          <Icon name="people" className="h-3.5 w-3.5" />
        </span>
        Built for playing again
      </div>
    </figure>
  );
}

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[var(--color-night-navy)] text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 78% 12%, rgba(11,107,99,.5), transparent 40%)",
        }}
      />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pt-16 pb-20 sm:px-8 sm:pt-20 sm:pb-24 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:pt-24 lg:pb-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#8ce0d0]">
            <Icon name="people" className="h-3.5 w-3.5" />
            Platonic gaming friends and teammates · For gamers 18+
          </span>
          <h1 className="mt-6 max-w-2xl font-[family-name:var(--font-display)] text-4xl leading-[1.04] font-bold tracking-[-0.04em] sm:text-5xl lg:text-[3.65rem]">
            Meet gamers you&apos;ll actually want to{" "}
            <span className="text-[#8ce0d0]">play with again</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/70">
            Find gamers who share your games, can play on a compatible platform,
            and are available when you are. Connect by mutual choice, plan a
            session, and keep playing beyond one lobby.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex min-h-[var(--touch-min)] items-center justify-center gap-2 rounded-xl bg-[var(--color-signal-mint)] px-5 py-3.5 font-semibold text-[var(--color-night-navy)] shadow-[0_12px_36px_rgba(140,224,208,0.28)] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-signal-mint)]"
            >
              Create your free profile
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex min-h-[var(--touch-min)] items-center justify-center rounded-xl border border-white/20 bg-white/5 px-5 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:border-[#8ce0d0] hover:text-[#8ce0d0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-signal-mint)]"
            >
              See how SameLobby works
            </Link>
          </div>
          <ul
            className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/70"
            aria-label="SameLobby trust commitments"
          >
            {[
              "Adults 18+",
              "Private connections",
              "No swiping",
              "No paid boosts",
            ].map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-white/10 text-[#8ce0d0]">
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
  );
}
