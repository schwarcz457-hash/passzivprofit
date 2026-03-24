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

    // 2. Prepare Emails (Admin only, customer handled by Brevo)
    // No longer rendering CustomerConfirmation for Resend
    
    // 3. Parallel Dispatch: Brevo Contact + Resend Admin Notify + Google Sheets
    console.log(`>>> [API LEAD - ${requestId}] Dispatching to CRM and Notify...`);
    
    const operations = [];

    // 3a. Brevo Contact Sync
    if (process.env.BREVO_API_KEY) {
      operations.push(
        fetch("https://api.brevo.com/v3/contacts", {
          method: "POST",
          headers: {
            "accept": "application/json",
            "api-key": process.env.BREVO_API_KEY,
            "content-type": "application/json"
          },
          body: JSON.stringify({
            email: email,
            listIds: [2],
            updateEnabled: true,
            attributes: {
              FIRSTNAME: name,
              SMS: phone, // or SMS_NUMBER depending on Brevo config
              LANGUAGE: safeLang,
              REQUEST_ID: requestId
            }
          })
        }).then(res => res.json()).then(data => console.log(`>>> [API LEAD - ${requestId}] Brevo Response:`, data))
      );
    }

    // 3b. Resend Admin Notification
    operations.push(
      resend.emails.send({
        from: "Passzív Profit | Rendszer <system@passzivprofit.com>",
        to: "schwarcz457@gmail.com",
        subject: `Érdeklődő: ${name} [ID:${requestId}]`,
        html: `<p>Név: ${name}</p><p>Email: ${email}</p><p>Telefon: ${phone}</p><p>Nyelv: ${safeLang}</p><p>Request ID: ${requestId}</p>`,
      })
    );

    // 3c. Google Sheets Persistence
    if (process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL) {
      operations.push(
        fetch(process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify({ name, email, phone, lang: safeLang, requestId }),
        })
      );
    }

    await Promise.allSettled(operations);

    return NextResponse.json({ success: true, requestId });
  } catch (error) {
    console.error(`[API LEAD - ${requestId}] Critical Error:`, error);
    return NextResponse.json({ error: "Service Unavailable", requestId }, { status: 500 });
  }
}
