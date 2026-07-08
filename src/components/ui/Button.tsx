import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
};

const variants = {
  primary:
    "bg-[var(--color-lobby-teal)] text-white hover:opacity-90",
  secondary:
    "border border-[var(--color-lobby-teal)] text-[var(--color-lobby-teal)] bg-white hover:bg-[var(--color-signal-mint)]",
  ghost: "text-[var(--color-text-slate)] hover:bg-[var(--color-cloud)]",
  destructive:
    "bg-[var(--color-error)] text-white hover:opacity-90",
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-[var(--touch-min)] items-center justify-center rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
