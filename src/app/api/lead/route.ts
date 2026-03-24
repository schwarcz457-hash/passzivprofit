import { Resend } from "resend";
import { CustomerConfirmation } from "@/emails/CustomerConfirmation";
import { NextResponse } from "next/server";
import { render } from "@react-email/render";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const requestId = Math.random().toString(36).substring(7);
  try {
    const { name, email, phone, lang } = await req.json();
    console.log(`>>> [API LEAD - ${requestId}] Incoming request:`, { name, email, phone, lang });

    const validLocales = ['hu', 'en', 'de', 'fr', 'ro', 'es', 'it', 'sk', 'pl'];
    const safeLang = validLocales.includes(lang) ? lang : 'hu';

    // 1. Get translations
    const messages = (await import(`@/messages/${safeLang}.json`)).default;
    const t = (key: string) => messages.Email ? (messages.Email[key] || key) : key;

    // 2. Prepare Emails
    const customerEmailHtml = await render(CustomerConfirmation({ name, email, locale: safeLang, t }));
    
    // 3. Send Emails in Parallel
    console.log(`>>> [API LEAD - ${requestId}] Dispatching emails...`);
    await Promise.all([
      resend.emails.send({
        from: "Passzív Profit | Ügyfélszolgálat <info@passzivprofit.com>",
        to: email, // Real customer email
        replyTo: "schwarcz457@gmail.com",
        subject: `${t("customerSubject")} [ID:${requestId}]`,
        html: customerEmailHtml,
      }),
      resend.emails.send({
        from: "Passzív Profit | Rendszer <system@passzivprofit.com>",
        to: "schwarcz457@gmail.com", // Admin email
        subject: `Érdeklődő: ${name} [ID:${requestId}]`,
        html: `<p>Név: ${name}</p><p>Email: ${email}</p><p>Telefon: ${phone}</p><p>Nyelv: ${safeLang}</p><p>Request ID: ${requestId}</p>`,
      })
    ]);

    // 4. Google Sheets (Persistence)
    if (process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL) {
      try {
        await fetch(process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify({ name, email, phone, lang: safeLang, requestId }),
        });
      } catch (gsError) {
        console.error(`[API LEAD - ${requestId}] GS Error:`, gsError);
      }
    }

    return NextResponse.json({ success: true, requestId });
  } catch (error) {
    console.error(`[API LEAD - ${requestId}] Critical Error:`, error);
    return NextResponse.json({ error: "Service Unavailable", requestId }, { status: 500 });
  }
}
