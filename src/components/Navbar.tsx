"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { LanguageSelector } from "./LanguageSelector";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const t = useTranslations();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/gold#benefits", label: t("Navigation.benefits") },
    { href: "/gold#how-it-works", label: t("Navigation.howItWorks") },

    { href: "/gold#contact", label: t("Navigation.contact") },
  ];

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-charcoal/80 backdrop-blur-md border-b border-white/10 shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-metallicGold to-goldLight flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)] group-hover:shadow-[0_0_20px_rgba(212,175,55,0.6)] transition-shadow">
                <span className="text-charcoal font-playfair font-bold text-lg">A</span>
              </div>
              <span className="font-playfair font-bold text-xl tracking-[0.05em] text-premiumWhite">
                {t("Branding.logoText")}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href as any}
                  className="text-sm font-medium text-premiumWhite/80 hover:text-metallicGold transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="w-px h-5 bg-white/20 mx-2"></div>
              <LanguageSelector />
            </nav>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center gap-4">
              <LanguageSelector />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-premiumWhite hover:text-metallicGold transition-colors focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden pt-6 pb-4 border-t border-white/10 mt-4 flex flex-col gap-4 animate-in slide-in-from-top-4 fade-in bg-charcoal/95 p-4 rounded-b-2xl">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href as any}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-premiumWhite/90 hover:text-metallicGold tracking-wide"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>
    </>
  );
}
