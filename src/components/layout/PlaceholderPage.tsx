export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        {title}
      </h1>
      <p className="mt-2 text-[var(--color-text-slate)]">
        Coming in a later vertical slice.
      </p>
    </div>
  );
}
