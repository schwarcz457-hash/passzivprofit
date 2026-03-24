import { getTranslations, setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/Navbar";

export function generateStaticParams() {
  return [
    { locale: 'hu' },
    { locale: 'en' },
    { locale: 'de' },
    { locale: 'fr' },
    { locale: 'ro' },
    { locale: 'es' },
    { locale: 'it' },
    { locale: 'sk' },
    { locale: 'pl' }
  ];
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Privacy");

  return (
    <div className="bg-black min-h-screen text-premiumWhite pt-24">
      <Navbar />
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="font-playfair font-bold text-4xl md:text-5xl text-metallicGold mb-4">
          {t("title")}
        </h1>
        <p className="text-premiumWhite/60 mb-12 font-inter italic">
          {t("lastUpdated")}
        </p>

        <div className="space-y-12 font-inter leading-relaxed">
          {/* Adatkezelő */}
          <section className="bg-charcoal/30 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-playfair font-semibold text-goldLight mb-6">
              {t("controller.title")}
            </h2>
            <div className="space-y-2 text-premiumWhite/80">
              <p>{t("controller.name")}</p>
              <p>{t("controller.address")}</p>
              <p>{t("controller.taxNumber")}</p>
              <p className="text-metallicGold">{t("controller.email")}</p>
            </div>
          </section>

          {/* Kezelt adatok */}
          <section>
            <h2 className="text-2xl font-playfair font-semibold text-goldLight mb-6">
              {t("dataCollection.title")}
            </h2>
            <div className="space-y-4 text-premiumWhite/80">
              <div className="bg-white/5 border-l-4 border-metallicGold p-4 rounded-r-lg">
                <p>{t("dataCollection.personal")}</p>
              </div>
              <p className="p-4">{t("dataCollection.technical")}</p>
            </div>
          </section>

          {/* Adatfeldolgozók */}
          <section className="bg-charcoal/30 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-playfair font-semibold text-goldLight mb-6">
              {t("processors.title")}
            </h2>
            <ul className="space-y-4 text-premiumWhite/80">
              <li className="flex flex-col">
                <span className="font-semibold text-premiumWhite">{t("processors.vercel.name")}</span>
                <span className="text-sm opacity-70">{t("processors.vercel.address")}</span>
              </li>
              <li className="flex flex-col">
                <span className="font-semibold text-premiumWhite">{t("processors.bluehost.name")}</span>
                <span className="text-sm opacity-70">{t("processors.bluehost.address")}</span>
              </li>
              <li className="flex flex-col">
                <span className="font-semibold text-premiumWhite">{t("processors.google.name")}</span>
                <span className="text-sm opacity-70">{t("processors.google.text")}</span>
              </li>
            </ul>
          </section>

          {/* Jogok */}
          <section>
            <h2 className="text-2xl font-playfair font-semibold text-goldLight mb-6">
              {t("rights.title")}
            </h2>
            <p className="text-premiumWhite/80">
              {t("rights.text")}
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
