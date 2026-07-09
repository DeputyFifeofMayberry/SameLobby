"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Checkbox({ className, label, id, name, value, ...props }: CheckboxProps) {
  const fallbackId = useId();
  const inputId =
    id ??
    (name != null && value != null ? `${String(name)}-${String(value)}` : fallbackId);
  return (
    <label
      htmlFor={inputId}
      className={cn(
        "flex min-h-[var(--touch-min)] cursor-pointer items-center gap-3 text-sm",
        className,
      )}
    >
      <input
        id={inputId}
        type="checkbox"
        name={name}
        value={value}
        className="h-4 w-4 rounded border-[var(--color-border)]"
        {...props}
      />
      {label}
    </label>
  );
}
