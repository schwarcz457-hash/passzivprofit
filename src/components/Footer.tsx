import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function Footer() {
  const t = useTranslations("Consent");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-black py-8 border-t border-white/10 mt-auto">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-premiumWhite/50 text-sm font-inter">
          &copy; {currentYear} Aranyad. All rights reserved.
        </p>
        
        <div className="flex items-center gap-6">
          <Link 
            href="/adatvedelem" 
            className="text-sm font-inter text-premiumWhite/60 hover:text-metallicGold transition-colors"
          >
            {t("privacyLink")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
