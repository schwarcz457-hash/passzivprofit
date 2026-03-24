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

    // 1. Get translations for the specific locale
    console.log(">>> [API LEAD] Loading messages for:", lang);
    const messages = (await import(`@/messages/${lang}.json`)).default;
    const t = (key: string) => messages.Email[key] || key;

    // 2. Send Customer Confirmation Email
    console.log(">>> [API LEAD] Rendering email for customer");
    const customerEmailHtml = await render(
       CustomerConfirmation({ name, locale: lang, t })
    );

    console.log(">>> [API LEAD] Sending customer email via Resend to schwarcz457@gmail.com (Test Mode)");
    const customerResult = await resend.emails.send({
      from: "Passzív Profit | Ügyfélszolgálat <onboarding@resend.dev>",
      to: "schwarcz457@gmail.com", // Changed as requested for test mode
      subject: t("customerSubject"),
      html: customerEmailHtml,
    });
    console.log(">>> [API LEAD] Customer email result:", customerResult);

    // 3. Send Admin Notification Email
    console.log(">>> [API LEAD] Sending admin notification to schwarcz457@gmail.com (Test Mode)");
    const adminResult = await resend.emails.send({
      from: "Passzív Profit | Rendszer <onboarding@resend.dev>",
      to: "schwarcz457@gmail.com", // Changed as requested for test mode
      subject: t("adminSubject").replace("{name}", name).replace("{locale}", lang),
      html: `
        <div style="font-family: sans-serif; padding: 20px; background: #f9f9f9;">
          <h2>Új érdeklődő érkezett!</h2>
          <p><strong>Név:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email} (Eredeti cím)</p>
          <p><strong>Telefon:</strong> ${phone}</p>
          <p><strong>Nyelv:</strong> ${lang}</p>
          <hr />
          <p>Ez egy automatikus értesítés a Passzív Profit rendszertől.</p>
        </div>
      `,
    });
    console.log(">>> [API LEAD] Admin email result:", adminResult);

    // 4. Forward to Google Sheets (Original Logic)
    if (process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL) {
      console.log(">>> [API LEAD] Forwarding to Google Sheets:", process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL);
      try {
        const gsResponse = await fetch(process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify({ name, email, phone, lang }),
        });
        console.log(">>> [API LEAD] Google Sheets response status:", gsResponse.status);
      } catch (gsError) {
        console.error(">>> [API LEAD] Google Sheets error:", gsError);
      }
    } else {
      console.warn(">>> [API LEAD] NEXT_PUBLIC_GOOGLE_SCRIPT_URL is missing!");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(">>> [API LEAD] CRITICAL ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
