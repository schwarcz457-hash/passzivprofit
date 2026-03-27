"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useParams } from "next/navigation";

export function LeadForm() {
  const t = useTranslations("LeadForm");
  const tConsent = useTranslations("Consent");
  const locale = useLocale();
  const params = useParams();
  
  // Robust locale detection: URL parameter first, then next-intl hook, then default
  const currentLocale = (params?.locale as string) || locale || "en";
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Összefűzzük az űrlap adatait az aktuális nyelvvel (kényszerített nagybetűs kód)
    const payload = {
      ...data,
      lang: (currentLocale || "en").toUpperCase()
    };

    console.log(">>> [FRONTEND] Submitting LeadForm payload:", payload);

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(">>> [FRONTEND] API error response:", errorData);
        throw new Error("API request failed");
      }

      console.log(">>> [FRONTEND] Submission SUCCESS, setting status to success");
      setStatus("success");
      setMessage("successMessage");
    } catch (error) {
      console.error(">>> [FRONTEND] Submission EXCEPTION:", error);
      setStatus("error");
      setMessage("errorMessage");
    }
  };

  return (
    <section id="contact" className="py-32 bg-black/60 relative flex flex-col items-center justify-center -mb-20">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-metallicGold/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-lg text-center">
        <h2 className="text-4xl md:text-5xl font-playfair font-bold text-premiumWhite mb-4">
          {t("title")}
        </h2>
        <p className="text-premiumWhite/70 font-inter leading-relaxed mb-10">
          {t("subtitle")}
        </p>

        {status === "success" ? (
          <div className="flex flex-col items-center justify-center bg-charcoal p-10 rounded-3xl border border-metallicGold/30 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
            <CheckCircle2 className="w-16 h-16 text-metallicGold mb-4" />
            <h3 className="text-2xl font-playfair font-semibold text-premiumWhite mb-2">{t("successTitle")}</h3>
            <p className="text-premiumWhite/70 text-center font-inter">{t(message)}</p>
            <button onClick={() => setStatus("idle")} className="mt-6 text-sm text-metallicGold hover:underline">
              {t("submitAnother")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left bg-charcoal p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl">
            <div className="flex flex-col">
              <label htmlFor="name" className="text-sm font-medium text-white/50 mb-2 pl-1">{t("namePlaceholder")}</label>
              <input required id="name" name="name" type="text" className="px-5 py-4 bg-white/5 rounded-xl border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-metallicGold/50 focus:ring-1 focus:ring-metallicGold/50 transition-all font-inter" placeholder="John Doe" />
            </div>

            <div className="flex flex-col">
              <label htmlFor="email" className="text-sm font-medium text-white/50 mb-2 pl-1">{t("emailPlaceholder")}</label>
              <input required id="email" name="email" type="email" className="px-5 py-4 bg-white/5 rounded-xl border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-metallicGold/50 focus:ring-1 focus:ring-metallicGold/50 transition-all font-inter" placeholder="john@example.com" />
            </div>

            <div className="flex flex-col">
              <label htmlFor="phone" className="text-sm font-medium text-white/50 mb-2 pl-1">{t("phonePlaceholder")}</label>
              <input required id="phone" name="phone" type="tel" className="px-5 py-4 bg-white/5 rounded-xl border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-metallicGold/50 focus:ring-1 focus:ring-metallicGold/50 transition-all font-inter" placeholder="+36 30 123 4567" />
            </div>

            <div className="flex items-start gap-3 mt-2 pl-1">
              <input required type="checkbox" id="consent" name="consent" className="mt-1 w-5 h-5 rounded border-white/20 bg-charcoal text-metallicGold" />
              <label htmlFor="consent" className="text-sm font-medium text-white/60 leading-relaxed">
                {tConsent.rich("checkboxText", {
                  link: (chunks: React.ReactNode) => (
                    <Link href="/privacy" className="text-metallicGold hover:underline">
                      {chunks}
                    </Link>
                  )
                })}
              </label>
            </div>

            <button type="submit" disabled={status === "loading"} className="mt-4 w-full group relative inline-flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-metallicGold to-goldLight text-charcoal font-bold text-lg rounded-xl overflow-hidden transition-all duration-300 disabled:opacity-70">
              <span className="relative z-10 flex items-center gap-2">
                {status === "loading" ? <>Processing... <Loader2 className="w-5 h-5 animate-spin" /></> : <>{t("submitButton")} <Send className="w-5 h-5 -rotate-12 group-hover:rotate-0 transition-transform" /></>}
              </span>
            </button>
          </form>
        )}
      </div>
    </section>
  );
}