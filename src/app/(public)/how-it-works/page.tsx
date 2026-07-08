export default function HowItWorksPage() {
  const steps = [
    "Tell us what you play and what kind of connection you want now.",
    "Meet relevant gamers with clear compatibility reasons.",
    "Connect by mutual choice — messaging opens after acceptance.",
    "Invite someone to play when it works for both of you.",
    "Keep your people together across games and schedule changes.",
  ];
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">How SameLobby works</h1>
      <ol className="mt-8 list-decimal space-y-4 pl-6">
        {steps.map((step) => (
          <li key={step} className="text-[var(--color-text-slate)]">
            {step}
          </li>
        ))}
      </ol>
    </main>
  );
}
