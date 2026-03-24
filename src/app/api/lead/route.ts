import { Resend } from "resend";
import { CustomerConfirmation } from "@/emails/CustomerConfirmation";
import { NextResponse } from "next/server";
import { render } from "@react-email/render";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, phone, lang } = await req.json();
    const validLocales = ['hu', 'en', 'de', 'fr', 'ro', 'es', 'it', 'sk', 'pl'];
    const safeLang = validLocales.includes(lang) ? lang : 'en';

    // 1. Get translations
    const messages = (await import(`@/messages/${safeLang}.json`)).default;
    const t = (key: string) => messages.Email ? (messages.Email[key] || key) : key;

    // 2. Customer Email (Professional)
    const customerEmailHtml = await render(CustomerConfirmation({ name, locale: safeLang, t }));
    await resend.emails.send({
      from: "Passzív Profit | Ügyfélszolgálat <onboarding@resend.dev>",
      to: "schwarcz457@gmail.com",
      subject: t("customerSubject"),
      html: customerEmailHtml,
    });

    // 3. Admin Email (Simple)
    await resend.emails.send({
      from: "Passzív Profit | Rendszer <onboarding@resend.dev>",
      to: "schwarcz457@gmail.com",
      subject: `Érdeklődő: ${name}`,
      html: `<p>Név: ${name}</p><p>Email: ${email}</p><p>Telefon: ${phone}</p><p>Nyelv: ${safeLang}</p>`,
    });

    // 4. Google Sheets (Persistence)
    if (process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL) {
      await fetch(process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ name, email, phone, lang: safeLang }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Critical API Error:", error);
    return NextResponse.json({ error: "Service Unavailable" }, { status: 500 });
  }
}
