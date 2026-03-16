import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata({ params }: { params: Promise<{locale: string}> }): Promise<Metadata> {
  const {locale} = await params;
  
  if (locale === 'hu') {
    return {
      title: "Arany Passzív Profit | Fizikai Arany Megtakarítás & Bónuszok",
      description: "Biztosítsa vagyonát fizikai arannyal. Havi megtakarítási terv 6.5% várható hozammal és exkluziv ajánlói bónuszokkal.",
      keywords: ["arany megtakarítás", "passzív jövedelem", "XAU", "fizikai arany", "vagyonvédelem"]
    };
  }

  return {
    title: "Gold Passive Profit | Physical Gold Savings & Rewards",
    description: "Secure your wealth with physical gold. Monthly savings plan with 6.5% expected appreciation and exclusive referral bonuses.",
    keywords: ["gold savings", "passive income", "XAU", "physical gold", "wealth protection"]
  };
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {

  // Fetch locale
  const {locale} = await params;
  
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased min-h-screen flex flex-col">
        <NextIntlClientProvider messages={messages}>
          {children}
          <Footer />
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
