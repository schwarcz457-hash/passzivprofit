import { NextResponse } from "next/server";

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

    // Note: Translations removed as emails are no longer handled by Resend here.
    
    let brevoSuccess = false;
    let brevoResponseData = null;

    // 3a. Brevo Contact Sync (Blocking)
    const apiKey = process.env.BREVO_API_KEY;
    if (apiKey) {
      const maskedKey = `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`;
      console.log(`>>> [API LEAD - ${requestId}] BREVO_API_KEY is present (Masked: ${maskedKey})`);

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
        console.log(`>>> [API LEAD - ${requestId}] Brevo Payload:`, JSON.stringify(brevoPayload, null, 2));

        const brevoRes = await fetch("https://api.brevo.com/v3/contacts", {
          method: "POST",
          headers: {
            "accept": "application/json",
            "api-key": apiKey,
            "content-type": "application/json"
          },
          body: jsonBody
        });

        console.log(`>>> [API LEAD - ${requestId}] Brevo API Status: ${brevoRes.status} ${brevoRes.statusText}`);

        // Biztonságos válaszkezelés (204 No Content esetén nincs body)
        brevoResponseData = null;
        const contentType = brevoRes.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
           brevoResponseData = await brevoRes.json().catch(() => null);
        }
        
        if (brevoRes.ok) {
          brevoSuccess = true;
          console.log(`>>> [API LEAD - ${requestId}] Brevo Sync SUCCESS`, brevoResponseData ? JSON.stringify(brevoResponseData, null, 2) : "(No body)");
        } else if (brevoResponseData?.code === "duplicate_parameter") {
          console.warn(`>>> [API LEAD - ${requestId}] Duplicate parameter (likely phone). Retrying strictly without phone attributes.`);
          
          const retryAttributes: any = {
            FIRSTNAME: name || "Érdeklődő",
            LANG: safeLang || "EN",
            REQUEST_ID: requestId || "unknown"
          };

          const retryPayload = {
            email: email,
            listIds: [3],
            updateEnabled: true,
            attributes: retryAttributes
          };

          const retryRes = await fetch("https://api.brevo.com/v3/contacts", {
            method: "POST",
            headers: {
              "accept": "application/json",
              "api-key": apiKey,
              "content-type": "application/json"
            },
            body: JSON.stringify(retryPayload)
          });

          console.log(`>>> [API LEAD - ${requestId}] Brevo Retry Status: ${retryRes.status} ${retryRes.statusText}`);
          
          brevoResponseData = null;
          const retryContentType = retryRes.headers.get("content-type");
          if (retryContentType && retryContentType.includes("application/json")) {
            brevoResponseData = await retryRes.json().catch(() => null);
          }

          if (retryRes.ok) {
            brevoSuccess = true;
            console.log(`>>> [API LEAD - ${requestId}] Brevo Retry SUCCESS`);
          } else {
            console.error(`>>> [API LEAD - ${requestId}] Brevo Retry FAILED!`, JSON.stringify(brevoResponseData, null, 2));
          }
        } else {
          console.error(`>>> [API LEAD - ${requestId}] Brevo Sync FAILED! Status: ${brevoRes.status}`);
          console.error(`>>> [API LEAD - ${requestId}] Brevo Error Detail:`, JSON.stringify(brevoResponseData, null, 2));
        }
      } catch (brevoErr) {
        console.error(`>>> [API LEAD - ${requestId}] Brevo Fetch Exception:`, brevoErr);
      }
    } else {
      console.error(`>>> [API LEAD - ${requestId}] BREVO_API_KEY is missing from environment variables.`);
    }

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
