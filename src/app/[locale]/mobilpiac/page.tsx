import { setRequestLocale } from "next-intl/server";
import { MobilpiacPageClient } from "@/components/MobilpiacPageClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <MobilpiacPageClient />;
}
