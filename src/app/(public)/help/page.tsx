import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Help",
  description: "Frequently asked questions about SameLobby.",
};

const FAQ = [
  {
    q: "Who is SameLobby for?",
    a: "Adults 18+ looking for platonic gaming friends and teammates. SameLobby is not a dating app.",
  },
  {
    q: "How does discovery work?",
    a: "Complete your profile, set a current intent, and browse recommendations in your game cohort. You can pause discovery anytime from your profile.",
  },
  {
    q: "What is SameLobby Plus?",
    a: "Plus adds organization tools like more active games, private groups, and saved searches. It does not increase your visibility in discovery.",
  },
  {
    q: "How do I report someone?",
    a: "Use the Report button in a conversation or on a profile. Blocking is separate and immediate.",
  },
  {
    q: "How do I delete my account?",
    a: "Go to Settings → Account and request deletion. You have 30 days to cancel before data is purged.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-12">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Help & FAQ
        </h1>
        <p className="mt-2 text-[var(--color-text-slate)]">
          Quick answers for beta players. More guides coming before public
          launch.
        </p>
      </div>

      <dl className="space-y-6">
        {FAQ.map((item) => (
          <div key={item.q}>
            <dt className="font-semibold">{item.q}</dt>
            <dd className="mt-2 text-[var(--color-text-slate)]">{item.a}</dd>
          </div>
        ))}
      </dl>

      <p className="text-sm">
        <Link
          href="/safety"
          className="text-[var(--color-lobby-teal)] underline"
        >
          Safety & moderation
        </Link>
        {" · "}
        <Link
          href="/pricing"
          className="text-[var(--color-lobby-teal)] underline"
        >
          Pricing
        </Link>
      </p>
    </div>
  );
}
