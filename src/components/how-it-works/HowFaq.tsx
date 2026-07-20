const faqs = [
  {
    question: "Is SameLobby free to use?",
    answer:
      "Yes. Every step on this page — discovery, connections, private messaging, play invitations, and one private group — is included with SameLobby Free. SameLobby Plus adds organization and continuity tools; it never changes who sees you or how you rank.",
  },
  {
    question: "How does SameLobby choose who to show me?",
    answer:
      "Recommendations use practical compatibility signals: shared games, playable platforms including cross-play, availability overlap, current intent, and the interaction preferences you choose to share. Every recommendation shows its reasons, so you can judge the fit yourself.",
  },
  {
    question: "What happens after I send a connection request?",
    answer:
      "The other gamer accepts or declines. Private messaging opens only on acceptance — so you never receive messages from someone you didn't choose, and neither do they.",
  },
  {
    question: "Can I take a break without deleting my account?",
    answer:
      "Yes. Pause discovery anytime and you stop appearing in recommendations until you're back. Your connections, teammates, and groups stay exactly where you left them.",
  },
  {
    question: "Is SameLobby a dating app?",
    answer:
      "No. SameLobby is for platonic gaming friends and teammates, for gamers 18+. Dating and sexual solicitation are not allowed.",
  },
];

export function HowFaq() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <div className="reveal text-center">
          <span className="text-xs font-bold tracking-[0.16em] text-[var(--color-lobby-teal)] uppercase">
            Before you start
          </span>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-0.03em] text-[var(--color-night-navy)] sm:text-4xl">
            Fair questions, straight answers.
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
      </div>
    </section>
  );
}
