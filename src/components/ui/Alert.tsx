import { cn } from "@/lib/utils";

type AlertProps = {
  variant?: "error" | "info" | "success";
  children: React.ReactNode;
  className?: string;
  role?: "alert" | "status";
  id?: string;
};

const styles = {
  error:
    "border-[var(--color-error)] bg-[var(--color-error-bg)] text-[var(--color-error)]",
  info: "border-[var(--color-border)] bg-white text-[var(--color-text-slate)]",
  success:
    "border-[var(--color-lobby-teal)] bg-[var(--color-signal-mint)] text-[var(--color-night-navy)]",
};

export function Alert({
  variant = "info",
  children,
  className,
  role = "status",
  id,
}: AlertProps) {
  return (
    <div
      id={id}
      role={role}
      className={cn(
        "rounded-[var(--radius-md)] border px-4 py-3 text-sm",
        styles[variant],
        className,
      )}
    >
      {children}
    </div>
  );
}
