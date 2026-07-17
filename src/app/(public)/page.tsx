import type { Metadata } from "next";
import { Faq } from "@/components/landing/Faq";
import { FinalCta } from "@/components/landing/FinalCta";
import { FitFeatures } from "@/components/landing/FitFeatures";
import { FreeTier } from "@/components/landing/FreeTier";
import { Hero } from "@/components/landing/Hero";
import { Loop } from "@/components/landing/Loop";
import { Trust } from "@/components/landing/Trust";

export const metadata: Metadata = {
  title: "Find gaming friends who fit your life",
  description:
    "Meet compatible gamers, connect by mutual choice, plan a session, and keep playing beyond one lobby. SameLobby is for gamers 18+.",
};

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <Hero />
      <FitFeatures />
      <Loop />
      <Trust />
      <FreeTier />
      <Faq />
      <FinalCta />
    </main>
  );
}
