"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function CookieBanner() {
  const t = useTranslations("Cookie");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookieConsent = localStorage.getItem("cookieConsent");
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6"
        >
          <div className="container mx-auto max-w-4xl">
            <div className="bg-charcoal/95 backdrop-blur-md border border-metallicGold/30 p-5 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-premiumWhite/80 text-sm font-inter text-center sm:text-left flex-1">
                {t("message")}
              </p>
              <button
                onClick={handleAccept}
                className="whitespace-nowrap px-8 py-3 bg-metallicGold text-charcoal font-semibold rounded-full hover:bg-goldLight transition-colors w-full sm:w-auto text-sm"
              >
                {t("accept")}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
