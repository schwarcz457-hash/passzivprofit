"use client";

import { useTranslations } from "next-intl";
import { ShieldCheck, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export function Benefits() {
  const t = useTranslations("Benefits");

  const benefits = [
    {
      icon: TrendingUp,
      title: t("items.inflation.title"),
      desc: t("items.inflation.description"),
      bg: "https://images.unsplash.com/photo-1611974789855-9c2a0a2236b0?q=80&w=1000&auto=format&fit=crop"
    },
    {
      icon: TrendingUp,
      title: t("items.passive.title"),
      desc: t("items.passive.description"),
      bg: "https://images.unsplash.com/photo-1587825027984-c46764298c8c?q=80&w=1000&auto=format&fit=crop"
    },
    {
      icon: ShieldCheck,
      title: t("items.security.title"),
      desc: t("items.security.description"),
      bg: "https://images.unsplash.com/photo-1621503926887-25e1fe72c676?q=80&w=1000&auto=format&fit=crop"
    }
  ];

  return (
    <section id="benefits" className="py-24 bg-charcoal relative">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8 }}
           className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-premiumWhite mb-4">
            {t("title")}
          </h2>
          <div className="w-24 h-1 bg-metallicGold mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className="relative p-8 rounded-2xl border border-white/10 hover:border-metallicGold/30 transition-all duration-300 group overflow-hidden min-h-[320px] flex flex-col justify-end"
            >
              <Image
                src={benefit.bg}
                alt={benefit.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-30 mix-blend-luminosity hover:mix-blend-normal hover:opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/80 to-transparent" />

              <div className="relative z-10 w-full">
                <div className="w-14 h-14 rounded-full bg-charcoal/50 backdrop-blur-sm border border-metallicGold/20 flex items-center justify-center mb-6 group-hover:bg-metallicGold/20 transition-colors">
                  <benefit.icon className="w-7 h-7 text-metallicGold" />
                </div>
                <h3 className="text-xl font-playfair font-semibold text-premiumWhite mb-3 drop-shadow-lg">
                  {benefit.title}
                </h3>
                <p className="text-premiumWhite/80 font-inter leading-relaxed text-sm drop-shadow-md">
                  {benefit.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
