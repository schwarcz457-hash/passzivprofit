"use client";

import { useTranslations } from "next-intl";
import { UserPlus, Coins, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export function HowItWorks() {
  const t = useTranslations("HowItWorks");

  const steps = [
    {
      icon: UserPlus,
      num: "01",
      title: t("steps.step1.title"),
      desc: t("steps.step1.description"),
    },
    {
      icon: Coins,
      num: "02",
      title: t("steps.step2.title"),
      desc: t("steps.step2.description"),
    },
    {
      icon: BarChart3,
      num: "03",
      title: t("steps.step3.title"),
      desc: t("steps.step3.description"),
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-black/40 relative">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8 }}
           className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-premiumWhite mb-4">
            {t("title")}
          </h2>
          <div className="w-24 h-1 bg-metallicGold mx-auto rounded-full" />
        </motion.div>

        <div className="flex flex-col md:flex-row gap-12 relative">
          {/* Connector Line for Desktop */}
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-metallicGold/30 to-transparent z-0" />

          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.2 }}
              className="flex-1 relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 rounded-full bg-charcoal border-2 border-metallicGold flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                <step.icon className="w-10 h-10 text-metallicGold" />
              </div>
              <div className="text-sm font-bold tracking-widest text-metallicGold/70 mb-2">
                STEP {step.num}
              </div>
              <h3 className="text-2xl font-playfair font-semibold text-premiumWhite mb-3">
                {step.title}
              </h3>
              <p className="text-premiumWhite/70 font-inter leading-relaxed max-w-xs mx-auto">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
