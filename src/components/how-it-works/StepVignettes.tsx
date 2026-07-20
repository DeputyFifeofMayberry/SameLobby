import { Icon } from "@/components/landing/icons";

function VignetteFrame({
  caption,
  children,
}: {
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="relative">
      <figcaption className="sr-only">{caption}</figcaption>
      <div
        aria-hidden="true"
        className="rounded-[24px] border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-md)]"
      >
        <div className="rounded-[18px] bg-[#eef4f3] p-3.5 sm:p-4">
          {children}
        </div>
      </div>
    </figure>
  );
}

export function SetupVignette() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const slots: Array<{ label: string; on: boolean[] }> = [
    { label: "Aft", on: [false, true, false, true, false, true, false] },
    { label: "Eve", on: [true, true, false, true, false, true, true] },
  ];

  return (
    <VignetteFrame caption="Profile setup showing selected games, PC with cross-play enabled, an availability grid, and a current intent of Helldivers 2 tonight.">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-[#d7e5e2] bg-white/80 px-3 py-2.5">
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

      <div className="mt-3 rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-sm)]">
        <p className="text-[10px] font-bold tracking-[0.14em] text-[var(--color-text-slate)] uppercase">
          Your games
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-lobby-teal)] px-2 py-1 text-[10px] font-semibold text-white">
            <Icon name="game" className="h-3 w-3" />
            Helldivers 2
          </span>
          {["Rocket League", "Stardew Valley"].map((game) => (
            <span
              key={game}
              className="inline-flex items-center gap-1 rounded-full bg-[var(--color-cloud)] px-2 py-1 text-[10px] font-medium text-[var(--color-text-slate)]"
            >
              <Icon name="game" className="h-3 w-3" />
              {game}
            </span>
          ))}
        </div>

        <p className="mt-4 text-[10px] font-bold tracking-[0.14em] text-[var(--color-text-slate)] uppercase">
          Platforms
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-[var(--color-cloud)] px-2 py-1 text-[10px] font-medium text-[var(--color-text-slate)]">
            PC
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-cloud)] px-2 py-1 text-[10px] font-medium text-[var(--color-text-slate)]">
            <Icon
              name="check"
              className="h-3 w-3 text-[var(--color-lobby-teal)]"
            />
            Cross-play OK
          </span>
        </div>

        <p className="mt-4 text-[10px] font-bold tracking-[0.14em] text-[var(--color-text-slate)] uppercase">
          Availability
        </p>
        <div className="mt-2 grid grid-cols-[1.75rem_repeat(7,1fr)] items-center gap-1">
          <span />
          {days.map((day, index) => (
            <span
              key={`day-${index}`}
              className="text-center text-[9px] font-bold text-[var(--color-text-slate)]"
            >
              {day}
            </span>
          ))}
          {slots.map((row) => (
            <div key={row.label} className="contents">
              <span className="text-[9px] font-medium text-[var(--color-text-slate)]">
                {row.label}
              </span>
              {row.on.map((on, index) => (
                <span
                  key={`${row.label}-${index}`}
                  className={`h-4 rounded ${
                    on
                      ? "bg-[var(--color-lobby-teal)]"
                      : "border border-[var(--color-border)] bg-[var(--color-cloud)]"
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </VignetteFrame>
  );
}

export function RecommendVignette() {
  return (
    <VignetteFrame caption="A recommended gamer card for Mara_V with visible reasons: plays Helldivers 2, PC cross-play, and weeknights after 7.">
      <div className="relative">
        <div className="absolute inset-x-3 top-3 rounded-2xl border border-[var(--color-border)] bg-white/70 p-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-[var(--color-cloud)]" />
            <div className="flex-1">
              <div className="h-2.5 w-24 rounded bg-[var(--color-cloud)]" />
              <div className="mt-2 h-2 w-32 rounded bg-[var(--color-cloud)]" />
            </div>
          </div>
        </div>

        <article className="relative mt-6 rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-md)] sm:p-5">
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
            {["Plays Helldivers 2", "PC cross-play", "Weeknights after 7"].map(
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

          <div className="mt-4 flex gap-2">
            <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--color-lobby-teal)] px-3 py-2 text-[11px] font-semibold text-white">
              <Icon name="user-plus" className="h-3.5 w-3.5" />
              Send request
            </span>
            <span className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] px-3 py-2 text-[11px] font-semibold text-[var(--color-text-slate)]">
              View profile
            </span>
          </div>
        </article>
      </div>
    </VignetteFrame>
  );
}

export function ConnectVignette() {
  return (
    <VignetteFrame caption="A connection request from Mara_V with accept and decline choices, followed by a confirmation that the conversation is unlocked.">
      <article className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-sm)] sm:p-5">
        <p className="text-[10px] font-bold tracking-[0.14em] text-[var(--color-lobby-teal)] uppercase">
          Connection request
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--color-night-navy)] font-[family-name:var(--font-display)] text-sm font-bold text-white">
            MV
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-night-navy)]">
              Mara_V wants to connect
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--color-text-slate)]">
              Sent 2 minutes ago
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--color-lobby-teal)] px-3 py-2 text-[11px] font-semibold text-white">
            <Icon name="check" className="h-3.5 w-3.5" />
            Accept
          </span>
          <span className="inline-flex flex-1 items-center justify-center rounded-lg border border-[var(--color-border)] px-3 py-2 text-[11px] font-semibold text-[var(--color-text-slate)]">
            Decline
          </span>
        </div>
      </article>

      <div className="mx-auto my-1 flex h-6 w-6 items-center justify-center">
        <Icon
          name="arrow"
          className="h-4 w-4 rotate-90 text-[var(--color-lobby-teal)]"
        />
      </div>

      <div className="rounded-2xl border border-[#d5e4e1] bg-[#fafffe] p-3.5 shadow-[var(--shadow-sm)]">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-night-navy)]">
          <span className="grid h-6 w-6 place-items-center rounded-lg bg-[var(--color-signal-mint)] text-[var(--color-lobby-teal)]">
            <Icon name="chat" className="h-3.5 w-3.5" />
          </span>
          Accepted · Conversation unlocked
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-[var(--color-text-slate)]">
          <Icon name="lock" className="h-3 w-3" />
          Messaging stays closed until both of you say yes
        </div>
      </div>
    </VignetteFrame>
  );
}

export function PlanVignette() {
  return (
    <VignetteFrame caption="A private conversation planning a session, with a play invitation for Helldivers 2 on Saturday at 8 PM and a reminder set for one hour before.">
      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-sm)]">
        <div className="flex flex-col gap-1.5 text-[11px]">
          <span className="mr-9 self-start rounded-xl rounded-bl-sm bg-[var(--color-cloud)] px-3 py-2 text-[var(--color-text-slate)]">
            Still need a fourth for Saturday?
          </span>
          <span className="ml-9 self-end rounded-xl rounded-br-sm bg-[var(--color-lobby-teal)] px-3 py-2 text-white">
            Yep — 8 PM works. Sending an invite now.
          </span>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-[#d5e4e1] bg-[#fafffe] p-3.5 shadow-[var(--shadow-sm)]">
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
        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-[var(--color-signal-mint)]/60 px-2.5 py-1.5 text-[10px] font-medium text-[var(--color-night-navy)]">
          <Icon
            name="bell"
            className="h-3 w-3 text-[var(--color-lobby-teal)]"
          />
          Reminder set · 1 hour before
        </div>
      </div>
    </VignetteFrame>
  );
}

export function CrewVignette() {
  const members = [
    { initials: "MV", name: "Mara_V", detail: "Helldivers 2 · PC", tag: "Regular teammate" },
    { initials: "JX", name: "Jax_RL", detail: "Rocket League · Cross-play", tag: "Teammate" },
    { initials: "PP", name: "PriyaPlays", detail: "Stardew Valley · PC", tag: "New" },
  ];

  return (
    <VignetteFrame caption="A private group called Friday Squad with four members, a list of teammates, and a next session scheduled for Saturday at 8 PM.">
      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-sm)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-night-navy)] text-[#8ce0d0]">
              <Icon name="people" className="h-5 w-5" />
            </span>
            <div>
              <p className="font-[family-name:var(--font-display)] text-sm font-bold text-[var(--color-night-navy)]">
                Friday Squad
              </p>
              <p className="mt-0.5 text-[10px] text-[var(--color-text-slate)]">
                Private group · 4 members
              </p>
            </div>
          </div>
          <span className="rounded-full bg-[var(--color-signal-mint)] px-2 py-1 text-[10px] font-bold text-[var(--color-lobby-teal)]">
            Active
          </span>
        </div>

        <ul className="mt-4 space-y-2.5">
          {members.map((member) => (
            <li key={member.name} className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--color-cloud)] text-[10px] font-bold text-[var(--color-night-navy)]">
                {member.initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-[var(--color-night-navy)]">
                  {member.name}
                </span>
                <span className="block truncate text-[10px] text-[var(--color-text-slate)]">
                  {member.detail}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-[var(--color-cloud)] px-2 py-0.5 text-[9px] font-semibold text-[var(--color-text-slate)]">
                {member.tag}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-[#d5e4e1] bg-[#fafffe] p-3.5 shadow-[var(--shadow-sm)]">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-[var(--color-night-navy)]">
          <Icon
            name="calendar"
            className="h-3.5 w-3.5 text-[var(--color-lobby-teal)]"
          />
          Next session · Saturday 8:00 PM
        </div>
        <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-lobby-teal)] px-2 py-1 text-[9px] font-semibold text-white">
          <Icon name="repeat" className="h-3 w-3" />
          Play again
        </span>
      </div>
    </VignetteFrame>
  );
}
