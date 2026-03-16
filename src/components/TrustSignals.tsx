"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, Building2, ShieldCheck } from "lucide-react";

export function TrustSignals() {
  const t = useTranslations("TrustSignals");

  const signals = [
    {
      icon: CheckCircle2,
      text: t("goodDelivery")
    },
    {
      icon: Building2,
      text: t("vaults")
    },
    {
      icon: ShieldCheck,
      text: t("audit")
    }
  ];

  return (
    <section className="py-16 bg-charcoal border-y border-white/5 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 max-w-6xl mx-auto">
          {/* Title */}
          <div className="text-center md:text-left md:w-1/3">
            <h3 className="text-2xl font-playfair font-semibold text-metallicGold mb-2">
              {t("title")}
            </h3>
            <div className="w-16 h-0.5 bg-white/20 mx-auto md:mx-0" />
          </div>

          {/* Signals Grid */}
          <div className="flex flex-col sm:flex-row gap-8 md:gap-12 md:w-2/3 justify-end w-full">
            {signals.map((signal, idx) => (
              <div key={idx} className="flex items-center gap-4 text-left group">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-metallicGold/10 transition-colors">
                  <signal.icon className="w-6 h-6 text-metallicGold" />
                </div>
                <p className="text-sm font-medium text-premiumWhite/80 leading-snug max-w-[180px]">
                  {signal.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
