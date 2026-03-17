"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRight, ShieldCheck, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-charcoal pt-20 overflow-hidden">
      {/* Dynamic Background Elements with Unsplash Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1618044733300-9472054094ee?q=80&w=2671&auto=format&fit=crop"
          alt="Luxury Gold Context"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-20 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/80 to-charcoal/40" />
        
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-metallicGold/5 rounded-full blur-[120px] mix-blend-screen -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-metallicGold/10 rounded-full blur-[150px] mix-blend-screen translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          
          <div className="relative group cursor-help z-50 inline-block">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-metallicGold/30 bg-metallicGold/5 backdrop-blur-sm mb-8"
            >
              <ShieldCheck className="w-4 h-4 text-metallicGold" />
              <span className="text-sm font-medium text-premiumWhite/90 tracking-wide">
                Mindenuncia Physical Gold
              </span>
            </motion.div>
            <div className="absolute top-1/2 mt-4 left-1/2 -translate-x-1/2 w-72 p-3 bg-neutral-900 border border-metallicGold/20 rounded-lg shadow-2xl text-xs text-premiumWhite/80 text-center opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none">
              {t("badgeTooltip")}
            </div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-playfair font-bold text-premiumWhite tracking-[0.05em] leading-[1.1] mb-6"
          >
            {t("title")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-premiumWhite/70 font-inter max-w-2xl leading-relaxed mb-12"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-6"
          >
            <a
              href="https://my.tgi.li/de/register?sponsor=MTUwNzM1"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-metallicGold to-goldLight text-charcoal font-semibold rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:-translate-y-1 w-full sm:w-auto"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
              <span className="relative text-base tracking-wide z-10 flex items-center gap-2">
                {t("cta")}
                <TrendingUp className="w-5 h-5" />
              </span>
            </a>

            <a
              href="#contact"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-premiumWhite font-medium rounded-full border border-white/20 transition-all duration-300 hover:border-metallicGold/50 hover:bg-white/5 w-full sm:w-auto"
            >
              {t("secondaryCta")}
              <ArrowRight className="w-4 h-4 text-metallicGold group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
