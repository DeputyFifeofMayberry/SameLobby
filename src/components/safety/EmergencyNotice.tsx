import { Icon } from "@/components/landing/icons";

export function EmergencyNotice() {
  return (
    <section className="bg-white py-12 sm:py-14" aria-label="Emergency notice">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <div className="reveal flex flex-col gap-4 rounded-2xl border border-[#f0ddba] border-l-4 border-l-[var(--color-warm-amber)] bg-[#fdf8ee] p-5 sm:flex-row sm:items-center sm:gap-5 sm:p-6">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--color-warm-amber)]/15 text-[var(--color-warm-amber)]">
            <Icon name="alert" className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-base font-bold text-[var(--color-night-navy)]">
              If you are in immediate danger, contact local emergency services
              first.
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--color-text-slate)]">
              SameLobby does not provide emergency monitoring. Block, report,
              and human review are here for everything that happens on the
              platform.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
