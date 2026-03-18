"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Smartphone, Globe, TrendingUp, Users, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LeadForm } from "@/components/LeadForm";

export default function MobilpiacPage() {
  const t = useTranslations("Mobil");
  const locale = useLocale();

  if (locale !== 'hu') {
    return (
      <main className="min-h-screen bg-charcoal text-premiumWhite font-inter overflow-hidden flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl w-full p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl text-center"
          >
            <div className="w-20 h-20 rounded-full bg-metallicGold/10 flex items-center justify-center mx-auto mb-8 border border-metallicGold/20">
              <AlertCircle className="w-10 h-10 text-metallicGold" />
            </div>
            <h1 className="text-3xl font-playfair font-bold mb-6">
              {t("restriction")}
            </h1>
            <div className="w-12 h-1 bg-metallicGold mx-auto mb-8 opacity-50" />
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-metallicGold hover:text-goldLight transition-colors font-medium"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Vissza a főoldalra
            </Link>
          </motion.div>
        </div>
        <Footer />
      </main>
    );
  }

  const features = [
    {
      id: "model",
      icon: ShieldCheck,
      title: t("features.model.title"),
      description: t("features.model.description"),
    },
    {
      id: "passive",
      icon: TrendingUp,
      title: t("features.passive.title"),
      description: t("features.passive.description"),
    },
    {
      id: "support",
      icon: Users,
      title: t("features.support.title"),
      description: t("features.support.description"),
    },
  ];

  return (
    <main className="min-h-screen bg-charcoal text-premiumWhite font-inter overflow-hidden">
      <Navbar />

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
            {t("hero.title")}
          </h1>
          <p className="text-lg md:text-xl text-premiumWhite/70 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            {t("hero.subtitle")}
          </p>
        </motion.div>
      </section>

      {/* Main Content Section: Image + Values */}
      <section className="py-12 md:py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left: Premium Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 relative aspect-square rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/5"
          >
            <Image 
              src="/mobilpiac.png" 
              alt="Mobile Market Professional"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Elegant overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-charcoal/40 to-transparent" />
          </motion.div>

          {/* Right: Value Propositions */}
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

      {/* Lead Form Section */}
      <section id="contact" className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-playfair font-bold mb-6"
          >
            {t("cta.title")}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-premiumWhite/60 text-lg max-w-2xl mx-auto"
          >
            {t("cta.description")}
          </motion.p>
        </div>
        <LeadForm />
      </section>

      <Footer />
    </main>
  );
}
