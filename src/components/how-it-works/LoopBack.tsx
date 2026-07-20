import { Icon, type IconName } from "@/components/landing/icons";

const LOOP_PATH =
  "M200 44 a156 156 0 1 1 0 312 a156 156 0 1 1 0 -312";

const loopNodes: Array<{
  icon: IconName;
  label: string;
  left: string;
  top: string;
}> = [
  { icon: "search", label: "Discover", left: "50%", top: "3.5%" },
  { icon: "user-plus", label: "Connect", left: "94.2%", top: "35.6%" },
  { icon: "chat", label: "Talk", left: "77.3%", top: "87.6%" },
  { icon: "game", label: "Play", left: "22.7%", top: "87.6%" },
  { icon: "repeat", label: "Continue", left: "5.8%", top: "35.6%" },
];

const continuityPoints: Array<{ icon: IconName; label: string }> = [
  { icon: "people", label: "Regular teammates who know how you play" },
  { icon: "lock", label: "Private groups that stay between you" },
  { icon: "bell", label: "Session reminders that keep the plan alive" },
];

export function LoopBack() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-night-navy)] py-20 text-white sm:py-24">
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 h-px w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-[var(--color-lobby-teal)]/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-24 -bottom-40 h-80 w-80 rounded-full bg-[#8ce0d0]/10 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <div className="reveal">
          <span className="text-xs font-bold tracking-[0.16em] text-[#8ce0d0] uppercase">
            Beyond the first lobby
          </span>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-tight font-bold tracking-[-0.03em] sm:text-4xl">
            SameLobby isn&apos;t built for one match. It&apos;s built for the
            tenth.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/70">
            Step five loops straight back into the next session. Every time
            you play, your crew gets a little more permanent — and finding
            people stops being a chore you repeat alone.
          </p>
          <ul className="mt-8 space-y-3.5">
            {continuityPoints.map((point) => (
              <li key={point.label} className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-[#8ce0d0]">
                  <Icon name={point.icon} className="h-4 w-4" />
                </span>
                <span className="text-sm text-white/80">{point.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <figure className="reveal relative mx-auto aspect-square w-full max-w-[340px] sm:max-w-[420px]">
          <figcaption className="sr-only">
            A circular diagram of the SameLobby loop: Discover, Connect, Talk,
            Play, and Continue feed into each other around a center card that
            reads Play again.
          </figcaption>
          <svg
            aria-hidden="true"
            className="block h-full w-full"
            viewBox="0 0 400 400"
            fill="none"
          >
            <defs>
              <linearGradient
                id="loopGradient"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0%" stopColor="#0b6b63" />
                <stop offset="55%" stopColor="#8ce0d0" />
                <stop offset="100%" stopColor="#d9f1ec" />
              </linearGradient>
            </defs>
            <path
              d={LOOP_PATH}
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="2"
            />
            <path
              d={LOOP_PATH}
              className="animate-dash"
              stroke="url(#loopGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="2 20"
            />
            <g className="smil-pulse">
              <circle r="9" fill="#8ce0d0" opacity="0.22">
                <animateMotion dur="9s" repeatCount="indefinite" path={LOOP_PATH} />
              </circle>
              <circle r="3.5" fill="#d9f1ec">
                <animateMotion dur="9s" repeatCount="indefinite" path={LOOP_PATH} />
              </circle>
            </g>
          </svg>

          <div
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center"
          >
            <div className="rounded-2xl border border-white/15 bg-white/[0.07] px-6 py-5 text-center shadow-[0_24px_60px_rgba(2,8,20,0.45)] backdrop-blur-md">
              <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-signal-mint)] text-[var(--color-lobby-teal)]">
                <Icon name="repeat" className="h-5 w-5" />
              </span>
              <p className="mt-3 font-[family-name:var(--font-display)] text-lg font-bold">
                Play again
              </p>
              <p className="mt-1 text-[11px] text-white/60">
                Saturday 8:00 PM · Friday Squad
              </p>
            </div>
          </div>

          {loopNodes.map((node) => (
            <div
              key={node.label}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: node.left, top: node.top }}
            >
              <span className="relative grid h-9 w-9 place-items-center rounded-full border border-[#8ce0d0]/40 bg-[var(--color-night-navy)] text-[#8ce0d0] shadow-[0_0_0_5px_rgba(11,22,40,0.9)] sm:h-11 sm:w-11">
                <Icon
                  name={node.icon}
                  className="h-4 w-4 sm:h-[18px] sm:w-[18px]"
                />
              </span>
              <span className="absolute top-full left-1/2 mt-1 -translate-x-1/2 text-[9px] font-bold tracking-[0.12em] whitespace-nowrap text-white/70 uppercase sm:text-[10px]">
                {node.label}
              </span>
            </div>
          ))}
        </figure>
      </div>
    </section>
  );
}
