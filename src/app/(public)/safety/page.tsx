import type { Metadata } from "next";
import { FinalCta } from "@/components/landing/FinalCta";
import { CommunityRules } from "@/components/safety/CommunityRules";
import { EmergencyNotice } from "@/components/safety/EmergencyNotice";
import { ModerationFlow } from "@/components/safety/ModerationFlow";
import { SafetyFaq } from "@/components/safety/SafetyFaq";
import { SafetyHero } from "@/components/safety/SafetyHero";
import { VisibilityModel } from "@/components/safety/VisibilityModel";
import { YourControls } from "@/components/safety/YourControls";

export const metadata: Metadata = {
  title: "Safety Center",
  description:
    "SameLobby is for gamers 18+ looking for platonic gaming friends and teammates. Block and report controls, human review with appeals, and clear layers for who can see what.",
};

export default function SafetyPage() {
  return (
    <main className="overflow-hidden">
      <SafetyHero />
      <EmergencyNotice />
      <CommunityRules />
      <YourControls />
      <ModerationFlow />
      <VisibilityModel />
      <SafetyFaq />
      <FinalCta />
    </main>
  );
}
