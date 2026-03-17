import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import "./globals.css";

// 1. Statikus export kényszerítése és a 9 nyelv definiálása
export const dynamic = 'force-static';

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

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const { locale } = await params;

  if (locale === 'hu') {
    return {
      title: "Arany Passzív Profit | Fizikai Arany Megtakarítás & Bónuszok",
      description: "Biztosítsa vagyonát fizikai arannyal. Havi megtakarítási terv 6.5% várható hozammal és exkluziv ajánlói bónuszokkal.",
      keywords: ["arany megtakarítás", "passzív jövedelem", "XAU", "fizikai arany", "vagyonvédelem"]
    };
  }

  // Alapértelmezett (angol) metaadatok minden más nyelvhez
  return {
    title: "Gold Passive Profit | Physical Gold Savings & Rewards",
    description: "Secure your wealth with physical gold. Monthly savings plan with 6.5% expected appreciation and exclusive referral bonuses.",
    keywords: ["gold savings", "passive income", "XAU", "physical gold", "wealth protection"]
  };
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: any;
}) {
  // A params feloldása statikus módban
  const { locale } = await params;

  // Üzenetek betöltése (next-intl automatikusan tudja, melyiket kell a locale alapján)
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased min-h-screen flex flex-col">
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
          <Footer />
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}