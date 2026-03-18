import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/Navbar";

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = useTranslations("Privacy");

  return (
    <main className="flex flex-col min-h-screen bg-charcoal selection:bg-metallicGold/30 selection:text-premiumWhite">
      <Navbar />
      
      <section className="pt-32 pb-20 px-6 container mx-auto max-w-4xl flex-grow">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-sm">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-premiumWhite mb-4">
            {t("title")}
          </h1>
          <p className="text-sm text-premiumWhite/50 font-inter mb-10">
            {t("lastUpdated")}
          </p>

          <div className="space-y-8 font-inter text-premiumWhite/80 leading-relaxed">
            <div>
              <p className="text-lg">{t("introduction")}</p>
            </div>

            <div>
              <h2 className="text-2xl font-playfair font-semibold text-metallicGold mb-3">
                1. {t("dataCollection")}
              </h2>
              <p>{t("dataCollectionText")}</p>
            </div>

            <div>
              <h2 className="text-2xl font-playfair font-semibold text-metallicGold mb-3">
                2. {t("purpose")}
              </h2>
              <p>{t("purposeText")}</p>
            </div>

            <div>
              <h2 className="text-2xl font-playfair font-semibold text-metallicGold mb-3">
                3. {t("storage")}
              </h2>
              <p>{t("storageText")}</p>
            </div>

            <div>
              <h2 className="text-2xl font-playfair font-semibold text-metallicGold mb-3">
                4. {t("rights")}
              </h2>
              <p>{t("rightsText")}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
