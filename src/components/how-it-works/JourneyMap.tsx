import { Icon, type IconName } from "@/components/landing/icons";

const JOURNEY_PATH =
  "M40 180 C 90 180, 100 70, 150 70 C 200 70, 210 150, 260 150 C 310 150, 330 60, 380 60 C 430 60, 455 110, 510 110";

const journeyNodes: Array<{
  icon: IconName;
  label: string;
  left: string;
  top: string;
}> = [
  { icon: "search", label: "Discover", left: "7.1%", top: "75%" },
  { icon: "user-plus", label: "Connect", left: "26.8%", top: "29.2%" },
  { icon: "chat", label: "Talk", left: "46.4%", top: "62.5%" },
  { icon: "game", label: "Play", left: "67.9%", top: "25%" },
  { icon: "repeat", label: "Continue", left: "91.1%", top: "45.8%" },
];

const floatingChips = [
  { label: "PC cross-play", className: "-top-4 right-6" },
  { label: "Weeknights after 7", className: "-bottom-4 left-8" },
];

export function JourneyMap() {
  return (
    <figure className="animate-float relative mx-auto w-full max-w-[560px] lg:mx-0 lg:ml-auto">
      <figcaption className="sr-only">
        Diagram of the SameLobby loop: a glowing path connects five steps —
        Discover, Connect, Talk, Play, and Continue — showing how one session
        leads to playing together again.
      </figcaption>
      <div
        aria-hidden="true"
        className="absolute -top-12 -left-12 h-52 w-52 rounded-full bg-[var(--color-lobby-teal)] opacity-40 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="relative overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.07] p-3 shadow-[0_40px_90px_rgba(2,8,20,0.55)] backdrop-blur-xl sm:p-4"
      >
        <div className="flex items-center justify-between px-2 pt-1 pb-2 text-white">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-[#8ce0d0]">
              <Icon name="repeat" className="h-4 w-4" />
            </span>
            <div>
              <p className="font-[family-name:var(--font-display)] text-sm font-bold">
                Your SameLobby loop
              </p>
              <p className="text-[11px] text-white/60">Five simple steps</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/85">
            <span className="h-1.5 w-1.5 rounded-full bg-[#61d6bf]" />
            Free to start
          </span>
        </div>

        <div className="relative rounded-[20px] bg-[#0e1c33]/80 px-2 pt-6 pb-8 sm:px-4">
          <svg
            aria-hidden="true"
            className="block h-auto w-full"
            viewBox="0 0 560 240"
            fill="none"
          >
            <defs>
              <linearGradient
                id="journeyGradient"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop offset="0%" stopColor="#0b6b63" />
                <stop offset="55%" stopColor="#8ce0d0" />
                <stop offset="100%" stopColor="#d9f1ec" />
              </linearGradient>
            </defs>
            <path
              d={JOURNEY_PATH}
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="2"
            />
            <path
              d={JOURNEY_PATH}
              className="animate-dash"
              stroke="url(#journeyGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="2 20"
            />
            <g className="smil-pulse">
              <circle r="9" fill="#8ce0d0" opacity="0.22">
                <animateMotion dur="7s" repeatCount="indefinite" path={JOURNEY_PATH} />
              </circle>
              <circle r="3.5" fill="#d9f1ec">
                <animateMotion dur="7s" repeatCount="indefinite" path={JOURNEY_PATH} />
              </circle>
            </g>
          </svg>

          {journeyNodes.map((node) => (
            <div
              key={node.label}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: node.left, top: node.top }}
            >
              <span className="relative grid h-10 w-10 place-items-center rounded-full border border-[#8ce0d0]/40 bg-[var(--color-night-navy)] text-[#8ce0d0] shadow-[0_0_0_5px_rgba(11,22,40,0.9)] sm:h-11 sm:w-11">
                <Icon name={node.icon} className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
              </span>
              <span className="absolute top-full left-1/2 mt-1.5 -translate-x-1/2 text-[9px] font-bold tracking-[0.12em] whitespace-nowrap text-white/70 uppercase sm:text-[10px]">
                {node.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {floatingChips.map((chip, index) => (
        <div
          key={chip.label}
          aria-hidden="true"
          className={`animate-float absolute ${chip.className} hidden items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_16px_40px_rgba(2,8,20,0.45)] backdrop-blur-md sm:flex`}
          style={{ animationDelay: `${index * 1.4}s` }}
        >
          <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--color-signal-mint)] text-[var(--color-lobby-teal)]">
            <Icon name="check" className="h-3 w-3" />
          </span>
          {chip.label}
        </div>
      ))}
    </figure>
  );
}
