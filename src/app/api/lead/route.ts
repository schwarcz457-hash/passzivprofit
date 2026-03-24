import { Resend } from "resend";
import { CustomerConfirmation } from "@/emails/CustomerConfirmation";
import { NextResponse } from "next/server";
import { render } from "@react-email/render";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, lang } = body;

    // 1. Get translations for the specific locale
    // Since we are in an API route, we load the JSON directly
    const messages = (await import(`@/messages/${lang}.json`)).default;
    const t = (key: string) => messages.Email[key] || key;

    // 2. Send Customer Confirmation Email
    const customerEmailHtml = await render(
      CustomerConfirmation({ name, locale: lang, t })
    );

    await resend.emails.send({
      from: "Passzív Profit | Ügyfélszolgálat <info@passzivprofit.com>", // Verify this domain in Resend
      to: email,
      subject: t("customerSubject"),
      html: customerEmailHtml,
    });

    // 3. Send Admin Notification Email
    await resend.emails.send({
      from: "Passzív Profit | Rendszer <system@passzivprofit.com>",
      to: "schwarcz@mobilcomgsm.hu", // User's email from the prompt
      subject: t("adminSubject").replace("{name}", name).replace("{locale}", lang),
      html: `
        <div style="font-family: sans-serif; padding: 20px; background: #f9f9f9;">
          <h2>Új érdeklődő érkezett!</h2>
          <p><strong>Név:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Telefon:</strong> ${phone}</p>
          <p><strong>Nyelv:</strong> ${lang}</p>
          <hr />
          <p>Ez egy automatikus értesítés a Passzív Profit rendszertől.</p>
        </div>
      `,
    });

    // 4. Forward to Google Sheets (Original Logic)
    // We do this in the background or await it to ensure data saving
    if (process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL) {
      try {
        await fetch(process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify({ name, email, phone, lang }),
        });
      } catch (gsError) {
        console.error("Google Sheets error:", gsError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
