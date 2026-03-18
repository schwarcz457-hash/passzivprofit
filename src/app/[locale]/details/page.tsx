"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import NextImage from "next/image";
import { Shield, TrendingUp, Users, ArrowRight } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";

export default function DetailsPage() {
  const t = useTranslations("Details");

  const features = [
    {
      id: "security",
      icon: Shield,
      title: t("features.security.title"),
      description: t("features.security.description"),
    },
    {
      id: "discount",
      icon: TrendingUp,
      title: t("features.discount.title"),
      description: t("features.discount.description"),
    },
    {
      id: "affiliate",
      icon: Users,
      title: t("features.affiliate.title"),
      description: t("features.affiliate.description"),
    },
  ];

  return (
    <main className="min-h-screen bg-charcoal text-premiumWhite font-inter overflow-hidden">
      {/* Navigation / Header */}
      <div className="absolute top-6 right-6 z-50">
        <LanguageSelector />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 flex flex-col items-center text-center">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-metallicGold/10 blur-[120px] rounded-full pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-playfair font-bold mb-6">
            {t("hero.title")} <br />
            <span className="text-metallicGold">{t("hero.titleAccent")}</span>
          </h1>
          <p className="text-lg md:text-xl text-premiumWhite/70 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            {t("hero.description")}
          </p>
        </motion.div>
      </section>

      {/* Main Content Section: Image + Structured Text */}
      <section className="py-12 md:py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left: Elegant Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 relative aspect-square md:aspect-video lg:aspect-square rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/5"
          >
            <NextImage 
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1000" 
              alt={t("hero.title")}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Elegant overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-charcoal/40 to-transparent" />
          </motion.div>

          {/* Right: Structured Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 space-y-10"
          >
            {features.map((feature) => (
              <div key={feature.id} className="group">
                <div className="flex items-start gap-5">
                  <div className="mt-1 w-12 h-12 shrink-0 rounded-xl bg-metallicGold/10 flex items-center justify-center border border-metallicGold/20 group-hover:bg-metallicGold/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-metallicGold" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-playfair font-bold text-premiumWhite mb-2 group-hover:text-metallicGold transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-premiumWhite/60 leading-relaxed font-light text-lg">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto"
        >
          <a
            href="https://my.tgi.li/register?sponsor=MTUwNzM1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-metallicGold to-goldLight text-charcoal font-bold text-lg shadow-[0_10px_40px_rgba(212,175,55,0.3)] hover:shadow-[0_15px_50px_rgba(212,175,55,0.4)] hover:-translate-y-1 transition-all duration-300 group"
          >
            {t("cta.button")}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </section>

      {/* Footer Decoration */}
      <div className="h-20 bg-gradient-to-t from-black to-transparent opacity-50" />
    </main>
  );
}
