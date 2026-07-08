import { PublicNav } from "@/components/layout/PublicNav";
import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicNav />
      {children}
      <footer className="border-t border-[var(--color-border)] bg-white py-8">
        <div className="mx-auto flex max-w-5xl flex-wrap gap-4 px-4 text-sm text-[var(--color-text-slate)]">
          <Link href="/safety">Safety Center</Link>
          <Link href="/how-it-works">How it works</Link>
          <span>Adults 18+ · Private connections · No swiping</span>
        </div>
      </footer>
    </>
  );
}
