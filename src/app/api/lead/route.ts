import { Resend } from "resend";
import { CustomerConfirmation } from "@/emails/CustomerConfirmation";
import { NextResponse } from "next/server";
import { render } from "@react-email/render";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const requestId = Math.random().toString(36).substring(7);
  try {
    const rawData = await req.json();
    const { name, email, phone, lang } = rawData;
    // Végleges tisztítás: Csak az alapvető infót hagyjuk meg a kezdésnél
    console.log(`>>> [API LEAD - ${requestId}] Incoming request for: ${email}`, JSON.stringify(rawData, null, 2));

    const validLocales = ['hu', 'en', 'de', 'fr', 'ro', 'es', 'it', 'sk', 'pl'];
    const safeLang = (lang && validLocales.includes(lang.toLowerCase())) ? lang.toUpperCase() : 'EN';
    
    // 0. Phone Number Formatting & Validation (E.164 fail-safe)
    let formattedPhone = (phone || "").replace(/[^\d+]/g, "");
    if (formattedPhone.startsWith("00")) {
      formattedPhone = "+" + formattedPhone.substring(2);
    }
    if (formattedPhone.startsWith("06") && formattedPhone.length === 11) {
      formattedPhone = "+36" + formattedPhone.substring(2);
    }
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+" + formattedPhone;
    }

    const isPhoneValid = formattedPhone.length >= 10 && formattedPhone.length <= 15;
    const finalPhone = isPhoneValid ? formattedPhone : null;

    if (!isPhoneValid && phone) {
      console.warn(`>>> [API LEAD - ${requestId}] Invalid Phone formatting skip for Brevo but continuing.`);
    }

    // 1. Get translations
    const messages = (await import(`@/messages/${safeLang.toLowerCase()}.json`)).default;
    const t = (key: string) => messages.Email ? (messages.Email[key] || key) : key;

    // 2. Prepare Emails (Admin only, customer handled by Brevo)
    // No longer rendering CustomerConfirmation for Resend
    
    // 3. Dispatch: Brevo Contact (Blocking) + Resend Admin Notify & Google Sheets (Parallel)
    
    let brevoSuccess = false;
    let brevoResponseData = null;

    // 3a. Brevo Contact Sync (Blocking)
    if (process.env.BREVO_API_KEY) {
      try {
        const brevoAttributes: any = {
          FIRSTNAME: name || "Érdeklődő",
          LANG: safeLang || "EN",
          REQUEST_ID: requestId || "unknown",
        };

        if (finalPhone) {
          brevoAttributes.SMS = finalPhone;
          brevoAttributes.WA_NUMBER = finalPhone;
        }

        const brevoPayload: any = {
          email: email,
          listIds: [3],
          updateEnabled: true,
          attributes: brevoAttributes
        };

        const jsonBody = JSON.stringify(brevoPayload);
        console.log(`>>> [API LEAD - ${requestId}] Brevo Body for Fetch:`, jsonBody);

        console.log(`>>> [API LEAD - ${requestId}] Brevo Payload:`, JSON.stringify(brevoPayload, null, 2));

        // Note: attributes are already merged above

        const brevoRes = await fetch("https://api.brevo.com/v3/contacts", {
          method: "POST",
          headers: {
            "accept": "application/json",
            "api-key": process.env.BREVO_API_KEY,
            "content-type": "application/json"
          },
          body: JSON.stringify(brevoPayload)
        });

        brevoResponseData = await brevoRes.json();
        
        if (brevoRes.ok) {
          brevoSuccess = true;
          console.log(`>>> [API LEAD - ${requestId}] Brevo Sync SUCCESS:`, JSON.stringify(brevoResponseData, null, 2));
        } else if (brevoResponseData?.code === "duplicate_parameter") {
          // Telefonszám ütközés esetén újrapróbáljuk SZIGORÚAN a telefonszám mezők NÉLKÜL
          console.warn(`>>> [API LEAD - ${requestId}] Duplicate parameter (likely phone). Retrying strictly without phone attributes for List #3.`);
          
          const retryAttributes: any = {
            FIRSTNAME: name,
            LANG: safeLang,
            REQUEST_ID: requestId
          };

          const retryPayload = {
            email: email,
            listIds: [3], // Szigorúan ID3
            updateEnabled: true,
            attributes: retryAttributes
          };

          console.log(`>>> [API LEAD - ${requestId}] Brevo Retry Payload:`, JSON.stringify(retryPayload, null, 2));

          const retryRes = await fetch("https://api.brevo.com/v3/contacts", {
            method: "POST",
            headers: {
              "accept": "application/json",
              "api-key": process.env.BREVO_API_KEY,
              "content-type": "application/json"
            },
            body: JSON.stringify(retryPayload)
          });

          brevoResponseData = await retryRes.json();
          if (retryRes.ok) {
            brevoSuccess = true;
            console.log(`>>> [API LEAD - ${requestId}] Brevo Retry SUCCESS:`, JSON.stringify(brevoResponseData, null, 2));
          } else {
            console.error(`>>> [API LEAD - ${requestId}] Brevo Retry FAILED!`, JSON.stringify(brevoResponseData, null, 2));
          }
        } 
else {
          console.error(`>>> [API LEAD - ${requestId}] Brevo Sync FAILED! Status: ${brevoRes.status}`);
          console.error(`>>> [API LEAD - ${requestId}] Brevo Error Detail:`, JSON.stringify(brevoResponseData, null, 2));
        }
      } catch (brevoErr) {
        console.error(`>>> [API LEAD - ${requestId}] Brevo Fetch Exception:`, brevoErr);
      }
    } else {
      console.error(`>>> [API LEAD - ${requestId}] BREVO_API_KEY is missing from environment variables.`);
    }

    // 3b & 3c. Parallel Notifications (Admin Notify + Google Sheets)
    // We start these but don't strictly block the CRM success on them if they fail
    const backgroundOps = [];

    // Resend Admin Notification
    backgroundOps.push(
      resend.emails.send({
        from: "Passzív Profit | Rendszer <system@passzivprofit.com>",
        to: "schwarcz457@gmail.com",
        subject: `Érdeklődő: ${name} [ID:${requestId}]`,
        html: `<p>Név: ${name}</p><p>Email: ${email}</p><p>Telefon: ${phone}</p><p>Nyelv: ${safeLang}</p><p>Request ID: ${requestId}</p>`,
      })
    );

    // Google Sheets Persistence
    if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
      backgroundOps.push(
        fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
          method: "POST",
          body: JSON.stringify({ name, email, phone, lang: safeLang, requestId }),
        })
      );
    }

    // Wait for background ops but we primarily care about Brevo for the response
    await Promise.allSettled(backgroundOps);

    if (brevoSuccess) {
      return NextResponse.json({ success: true, requestId });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "CRM_SYNC_FAILED", 
        requestId,
        details: brevoResponseData 
      }, { status: 500 });
    }
  } catch (error) {
    console.error(`[API LEAD - ${requestId}] Critical Error:`, error);
    return NextResponse.json({ error: "Service Unavailable", requestId }, { status: 500 });
  }
}
