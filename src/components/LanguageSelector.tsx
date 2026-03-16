"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const switchLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  const languages = [
    { code: "hu", label: "HU" },
    { code: "en", label: "EN" },
    { code: "de", label: "DE" },
    { code: "fr", label: "FR" },
    { code: "ro", label: "RO" },
    { code: "es", label: "ES" },
    { code: "it", label: "IT" },
    { code: "sk", label: "SK" },
    { code: "pl", label: "PL" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Select Language, currently ${locale.toUpperCase()}`}
        className="flex items-center gap-1 px-2 py-1 text-sm font-medium text-premiumWhite hover:text-metallicGold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-metallicGold/50 rounded"
      >
        {locale.toUpperCase()}
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div 
          role="listbox"
          className="absolute right-0 mt-2 w-24 rounded-md shadow-lg bg-charcoal border border-charcoal-light/20 ring-1 ring-black ring-opacity-5 z-50"
        >
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                role="option"
                aria-selected={locale === lang.code}
                onClick={() => switchLanguage(lang.code)}
                className={`block w-full text-left px-4 py-2 text-sm focus:outline-none focus-visible:bg-white/10 ${
                  locale === lang.code
                    ? "text-metallicGold font-semibold"
                    : "text-premiumWhite hover:bg-white/5 hover:text-metallicGold"
                } transition-colors`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
