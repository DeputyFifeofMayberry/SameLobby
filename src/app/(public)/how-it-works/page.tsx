import type { Metadata } from "next";
import { Benefits } from "@/components/how-it-works/Benefits";
import { FreeStrip } from "@/components/how-it-works/FreeStrip";
import { HowFaq } from "@/components/how-it-works/HowFaq";
import { HowHero } from "@/components/how-it-works/HowHero";
import { LoopBack } from "@/components/how-it-works/LoopBack";
import { StepsDeepDive } from "@/components/how-it-works/StepsDeepDive";
import { FinalCta } from "@/components/landing/FinalCta";

export const metadata: Metadata = {
  title: "How SameLobby works",
  description:
    "Five simple steps from setting up your profile to playing with a regular crew. See exactly how SameLobby helps gamers 18+ find compatible teammates — free.",
};

export default function HowItWorksPage() {
  return (
    <main className="overflow-hidden">
      <HowHero />
      <StepsDeepDive />
      <Benefits />
      <LoopBack />
      <FreeStrip />
      <HowFaq />
      <FinalCta />
    </main>
  );
}
