const faqs = [
  {
    question: "Is SameLobby a dating app?",
    answer:
      "No. SameLobby is for platonic gaming friends and teammates. Dating and sexual solicitation are not allowed.",
  },
  {
    question: "Who can message me?",
    answer:
      "Only people you accept. Messaging opens after you accept a connection request, and requests never appear inside Messages until you do. Unanswered requests expire after 14 days.",
  },
  {
    question: "What happens when I block someone?",
    answer:
      "Blocking is immediate and silent. A blocked player can't contact you or appear in your discovery results, and blocking is not a moderation finding. You can unblock anytime from Settings.",
  },
  {
    question: "What happens after I report?",
    answer:
      "You receive a case reference, and a human reviewer examines case-scoped evidence. You can follow the status — Received, Under review, Closed — in your Safety Center, and every notice protects reporter privacy.",
  },
  {
    question: "Do safety features cost anything?",
    answer:
      "No. SameLobby Plus adds organization tools — not visibility, ranking, or safety features. Safety tools are part of the product, not an upgrade.",
  },
  {
    question: "Do you monitor for emergencies?",
    answer:
      "No. We do not provide emergency monitoring. If you are in immediate danger, contact local emergency services.",
  },
];

export function SafetyFaq() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <div className="reveal text-center">
          <span className="text-xs font-bold tracking-[0.16em] text-[var(--color-lobby-teal)] uppercase">
            Questions, answered
          </span>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.03em] text-[var(--color-night-navy)] sm:text-4xl">
            Safety questions, straight answers.
          </h2>
        </div>
        <div className="reveal mt-10 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-5">
              <summary className="flex min-h-[var(--touch-min)] cursor-pointer list-none items-center justify-between gap-4 font-[family-name:var(--font-display)] text-base font-bold text-[var(--color-night-navy)] transition marker:content-none hover:text-[var(--color-lobby-teal)]">
                {faq.question}
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--color-cloud)] text-xl font-normal text-[var(--color-lobby-teal)] transition duration-300 group-open:rotate-45 group-open:bg-[var(--color-signal-mint)]">
                  +
                </span>
              </summary>
              <p className="max-w-2xl pr-12 pb-1 leading-7 text-[var(--color-text-slate)]">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
        <p className="reveal mt-8 text-center text-xs leading-5 text-[var(--color-text-slate)]">
          The full Terms of Service, Privacy Notice, and Community Standards
          will be published here before public registration opens.
        </p>
      </div>
    </section>
  );
}
