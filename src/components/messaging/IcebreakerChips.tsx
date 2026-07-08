"use client";

type IcebreakerChipsProps = {
  suggestions: string[];
  onSelect: (text: string) => void;
  disabled?: boolean;
};

export function IcebreakerChips({
  suggestions,
  onSelect,
  disabled = false,
}: IcebreakerChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Icebreakers</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Icebreaker suggestions">
        {suggestions.map((text) => (
          <button
            key={text}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(text)}
            className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-sm text-[var(--color-text-slate)] hover:bg-[var(--color-cloud)] disabled:opacity-50"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
