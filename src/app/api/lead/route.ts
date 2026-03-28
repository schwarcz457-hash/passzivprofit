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
