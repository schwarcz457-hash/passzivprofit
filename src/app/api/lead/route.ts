import { Resend } from "resend";
import { CustomerConfirmation } from "@/emails/CustomerConfirmation";
import { NextResponse } from "next/server";
import { render } from "@react-email/render";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, lang } = body;
    console.log(">>> [API LEAD] Incoming request:", { name, email, phone, lang });

    // 0. Validate language
    const validLocales = ['hu', 'en', 'de', 'fr', 'ro', 'es', 'it', 'sk', 'pl'];
    const safeLang = validLocales.includes(lang) ? lang : 'en';

    // 1. Get translations for the specific locale
    let messages;
    try {
      console.log(">>> [API LEAD] Loading messages for:", safeLang);
      messages = (await import(`@/messages/${safeLang}.json`)).default;
    } catch (importError) {
      console.error(">>> [API LEAD] FAILED to load translations:", importError);
      return NextResponse.json({ error: "Translation load failed" }, { status: 500 });
    }
    
    const t = (key: string) => {
      if (!messages || !messages.Email) return key;
      return messages.Email[key] || key;
    }

    // 2. Send Customer Confirmation Email
    try {
      console.log(">>> [API LEAD] Sending customer email");
      const customerEmailHtml = await render(
        CustomerConfirmation({ name, locale: safeLang, t })
      );

      await resend.emails.send({
        from: "Passzív Profit | Ügyfélszolgálat <onboarding@resend.dev>",
        to: "schwarcz457@gmail.com", // Test mode recipient
        subject: t("customerSubject"),
        html: customerEmailHtml,
      });
    } catch (customerEmailError) {
      console.error(">>> [API LEAD] CUSTOMER EMAIL ERROR:", customerEmailError);
    }

    // 3. Send Admin Notification Email
    try {
      console.log(">>> [API LEAD] Sending admin notification");
      await resend.emails.send({
        from: "Passzív Profit | Rendszer <onboarding@resend.dev>",
        to: "schwarcz457@gmail.com", // Test mode recipient
        subject: `Új érdeklődő: ${name} (${safeLang})`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; background: #f9f9f9;">
            <h2>Új érdeklődő érkezett!</h2>
            <p><strong>Név:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Telefon:</strong> ${phone}</p>
            <p><strong>Nyelv:</strong> ${safeLang}</p>
            <hr />
            <p>Ez egy automatikus értesítés a Passzív Profit rendszertől.</p>
          </div>
        `,
      });
    } catch (adminEmailError) {
      console.error(">>> [API LEAD] ADMIN EMAIL ERROR:", adminEmailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(">>> [API LEAD] CRITICAL ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
