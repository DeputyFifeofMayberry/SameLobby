import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "public" | "match" | "connection" | "neutral";
  className?: string;
};

const variants = {
  public: "bg-[var(--color-signal-mint)] text-[var(--color-night-navy)]",
  match: "bg-[var(--color-cloud)] text-[var(--color-text-slate)]",
  connection: "bg-[var(--color-lobby-teal)]/10 text-[var(--color-lobby-teal)]",
  neutral: "bg-[var(--color-cloud)] text-[var(--color-text-slate)]",
};

export function Badge({
  children,
  variant = "neutral",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
