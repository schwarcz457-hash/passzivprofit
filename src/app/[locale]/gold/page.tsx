import { setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Benefits } from "@/components/Benefits";
import { HowItWorks } from "@/components/HowItWorks";

import { TrustSignals } from "@/components/TrustSignals";
import { LeadForm } from "@/components/LeadForm";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex flex-col min-h-screen bg-charcoal selection:bg-metallicGold/30 selection:text-premiumWhite">
      <Navbar />
      <Hero />
      <TrustSignals />
      <Benefits />
      <HowItWorks />

      <LeadForm />
    </main>
  );
}
