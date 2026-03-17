"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Coins, TrendingUp, Smartphone, ArrowRight, ExternalLink } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";

export default function HubPage() {
  const t = useTranslations("Hub");
  
  const pathways = [
    {
      title: t("pathways.gold.title"),
      description: t("pathways.gold.description"),
      icon: Coins,
      href: "/gold",
      cta: t("pathways.gold.cta"),
      isExternal: false,
      isAvailable: true,
      popular: true,
      badge: t("pathways.gold.badge")
    },
    {
      title: t("pathways.bybit.title"),
      description: t("pathways.bybit.description"),
      icon: TrendingUp,
      href: "https://www.bybit.eu/en-EU/invite/?ref=NX2RLXO",
      cta: t("pathways.bybit.cta"),
      isExternal: true,
      isAvailable: true,
      popular: false,
    },
    {
      title: t("pathways.telecom.title"),
      description: t("pathways.telecom.description"),
      icon: Smartphone,
      href: "#",
      cta: t("pathways.telecom.cta"),
      isExternal: false,
      isAvailable: false,
      popular: false,
    }
  ];

  return (
    <main className="min-h-screen bg-charcoal flex flex-col items-center justify-center py-20 px-6 relative overflow-hidden">
      {/* Language Selector */}
      <div className="absolute top-6 right-6 z-50">
        <LanguageSelector />
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-metallicGold/5 rounded-full blur-[120px] mix-blend-screen -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-metallicGold/10 rounded-full blur-[150px] mix-blend-screen translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-6xl w-full">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 flex justify-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-metallicGold to-goldLight flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.4)]">
              <span className="text-charcoal font-playfair font-bold text-3xl">P</span>
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-premiumWhite mb-4"
          >
            {t("title")} <span className="text-metallicGold">{t("titleAccent")}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-premiumWhite/70 max-w-2xl mx-auto font-inter"
          >
            {t("description")}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-20">
          {pathways.map((path, index) => {
            const Icon = path.icon;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
                className={`relative group rounded-3xl p-px transition-all duration-500 hover:-translate-y-2 ${
                  path.popular ? "bg-gradient-to-b from-metallicGold via-metallicGold/20 to-transparent shadow-[0_0_40px_rgba(212,175,55,0.15)]" : "bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative h-full bg-charcoal/90 backdrop-blur-xl rounded-3xl p-8 flex flex-col flex-1 border border-white/5">
                  {path.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-metallicGold text-charcoal text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                      {path.badge}
                    </div>
                  )}
                  
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:border-metallicGold/30 group-hover:bg-metallicGold/10 transition-colors duration-500">
                    <Icon className="w-7 h-7 text-metallicGold" />
                  </div>
                  
                  <h3 className="text-2xl font-playfair font-bold text-premiumWhite mb-3 group-hover:text-metallicGold transition-colors duration-300">
                    {path.title}
                  </h3>
                  
                  <p className="text-premiumWhite/70 font-inter text-sm mb-8 leading-relaxed flex-grow">
                    {path.description}
                  </p>
                  
                  <div className="mt-auto">
                    {path.isAvailable ? (
                      path.isExternal ? (
                        <a
                          href={path.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 text-premiumWhite font-medium border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                        >
                          {path.cta}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                      <Link
                        href={path.href as any}
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-metallicGold to-goldLight text-charcoal font-semibold hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all duration-300"
                      >
                        {path.cta}
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      )
                    ) : (
                      <button
                        disabled
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 text-premiumWhite/30 font-medium border border-white/5 cursor-not-allowed"
                      >
                        {path.cta}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
